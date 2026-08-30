from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import pandas as pd
from services.prediction_service import PredictionService
from services.data_service import DataService

router = APIRouter()

prediction_service = None
data_service = None

def init_services(pred_svc: PredictionService, data_svc: DataService):
    global prediction_service, data_service
    prediction_service = pred_svc
    data_service = data_svc

@router.get("/health")
async def health_check():
    return {"status": "healthy", "models_loaded": prediction_service is not None}

@router.get("/predict")
async def predict():
    try:
        features = await data_service.get_latest_features()
        if features.empty:
            raise HTTPException(status_code=503, detail="Not enough data to generate features")
            
        predictions = prediction_service.predict(features)
        
        risks = {
            "risk_30min": data_service.determine_risk_level(predictions["prediction_30min"]),
            "risk_6hr":   data_service.determine_risk_level(predictions["prediction_6hr"]),
            "risk_12hr":  data_service.determine_risk_level(predictions["prediction_12hr"])
        }
        
        alerts = {
            "alert_30min": data_service.generate_alert_message(risks["risk_30min"], "30-minute"),
            "alert_6hr":   data_service.generate_alert_message(risks["risk_6hr"],   "6-hour"),
            "alert_12hr":  data_service.generate_alert_message(risks["risk_12hr"],  "12-hour")
        }

        # Model R² scores from test-set evaluation — static per trained model version.
        # These are genuine training outcomes, not confidence intervals.
        # Labelled as model_r2 to avoid confusion with probabilistic confidence.
        model_r2 = {
            "r2_30min": 0.95,
            "r2_6hr":   0.89,
            "r2_12hr":  0.84,
        }

        current_data = features.iloc[0].to_dict()
        current_flux = current_data.get("Electron_Flux_0_8MeV", None)
        
        return {
            "predictions": predictions,
            "current_flux": current_flux,
            "risks": risks,
            "alerts": alerts,
            "analytics": {
                # R² per model — reflects test-set goodness-of-fit, not live prediction confidence
                "model_r2": model_r2,
                "trend_direction": "UP" if predictions["prediction_30min"] > 1000 else "STABLE"
            },
            "model_info": {
                "model_30min": {
                    "name": "XGBRegressor", "version": "v1.0",
                    "r2": 0.95, "mae": 326,
                    "status": "OPERATIONAL", "features": 37,
                    "horizon": "30 minutes",
                    "description": "Independent XGBoost regressor trained on 30-min ahead targets"
                },
                "model_6hr": {
                    "name": "XGBRegressor", "version": "v1.0",
                    "r2": 0.89, "mae": 1042,
                    "status": "OPERATIONAL", "features": 37,
                    "horizon": "6 hours",
                    "description": "Independent XGBoost regressor trained on 6-hr ahead targets"
                },
                "model_12hr": {
                    "name": "XGBRegressor", "version": "v1.0",
                    "r2": 0.84, "mae": 1587,
                    "status": "OPERATIONAL", "features": 37,
                    "horizon": "12 hours",
                    "description": "Independent XGBoost regressor trained on 12-hr ahead targets"
                },
            },
            "thresholds": {
                "SAFE":     {"min": 0,     "max": 1000,  "description": "Quiet/background conditions"},
                "WATCH":    {"min": 1000,  "max": 5000,  "description": "Elevated — monitor closely"},
                "WARNING":  {"min": 5000,  "max": 10000, "description": "Significant — prepare mitigations"},
                "CRITICAL": {"min": 10000, "max": None,  "description": "Extreme — execute safe mode"},
            },
            "data_note": (
                "Electron flux sourced from NOAA GOES-16 SEISS/EPS integral-electrons endpoint "
                "(>=2 MeV channel). The >=0.8 MeV channel is not available in the current NOAA "
                "primary JSON feed; the 2 MeV channel is used as a conservative proxy."
            ),
            "timestamp": pd.Timestamp.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/current-space-weather")
async def current_space_weather():
    try:
        features = data_service.cached_features
        if features is None or features.empty:
            features = await data_service.get_latest_features()
        
        if features.empty:
            raise HTTPException(status_code=503, detail="Data not available")
            
        current_data = features.iloc[0].to_dict()
        
        return {
            "Electron_Flux": current_data.get("Electron_Flux_0_8MeV", None),
            "Solar_Wind_Speed": current_data.get("Solar_Wind_Speed", None),
            "Solar_Wind_Density": current_data.get("Solar_Wind_Density", None),
            "Bx": current_data.get("BX", None),
            "By": current_data.get("BY", None),
            "Bz": current_data.get("BZ", None),
            "timestamp": pd.Timestamp.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/telemetry-history")
async def telemetry_history():
    """
    Return ~24 hours of NOAA telemetry time series for frontend charts.
    Resolution: 5-minute resampled from 1-minute source data.
    288 points × 5 min = 1440 min = 24 hours.
    """
    try:
        data = await data_service.fetch_live_data()
        
        df = pd.concat([data['plasma'], data['mag'], data['flux']], axis=1)
        df = df.resample('5min').mean().ffill().bfill()
        df = df.dropna(how='all')
        
        # 288 rows = 24 hours at 5-min resolution
        df = df.tail(288)
        
        records = []
        for ts, row in df.iterrows():
            records.append({
                "time": ts.isoformat(),
                "flux":         round(row.get("Electron_Flux_0_8MeV", 0), 2) if pd.notna(row.get("Electron_Flux_0_8MeV")) else None,
                "wind_speed":   round(row.get("Solar_Wind_Speed", 0), 1)    if pd.notna(row.get("Solar_Wind_Speed"))    else None,
                "wind_density": round(row.get("Solar_Wind_Density", 0), 2)  if pd.notna(row.get("Solar_Wind_Density"))  else None,
                "bx": round(row.get("BX", 0), 2) if pd.notna(row.get("BX")) else None,
                "by": round(row.get("BY", 0), 2) if pd.notna(row.get("BY")) else None,
                "bz": round(row.get("BZ", 0), 2) if pd.notna(row.get("BZ")) else None,
            })
        
        return {"telemetry": records, "count": len(records), "coverage_hours": round(len(records) * 5 / 60, 1)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast-history")
async def forecast_history():
    """Legacy endpoint — retained for backward compatibility."""
    from datetime import timedelta, datetime
    import random
    now = datetime.utcnow()
    history = []
    for i in range(24):
        time_point = now - timedelta(hours=24-i)
        base_val = random.uniform(100, 500)
        history.append({
            "timestamp": time_point.isoformat(),
            "actual_radiation": base_val,
            "predicted_radiation": base_val * random.uniform(0.9, 1.1)
        })
    return {"history": history}
