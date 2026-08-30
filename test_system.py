import asyncio
import sys
import os

# Add backend to path so imports work
sys.path.insert(0, os.path.abspath('backend'))

from backend.services.data_service import DataService
from backend.services.prediction_service import PredictionService

async def test():
    print("Initializing services...")
    ds = DataService()
    ps = PredictionService(
        model_30min_path='models/model_30min.pkl',
        model_6hr_path='models/model_6hr.pkl',
        model_12hr_path='models/model_12hr.pkl'
    )
    
    print("Fetching latest features...")
    try:
        features = await ds.get_latest_features()
        print(f"Features retrieved! Shape: {features.shape}")
        
        if not features.empty:
            print("Running predictions...")
            preds = ps.predict(features)
            print(f"Predictions: {preds}")
            print("System is FULLY OPERATIONAL!")
        else:
            print("Failed: Features empty.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
