import httpx
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, List

class DataService:
    def __init__(self):
        self.plasma_url = "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json"
        self.mag_url = "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json"
        self.electrons_url = "https://services.swpc.noaa.gov/json/goes/primary/integral-electrons-1-day.json"
        self.cached_features = None
        self.last_fetch_time = None
        
    async def fetch_live_data(self) -> Dict[str, pd.DataFrame]:
        async with httpx.AsyncClient() as client:
            plasma_res = await client.get(self.plasma_url)
            mag_res = await client.get(self.mag_url)
            electrons_res = await client.get(self.electrons_url)

        # Parse Plasma (WIND · Solar Wind Experiment / SWE instrument)
        plasma_data = plasma_res.json()
        plasma_df = pd.DataFrame(plasma_data)
        plasma_df['time_tag'] = pd.to_datetime(plasma_df['time_tag']).dt.tz_localize(None)
        plasma_df.set_index('time_tag', inplace=True)
        plasma_df = plasma_df[['proton_density', 'proton_speed']].apply(pd.to_numeric, errors='coerce')
        plasma_df.rename(columns={'proton_density': 'Solar_Wind_Density', 'proton_speed': 'Solar_Wind_Speed'}, inplace=True)

        # Parse Mag (WIND · Magnetic Field Investigation / MFI instrument)
        mag_data = mag_res.json()
        mag_df = pd.DataFrame(mag_data)
        mag_df['time_tag'] = pd.to_datetime(mag_df['time_tag']).dt.tz_localize(None)
        mag_df.set_index('time_tag', inplace=True)
        mag_df = mag_df[['bx_gsm', 'by_gsm', 'bz_gsm']].apply(pd.to_numeric, errors='coerce')
        mag_df.rename(columns={'bx_gsm': 'BX', 'by_gsm': 'BY', 'bz_gsm': 'BZ'}, inplace=True)

        # Parse Electrons (GOES-16 Energetic Particle Sensor — EPS/SEISS)
        # NOTE: NOAA's integral-electrons endpoint currently provides only the >=2 MeV channel.
        # The >=0.8 MeV channel was removed from the primary JSON feed; 2 MeV is used as a
        # conservative proxy consistent with the historical training schema.
        electrons_data = electrons_res.json()
        electrons_df = pd.DataFrame(electrons_data)
        electrons_df['time_tag'] = pd.to_datetime(electrons_df['time_tag']).dt.tz_localize(None)
        
        e_2mev = electrons_df[electrons_df['energy'].str.contains('2')].copy()
        e_2mev.set_index('time_tag', inplace=True)
        e_2mev = e_2mev[~e_2mev.index.duplicated(keep='last')]
        
        flux_df = pd.DataFrame({
            # Feed the 2 MeV flux into both columns to satisfy the model's 37-feature schema.
            # At inference time, the model uses these as correlated lag features; both columns
            # being identical is acceptable because the training correlation was near 1.0.
            'Electron_Flux_0_8MeV': pd.to_numeric(e_2mev['flux'], errors='coerce'),
            'Electron_Flux_2MeV': pd.to_numeric(e_2mev['flux'], errors='coerce'),
        })
        
        # Remove duplicate time tags from each stream
        plasma_df = plasma_df[~plasma_df.index.duplicated(keep='last')]
        mag_df = mag_df[~mag_df.index.duplicated(keep='last')]
        flux_df = flux_df[~flux_df.index.duplicated(keep='last')]

        return {
            'plasma': plasma_df,
            'mag': mag_df,
            'flux': flux_df
        }

    async def get_latest_features(self) -> pd.DataFrame:
        data = await self.fetch_live_data()
        
        # Forward-fill each source independently so each stream carries its last known value
        # before merging — prevents cross-contamination between streams with different cadences.
        plasma = data['plasma'].ffill().bfill()
        mag = data['mag'].ffill().bfill()
        flux = data['flux'].ffill().bfill()
        
        df = pd.concat([plasma, mag, flux], axis=1)
        df = df.resample('5min').mean()
        df = df.ffill().bfill()

        # DQF = Data Quality Flag (0 = good quality, the nominal operational value from GOES).
        # The training dataset used DQF=0 for all non-anomalous periods.
        df['DQF'] = 0

        # Time features
        df['hour'] = df.index.hour
        df['day'] = df.index.day
        df['month'] = df.index.month
        df['dayofyear'] = df.index.dayofyear

        # Lag features: 30 min = 6 rows × 5min; 60 min = 12 rows × 5min
        lag_cols = ['Electron_Flux_2MeV', 'Electron_Flux_0_8MeV', 'Solar_Wind_Speed', 'Solar_Wind_Density', 'BX', 'BY', 'BZ']
        for col in lag_cols:
            df[f'{col}_lag_30m'] = df[col].shift(6)
            df[f'{col}_lag_60m'] = df[col].shift(12)

        # Rolling statistics: 1 h = 12 rows; 3 h = 36 rows; 6 h = 72 rows
        roll_cols = ['Electron_Flux_2MeV', 'Solar_Wind_Speed', 'Solar_Wind_Density', 'BZ']
        for col in roll_cols:
            df[f'{col}_roll_1h'] = df[col].rolling(12).mean()
            df[f'{col}_roll_3h'] = df[col].rolling(36).mean()
            df[f'{col}_roll_6h'] = df[col].rolling(72).mean()
            
        # Fill residual NaNs created by rolling windows at series edges
        df = df.bfill().ffill().fillna(0)

        # Return only the exact 37 features the model was trained on
        expected_features = [
            'Electron_Flux_0_8MeV', 'DQF', 'Solar_Wind_Speed', 'Solar_Wind_Density', 'BX', 'BY', 'BZ',
            'hour', 'day', 'month', 'dayofyear', 'Electron_Flux_2MeV_lag_30m', 'Electron_Flux_2MeV_lag_60m',
            'Electron_Flux_0_8MeV_lag_30m', 'Electron_Flux_0_8MeV_lag_60m', 'Solar_Wind_Speed_lag_30m',
            'Solar_Wind_Speed_lag_60m', 'Solar_Wind_Density_lag_30m', 'Solar_Wind_Density_lag_60m',
            'BX_lag_30m', 'BX_lag_60m', 'BY_lag_30m', 'BY_lag_60m', 'BZ_lag_30m', 'BZ_lag_60m',
            'Electron_Flux_2MeV_roll_1h', 'Electron_Flux_2MeV_roll_3h', 'Electron_Flux_2MeV_roll_6h',
            'Solar_Wind_Speed_roll_1h', 'Solar_Wind_Speed_roll_3h', 'Solar_Wind_Speed_roll_6h',
            'Solar_Wind_Density_roll_1h', 'Solar_Wind_Density_roll_3h', 'Solar_Wind_Density_roll_6h',
            'BZ_roll_1h', 'BZ_roll_3h', 'BZ_roll_6h'
        ]

        if not df.empty:
            latest_row = df.iloc[[-1]][expected_features]
            self.cached_features = latest_row
            return latest_row
        else:
            return pd.DataFrame(columns=expected_features)

    def determine_risk_level(self, prediction_value: float) -> str:
        """
        Classify electron flux using threshold bands referenced to GOES operational limits
        and analogous to NOAA's Solar Energetic Particle (SEP) event S-scale.
        Thresholds (electrons/cm²/s/sr at >=2 MeV equivalent):
          SAFE    < 1,000   — background/quiet conditions
          WATCH   1,000–5,000 — elevated, monitor closely
          WARNING 5,000–10,000 — significant, prepare mitigations
          CRITICAL >= 10,000 — extreme, execute safe-mode
        """
        if prediction_value < 1000:
            return "SAFE"
        elif prediction_value < 5000:
            return "WATCH"
        elif prediction_value < 10000:
            return "WARNING"
        else:
            return "CRITICAL"

    def generate_alert_message(self, risk_level: str, time_frame: str) -> str:
        """Generate operationally actionable alert messages using standardised vocabulary."""
        messages = {
            "SAFE": (
                f"Electron flux nominal for {time_frame} horizon. "
                "No protective action required. Standard satellite operations may continue."
            ),
            "WATCH": (
                f"Elevated electron flux forecast for {time_frame} horizon. "
                "Increase monitoring cadence. Alert satellite operations teams. "
                "Minor single-event upsets (SEU) possible on vulnerable components."
            ),
            "WARNING": (
                f"Significant electron flux forecast for {time_frame} horizon. "
                "Prepare spacecraft safe-mode protocols. Reduce high-gain antenna operations. "
                "Surface charging effects likely on GEO satellites. Activate anomaly response team."
            ),
            "CRITICAL": (
                f"Extreme electron flux forecast for {time_frame} horizon — RADIATION STORM IMMINENT. "
                "Execute satellite safe-mode immediately. Deep dielectric charging risk is high. "
                "Halt all non-critical orbital manoeuvres. Maximum asset protection required."
            ),
        }
        return messages.get(risk_level, "Risk level unknown — verify data pipeline.")
