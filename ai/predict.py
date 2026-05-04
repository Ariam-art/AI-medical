import numpy as np
import joblib
import os
from ai.rag import build_rag_response

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.pkl"))


def predict_disease(user_input):
    text = user_input.lower()

    vec = vectorizer.transform([text])

    probs = model.predict_proba(vec)

    top_indices = np.argsort(probs[0])[::-1][:3]

    results = []

    for i in top_indices:
        disease = model.classes_[i]
        probability = float(probs[0][i])

        rag_result = build_rag_response(disease, probability, text)

        results.append(rag_result)

    return results