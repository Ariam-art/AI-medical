import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load datasets
desc = pd.read_csv(os.path.join(BASE_DIR, "symptom_Description.csv"))
prec = pd.read_csv(os.path.join(BASE_DIR, "symptom_precaution.csv"))
sev = pd.read_csv(os.path.join(BASE_DIR, "Symptom-severity.csv"))

# Clean columns
desc.columns = ["Disease", "Description"]
prec.columns = ["Disease", "Precaution_1", "Precaution_2", "Precaution_3", "Precaution_4"]
sev.columns = ["Symptom", "Weight"]

# Clean text values for safer matching
desc["Disease"] = desc["Disease"].astype(str).str.strip()
prec["Disease"] = prec["Disease"].astype(str).str.strip()
sev["Symptom"] = sev["Symptom"].astype(str).str.strip().str.lower()


def get_disease_info(disease_name):
    disease_name = disease_name.strip()

    d = desc[desc["Disease"] == disease_name]
    p = prec[prec["Disease"] == disease_name]

    description = d["Description"].values[0] if not d.empty else "No description available"

    precautions = []
    if not p.empty:
        precautions = p.iloc[0][1:].dropna().tolist()

    return {
        "description": description,
        "precautions": precautions
    }


def get_risk_level(probability, severity):
    if severity == "High":
        return "High"
    elif probability >= 0.7 or severity == "Moderate":
        return "Moderate"
    else:
        return "Low"


def calculate_severity(symptoms_text):
    symptoms = symptoms_text.lower().split()
    total = 0

    for symptom in symptoms:
        row = sev[sev["Symptom"] == symptom.strip()]
        if not row.empty:
            total += int(row["Weight"].values[0])

    if total >= 15:
        return "High"
    elif total >= 8:
        return "Moderate"
    else:
        return "Low"


def generate_advice(risk, severity):
    if risk == "High" or severity == "High":
        return "Urgent: Seek immediate medical attention"
    elif risk == "Moderate" or severity == "Moderate":
        return "Monitor symptoms and consult a doctor if condition worsens"
    else:
        return "Maintain rest, hydration, and basic self-care"


def build_rag_response(disease, probability, symptoms_text):
    info = get_disease_info(disease)

    severity = calculate_severity(symptoms_text)
    risk = get_risk_level(probability, severity)
    advice = generate_advice(risk, severity)

    return {
        "disease": disease,
        "probability": round(probability, 2),
        "risk": risk,
        "severity": severity,
        "description": info["description"],
        "precautions": info["precautions"],
        "advice": advice
    }