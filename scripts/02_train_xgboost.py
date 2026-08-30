import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

from xgboost import XGBRegressor

print("Loading dataset...")

df = pd.read_csv("data/final_dataset.csv")

print(df.shape)

X = df.drop(
    columns=[
        "Timestamp",
        "Electron_Flux_2MeV",
        "Target_30min",
        "Target_6hr",
        "Target_12hr"
    ],
    errors="ignore"
)

y = df["Target_12hr"]

print("Splitting data...")

split_index = int(len(X) * 0.8)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]

print("Training XGBoost model...")

model = XGBRegressor(
    n_estimators=500,
    max_depth=8,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

print("Predicting...")

y_pred = model.predict(X_test)

r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print("\n===== RESULTS =====")
print("R2 Score =", r2)
print("MAE =", mae)

joblib.dump(model, "models/model_12hr.pkl")

print("\nModel saved successfully.")