from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router, init_services
from services.prediction_service import PredictionService
from services.data_service import DataService
import os

app = FastAPI(
    title="ISRO Space Radiation Forecasting API",
    description="API for predicting space radiation levels.",
    version="1.0.0"
)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load services on startup
@app.on_event("startup")
async def startup_event():
    # Adjust paths based on deployment or local dev
    # Assuming models/ is in the parent directory of backend/ or in the root
   base_dir = os.path.dirname(os.path.abspath(__file__))
   models_dir = os.path.join(base_dir, "models")

    print("BASE_DIR =", base_dir)
    print("MODELS_DIR =", models_dir)
    print("FILES =", os.listdir(models_dir))

    pred_svc = PredictionService(
        model_30min_path=os.path.join(models_dir, "model_30min.pkl"),
        model_6hr_path=os.path.join(models_dir, "model_6hr.pkl"),
        model_12hr_path=os.path.join(models_dir, "model_12hr.pkl")
    )
    
    data_svc = DataService()
    
    init_services(pred_svc, data_svc)
    print("Services initialized successfully.")

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
