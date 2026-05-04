import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load datasets
desc = pd.read_csv(os.path.join(BASE_DIR, "symptom_Description.csv"))
prec = pd.read_csv(os.path.join(BASE_DIR, "symptom_precaution.csv"))

# Clean columns
desc.columns = ["Disease", "Description"]
prec.columns = [
    "Disease",
    "Precaution_1",
    "Precaution_2",
    "Precaution_3",
    "Precaution_4",
]

# Clean text values for safer matching
desc["Disease"] = desc["Disease"].astype(str).str.strip()
prec["Disease"] = prec["Disease"].astype(str).str.strip()


def get_disease_info(disease_name):
    disease_name = disease_name.strip()

    d = desc[desc["Disease"] == disease_name]
    p = prec[prec["Disease"] == disease_name]

    description = (
        d["Description"].values[0]
        if not d.empty
        else "No description available"
    )

    precautions = []
    if not p.empty:
        precautions = p.iloc[0][1:].dropna().tolist()

    return {
        "description": description,
        "precautions": precautions,
    }


def get_risk_level(probability):
    """
    Risk level is based on prediction probability.
    The same value will also be used for severity.
    """
    if probability >= 0.75:
        return "High"
    elif probability >= 0.40:
        return "Moderate"
    else:
        return "Low"


def generate_advice(risk):
    if risk == "High":
        return (
            "High confidence result. Please consult a healthcare professional "
            "for proper medical assessment."
        )
    elif risk == "Moderate":
        return (
            "Moderate confidence result. Monitor symptoms and consider "
            "consulting a doctor if symptoms continue or worsen."
        )
    else:
        return (
            "Low confidence result. Provide more symptoms if possible and use "
            "basic self-care where appropriate."
        )


def build_rag_response(disease, probability, symptoms_text):
    info = get_disease_info(disease)

    risk = get_risk_level(probability)

    # You requested risk and severity to be the same
    severity = risk

    advice = generate_advice(risk)

    return {
        "disease": disease,
        "probability": round(probability, 2),
        "risk": risk,
        "severity": severity,
        "description": info["description"],
        "precautions": info["precautions"],
        "advice": advice,
    }