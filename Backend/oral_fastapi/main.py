from fastapi import FastAPI, File, UploadFile, Form
from fastapi.concurrency import run_in_threadpool
import numpy as np
import tensorflow as tf
from PIL import Image
import requests
import joblib
import cv2
import json
import pandas as pd
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

# ======================
# APP
# ======================
app = FastAPI(title="Oral Cancer AI")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# PATHS
# ======================
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

cnn_model = tf.keras.models.load_model(MODELS_DIR / "oral cancer model.h5")
rf_model = joblib.load(MODELS_DIR / "rf_model3 (1) (1).pkl")
label_encoder = joblib.load(MODELS_DIR / "label_encoder3 (1) (1).pkl")

FEATURE_COLUMNS = rf_model.feature_names_in_

CONF_THRESHOLD = 0.75
OOD_ENTROPY_THRESHOLD = 0.6

# ======================
# UTILS
# ======================

def is_blurry(image):
    img = np.array(image)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    variance = cv2.Laplacian(gray, cv2.CV_64F).var()

    return variance < 100  

def entropy(p):
    p = np.clip(p, 1e-6, 1 - 1e-6)
    return -(p * np.log(p) + (1 - p) * np.log(1 - p))

# ======================
# CNN
# ======================
def predict_cancer_sync(img):
    img = img.resize((224, 224))
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=0)

    p_non_cancer = float(cnn_model.predict(img, verbose=0)[0][0])
    p_cancer = 1 - p_non_cancer

    ent = entropy(p_cancer)

    if ent > OOD_ENTROPY_THRESHOLD:
        return "Uncertain", p_cancer, p_non_cancer

    if max(p_cancer, p_non_cancer) < CONF_THRESHOLD:
        return "Uncertain", p_cancer, p_non_cancer

    label = "Cancer" if p_cancer >= 0.5 else "Non-Cancer"
    return label, p_cancer, p_non_cancer

# ======================
# FEATURE BUILDER
# ======================
def build_features_from_answers(answers):
    features = {col: 0 for col in FEATURE_COLUMNS}

    localization_map = {
        "tongue": "localization_Tongue",
        "lip": "localization_Lip",
        "floor_of_mouth": "localization_Floor_of_mouth",
        "palate": "localization_Palate",
        "gingiva": "localization_Gingiva"
    }

    tobacco_map = {
        "yes": "tobacco_use_Yes",
        "no": "tobacco_use_No",
        "former": "tobacco_use_Former"
    }

    alcohol_map = {
        "yes": "alcohol_consumption_Yes",
        "no": "alcohol_consumption_No",
        "former": "alcohol_consumption_Former"
    }

    sun_map = {
        "yes": "sun_exposure_Yes",
        "no": "sun_exposure_No"
    }

    age_map = {
        "below_40_years": "age_group_0",
        "between_41_and_60_years": "age_group_1",
        "above_60_years": "age_group_2"
    }

    answers = {k: str(v).strip().lower() for k, v in answers.items()}

    if answers["localization"] in localization_map:
        features[localization_map[answers["localization"]]] = 1

    if answers["tobacco"] in tobacco_map:
        features[tobacco_map[answers["tobacco"]]] = 1

    if answers["alcohol"] in alcohol_map:
        features[alcohol_map[answers["alcohol"]]] = 1

    if answers["sun"] in sun_map:
        features[sun_map[answers["sun"]]] = 1

    features["gender_M"] = 1 if answers["gender"] == "male" else 0
    features["gender_F"] = 1 if answers["gender"] == "female" else 0

    if answers["age"] in age_map:
        features[age_map[answers["age"]]] = 1

    features["ulcers_lasts_more_than_3_weeks"] = 1 if answers["ulcer_3_weeks"] == "yes" else 0
    features["ulcers_spreading"] = 1 if answers["ulcer_spreading"] == "yes" else 0

    return pd.DataFrame([features])

# ======================
# MEDICAL RULE
# ======================
def decide_dysplasia(answers):
    low_risk = (
        answers["tobacco"].lower() == "no" and
        answers["alcohol"].lower() == "no" and
        answers["ulcer_3_weeks"].lower() == "no" and
        answers["ulcer_spreading"].lower() == "no"
    )

    return (
        "Leukoplakia without dysplasia"
        if low_risk
        else "Leukoplakia with dysplasia"
    )

# ======================
# INVALID IMAGE GUARD (FINAL FIX)
# ======================
def invalid_image_by_clinical_context(p_cancer, answers):
    low_clinical_risk = (
        answers["tobacco"].lower() == "no" and
        answers["alcohol"].lower() == "no" and
        answers["ulcer_3_weeks"].lower() == "no" and
        answers["ulcer_spreading"].lower() == "no"
    )

    # ❗ Only MID confidence cancer predictions can be invalid
    return 0.6 < p_cancer < 0.9 and low_clinical_risk

QUESTIONS_LIST = [
    {
        "id": "localization",
        "text": "Where is the lesion located?",
        "options": [
            {"label": "Tongue", "value": "tongue"},
            {"label": "Lip", "value": "lip"},
            {"label": "Floor of mouth", "value": "floor_of_mouth"},
            {"label": "Palate", "value": "palate"},
            {"label": "Gingiva", "value": "gingiva"}
        ]
    },
    {
        "id": "tobacco",
        "text": "Do you have a history of tobacco use?",
        "options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
            {"label": "Former User", "value": "former"}
        ]
    },
    {
        "id": "alcohol",
        "text": "Do you consume alcohol?",
        "options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
            {"label": "Former User", "value": "former"}
        ]
    },
    {
        "id": "sun",
        "text": "Do you have frequent exposure to sunlight?",
        "options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"}
        ]
    },
    {
        "id": "gender",
        "text": "Gender",
        "options": [
            {"label": "Male", "value": "male"},
            {"label": "Female", "value": "female"}
        ]
    },
    {
        "id": "age",
        "text": "Age Group",
        "options": [
            {"label": "Below 40 years", "value": "below_40_years"},
            {"label": "Between 41 and 60 years", "value": "between_41_and_60_years"},
            {"label": "Above 60 years", "value": "above_60_years"}
        ]
    },
    {
        "id": "ulcer_3_weeks",
        "text": "Has the ulcer lasted for more than 3 weeks?",
        "options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"}
        ]
    },
    {
        "id": "ulcer_spreading",
        "text": "Is the lesion spreading or increasing in size?",
        "options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"}
        ]
    }
]

@app.get("/api/doctors")
def get_doctors(city: str = None):
    return []

BASE_DIR = Path(__file__).resolve().parent.parent
with open(BASE_DIR / "hospitals.json", "r", encoding="utf-8") as f:
    HOSPITALS = json.load(f)

def hospital_with_id(hospital, index):
    item = dict(hospital)
    item["id"] = item.get("id") or index + 1
    return item

@app.get("/api/hospitals")
def get_hospitals(city: str = None):

    results = []

    for index, hospital in enumerate(HOSPITALS):
        address = hospital.get("address", "").lower()

        if city:
            if city.lower() not in address:
                continue

        results.append(hospital_with_id(hospital, index))

    return results

@app.get("/api/hospitals/{hospital_id}")
def get_hospital_by_id(hospital_id: int):
    for index, hospital in enumerate(HOSPITALS):
        item = hospital_with_id(hospital, index)
        if item["id"] == hospital_id:
            return item

    return {"error": "Hospital not found"}



@app.get("/api/doctors/{doctor_id}")
def get_doctor_by_id(doctor_id: int):
    return {"error": "Doctor not found"}
# ======================
# API
# ======================
@app.get("/api/questions")
async def get_questions():
    return {"questions": QUESTIONS_LIST}

# ======================
# CHECK IF IMAGE IS ORAL
# ======================
@app.post("/check-oral-image")

async def check_oral_image(file: UploadFile = File(...)):

    img = Image.open(file.file).convert("RGB")

    label, p_cancer, p_non_cancer = await run_in_threadpool(predict_cancer_sync, img)

    if label == "Uncertain" or (0.4 < p_cancer < 0.6):
        return {
            "status": "NOT_ORAL",
            "message": "This image does not appear to be an oral cavity image."
        }
    return {
        "status": "ORAL",
        "message": "Valid oral image"
    }

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    localization: str = Form(...),
    tobacco: str = Form(...),
    alcohol: str = Form(...),
    sun: str = Form(...),
    gender: str = Form(...),
    age: str = Form(...),
    ulcer_3_weeks: str = Form(...),
    ulcer_spreading: str = Form(...),
):
    answers = {
        "localization": localization.lower(),
        "tobacco": tobacco.lower(),
        "alcohol": alcohol.lower(),
        "sun": sun.lower(),
        "gender": gender.lower(),
        "age": age.lower(),
        "ulcer_3_weeks": ulcer_3_weeks.lower(),
        "ulcer_spreading": ulcer_spreading.lower(),
    }

    img = Image.open(file.file).convert("RGB")
    label, p_cancer, p_non_cancer = await run_in_threadpool(predict_cancer_sync, img)

    # ===== UNCERTAIN (CNN CONFIDENCE) =====
    if label == "Uncertain":
        return {
            "status": "UNCERTAIN",
            "diagnosis": None,
            "lesion_type": None,
            "confidence": round(max(p_cancer, p_non_cancer) * 100, 2),
            "explanation": "Low confidence image prediction."
        }

    # ===== INVALID IMAGE (NOT ORAL) =====
    if invalid_image_by_clinical_context(p_cancer, answers):
        return {
            "status": "UNCERTAIN",
            "diagnosis": None,
            "lesion_type": None,
            "confidence": round(p_cancer * 100, 2),
            "explanation": "Image prediction contradicts clinical context. Image may not be oral."
        }

    # ===== NON-CANCER =====
    if label == "Non-Cancer":
        return {
            "status": "SUCCESS",
            "diagnosis": "Non-Cancer",
            "lesion_type": None,
            "confidence": round(p_non_cancer * 100, 2),
            "explanation": "Image model detected no cancer."
        }

    # ===== RANDOM FOREST =====
    features = build_features_from_answers(answers)
    probs = rf_model.predict_proba(features)[0]
    lesion = label_encoder.inverse_transform([probs.argmax()])[0]

    if lesion.startswith("Leukoplakia"):
        lesion = decide_dysplasia(answers)
        diagnosis = "Pre-Cancer"
    else:
        diagnosis = "Cancer"

    confidence = (0.7 * p_cancer + 0.3 * probs.max()) * 100

    return {
        "status": "SUCCESS",
        "diagnosis": diagnosis,
        "lesion_type": lesion,
        "confidence": round(confidence, 2)
    }
