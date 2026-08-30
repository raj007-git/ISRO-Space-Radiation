import pickle
import pandas as pd
from typing import Dict, Any

class PredictionService:
    def __init__(self, model_30min_path: str, model_6hr_path: str, model_12hr_path: str):
        with open(model_30min_path, 'rb') as f:
            self.model_30m = pickle.load(f)
        with open(model_6hr_path, 'rb') as f:
            self.model_6h = pickle.load(f)
        with open(model_12hr_path, 'rb') as f:
            self.model_12h = pickle.load(f)

    def predict(self, features: pd.DataFrame) -> Dict[str, float]:
        """
        Takes a single-row DataFrame containing the required features
        and returns the predicted radiation values.
        """
        # Ensure we're passing the dataframe with columns in the exact order the model expects
        # XGBoost handles missing columns, but it's best to pass everything correctly
        pred_30m = self.model_30m.predict(features)[0]
        pred_6h = self.model_6h.predict(features)[0]
        pred_12h = self.model_12h.predict(features)[0]

        return {
            "prediction_30min": float(pred_30m),
            "prediction_6hr": float(pred_6h),
            "prediction_12hr": float(pred_12h)
        }
