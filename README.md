# ISRO Space Radiation Forecasting System

A production-ready web application designed to predict space radiation levels 30 minutes, 6 hours, and 12 hours into the future, built for space operations monitoring.

## Project Architecture

- **Models**: Pre-trained XGBoost regressors using telemetry data features (Electron Flux, Solar Wind Speed/Density, IMF Bx/By/Bz) including lag and rolling statistics.
- **Backend**: FastAPI (Python), serving real-time predictions and live NOAA data integration.
- **Frontend**: React + Vite + Tailwind CSS, featuring a responsive 'Dark Space Theme' UI mimicking a mission control center.

## Project Structure

```text
isro-radiation-forecasting/
├── backend/                  # FastAPI application
│   ├── api/                  # API routing
│   ├── services/             # Prediction & Data fetching logic
│   ├── main.py               # Entrypoint
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React frontend
│   ├── src/                  # React components and pages
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # UI styling configuration
│   └── vercel.json           # Vercel deployment config
├── models/                   # Pre-trained XGBoost Models
│   ├── model_30min.pkl
│   ├── model_6hr.pkl
│   └── model_12hr.pkl
└── render.yaml               # Render deployment config
```

## Installation & Running Locally

### Backend (FastAPI)

1. Navigate to the backend directory or run from root:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Start the server:
   ```bash
   cd backend
   python main.py
   ```
3. The API will be available at `http://localhost:8000`. You can view the docs at `http://localhost:8000/docs`.

### Frontend (React/Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. The frontend will be available at `http://localhost:5173`. (It proxies `/api` to port 8000).

## API Documentation

The backend exposes the following REST API endpoints:

- `GET /api/v1/health`: Checks if the server is healthy and models are loaded.
- `GET /api/v1/predict`: Fetches live NOAA space weather data, processes features, and returns predictions, risk levels, and alerts for 30m, 6h, and 12h.
- `GET /api/v1/current-space-weather`: Returns the raw current feature values (Flux, Wind, IMF) used for the latest prediction.
- `GET /api/v1/forecast-history`: Returns historical mock forecast data.

*(For detailed schema, visit `/docs` while the backend is running).*

## Deployment

- **Backend (Render)**: Use the included `render.yaml` to deploy the FastAPI application on Render as a Web Service.
- **Frontend (Vercel)**: Connect your repository to Vercel. The included `vercel.json` and `vite.config.js` will handle routing. Remember to update the `destination` URL in `vercel.json` rewrites to point to your deployed Render backend URL.
