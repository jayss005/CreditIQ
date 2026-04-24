"""
CreditIQ — FastAPI backend for credit approval prediction.
"""

from __future__ import annotations

import logging
import os
import traceback
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ──────────────────────────────────────────────
# Logging setup
# ──────────────────────────────────────────────
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api.log", mode="a")
    ]
)
logger = logging.getLogger("CreditIQ")

# ──────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────
app = FastAPI(
    title="CreditIQ Prediction API",
    version="1.0.0",
    description="Credit approval prediction powered by Gradient Boosting.",
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")
allowed_origins = [origin.strip() for origin in CORS_ORIGINS if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

# ──────────────────────────────────────────────
# Model loading
# ──────────────────────────────────────────────
MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    str(Path(__file__).resolve().parent / "credit_model.pkl"),
)

model = None


@app.on_event("startup")
def load_model() -> None:
    global model
    logger.info("Application starting up...")
    try:
        model = joblib.load(MODEL_PATH)
        logger.info(f"Model successfully loaded from {MODEL_PATH}")
    except FileNotFoundError:
        logger.error(f"Model file not found at {MODEL_PATH}. /predict will return 503.")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("Application shutting down...")


# ──────────────────────────────────────────────
# Feature column names (exact order from X_train)
# ──────────────────────────────────────────────
FEATURE_NAMES = [
    "CODE_GENDER", "FLAG_OWN_CAR", "FLAG_OWN_REALTY", "CNT_CHILDREN",
    "AMT_INCOME_TOTAL", "FLAG_MOBIL", "FLAG_WORK_PHONE", "FLAG_PHONE",
    "FLAG_EMAIL", "CNT_FAM_MEMBERS", "AGE_YEARS", "YEARS_EMPLOYED",
    "NAME_INCOME_TYPE_Pensioner", "NAME_INCOME_TYPE_State servant",
    "NAME_INCOME_TYPE_Student", "NAME_INCOME_TYPE_Working",
    "NAME_EDUCATION_TYPE_Higher education", "NAME_EDUCATION_TYPE_Incomplete higher",
    "NAME_EDUCATION_TYPE_Lower secondary",
    "NAME_EDUCATION_TYPE_Secondary / secondary special",
    "NAME_FAMILY_STATUS_Married", "NAME_FAMILY_STATUS_Separated",
    "NAME_FAMILY_STATUS_Single / not married", "NAME_FAMILY_STATUS_Widow",
    "NAME_HOUSING_TYPE_House / apartment", "NAME_HOUSING_TYPE_Municipal apartment",
    "NAME_HOUSING_TYPE_Office apartment", "NAME_HOUSING_TYPE_Rented apartment",
    "NAME_HOUSING_TYPE_With parents",
    "OCCUPATION_TYPE_Cleaning staff", "OCCUPATION_TYPE_Cooking staff",
    "OCCUPATION_TYPE_Core staff", "OCCUPATION_TYPE_Drivers",
    "OCCUPATION_TYPE_HR staff", "OCCUPATION_TYPE_High skill tech staff",
    "OCCUPATION_TYPE_IT staff", "OCCUPATION_TYPE_Laborers",
    "OCCUPATION_TYPE_Low-skill Laborers", "OCCUPATION_TYPE_Managers",
    "OCCUPATION_TYPE_Medicine staff", "OCCUPATION_TYPE_Private service staff",
    "OCCUPATION_TYPE_Realty agents", "OCCUPATION_TYPE_Sales staff",
    "OCCUPATION_TYPE_Secretaries", "OCCUPATION_TYPE_Security staff",
    "OCCUPATION_TYPE_Waiters/barmen staff",
    "INCOME_PER_FAMILY_MEMBER", "EMPLOYED_FLAG", "AGE_YEARS_sq",
]


# ──────────────────────────────────────────────
# Pydantic schemas
# ──────────────────────────────────────────────
class ApplicantInput(BaseModel):
    code_gender: int = Field(..., ge=0, le=1, description="0=Male, 1=Female")
    flag_own_car: int = Field(..., ge=0, le=1)
    flag_own_realty: int = Field(..., ge=0, le=1)
    cnt_children: int = Field(..., ge=0, le=5)
    amt_income_total: float = Field(..., gt=0)
    name_income_type: str
    name_education_type: str
    name_family_status: str
    name_housing_type: str
    flag_work_phone: int = Field(..., ge=0, le=1)
    flag_phone: int = Field(..., ge=0, le=1)
    flag_email: int = Field(..., ge=0, le=1)
    occupation_type: str = Field(default="Unknown")
    cnt_fam_members: float = Field(..., ge=1, le=9)
    age_years: int = Field(..., ge=18, le=100)
    years_employed: float = Field(..., ge=0)


class PredictionResponse(BaseModel):
    prediction: int
    probability_approved: float
    probability_rejected: float


class HealthResponse(BaseModel):
    status: str


class FeaturesInput(BaseModel):
    features: List[float]


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────
def one_hot(value: str, categories: list[str]) -> list[float]:
    return [1.0 if value == cat else 0.0 for cat in categories]


def build_feature_vector(data: ApplicantInput) -> pd.DataFrame:
    income_per_member = data.amt_income_total / max(data.cnt_fam_members, 1.0)
    employed_flag = 1.0 if data.years_employed > 0 else 0.0
    age_sq = float(data.age_years ** 2)

    features: list[float] = []

    # 0–4: core scalars
    features.append(float(data.code_gender))
    features.append(float(data.flag_own_car))
    features.append(float(data.flag_own_realty))
    features.append(float(data.cnt_children))
    features.append(float(data.amt_income_total))

    # 5: FLAG_MOBIL — always 1 in this dataset
    features.append(1.0)

    # 6–8: contact flags
    features.append(float(data.flag_work_phone))
    features.append(float(data.flag_phone))
    features.append(float(data.flag_email))

    # 9–11: numeric
    features.append(float(data.cnt_fam_members))
    features.append(float(data.age_years))
    features.append(float(data.years_employed))

    # 12–15: NAME_INCOME_TYPE (baseline = "Commercial associate")
    features.extend(one_hot(data.name_income_type, [
        "Pensioner", "State servant", "Student", "Working",
    ]))

    # 16–19: NAME_EDUCATION_TYPE (baseline = "Academic degree")
    features.extend(one_hot(data.name_education_type, [
        "Higher education", "Incomplete higher",
        "Lower secondary", "Secondary / secondary special",
    ]))

    # 20–23: NAME_FAMILY_STATUS (baseline = "Civil marriage")
    features.extend(one_hot(data.name_family_status, [
        "Married", "Separated", "Single / not married", "Widow",
    ]))

    # 24–28: NAME_HOUSING_TYPE (baseline = "Co-op apartment")
    features.extend(one_hot(data.name_housing_type, [
        "House / apartment", "Municipal apartment",
        "Office apartment", "Rented apartment", "With parents",
    ]))

    # 29–45: OCCUPATION_TYPE (baseline = "Accountants", Unknown → all zeros)
    occupation_types = [
        "Cleaning staff", "Cooking staff", "Core staff", "Drivers",
        "HR staff", "High skill tech staff", "IT staff", "Laborers",
        "Low-skill Laborers", "Managers", "Medicine staff",
        "Private service staff", "Realty agents", "Sales staff",
        "Secretaries", "Security staff", "Waiters/barmen staff",
    ]
    if data.occupation_type in occupation_types:
        features.extend(one_hot(data.occupation_type, occupation_types))
    else:
        features.extend([0.0] * len(occupation_types))

    # 46–48: engineered features
    features.append(income_per_member)
    features.append(employed_flag)
    features.append(age_sq)

    assert len(features) == 49, f"Feature count mismatch: expected 49, got {len(features)}"

    return pd.DataFrame([features], columns=FEATURE_NAMES)


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────
@app.get("/")
def read_root():
    return {
        "name": "CreditIQ Prediction API",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: ApplicantInput) -> PredictionResponse:
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    X = build_feature_vector(payload)
    prediction = int(model.predict(X)[0])
    probabilities = model.predict_proba(X)[0]

    prob_approved = round(float(probabilities[1]), 4)
    logger.info(f"Prediction requested. Approved probability: {prob_approved}")

    return PredictionResponse(
        prediction=prediction,
        probability_approved=prob_approved,
        probability_rejected=round(float(probabilities[0]), 4),
    )


@app.post("/predict/raw", response_model=PredictionResponse)
def predict_raw(payload: FeaturesInput) -> PredictionResponse:
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    if len(payload.features) != 49:
        raise HTTPException(
            status_code=422,
            detail=f"Expected 49 features, got {len(payload.features)}.",
        )

    X = pd.DataFrame([payload.features], columns=FEATURE_NAMES)
    prediction = int(model.predict(X)[0])
    probabilities = model.predict_proba(X)[0]

    return PredictionResponse(
        prediction=prediction,
        probability_approved=round(float(probabilities[1]), 4),
        probability_rejected=round(float(probabilities[0]), 4),
    )