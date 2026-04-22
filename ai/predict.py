import numpy as np
import joblib
import os

# Get current folder path (so it works anywhere)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model and vectorizer
model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.pkl"))

def predict_disease(user_input):
    """
    Input: string of symptoms
    Example: "fever sneezing sore_throat runny_nose weakness"
    
    Output: top 3 predicted diseases with probabilities
    """

    # Clean input
    text = user_input.lower()

    # Convert text to vector
    vec = vectorizer.transform([text])

    # Predict probabilities
    probs = model.predict_proba(vec)

    # Get top 3 predictions
    top_indices = np.argsort(probs[0])[::-1][:3]

    results = []
    for i in top_indices:
        results.append({
            "disease": model.classes_[i],
            "probability": round(float(probs[0][i]), 2)
        })

    return results  