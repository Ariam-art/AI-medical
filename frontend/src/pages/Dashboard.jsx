import { useState } from "react";
import Navbar from "../components/Navbar";
import { predictSymptoms } from "../api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("medical_user"));

  const [symptoms, setSymptoms] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePredict() {
    if (!symptoms.trim()) {
      setMessage("Please enter symptoms first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await predictSymptoms({
        username: user.username,
        symptoms,
      });

      setResults(data.result);
    } catch (error) {
      setMessage("Prediction failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-page">
      <Navbar />

      <main className="main-grid">
        <section className="panel input-panel">
          <h1>Symptom Analysis</h1>
          <p className="muted">
            Enter symptoms separated by spaces. Use examples like: fever cough
            headache fatigue.
          </p>

          <textarea
            placeholder="Example: fever sneezing sore_throat runny_nose weakness"
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
          />

          <button className="primary-btn" onClick={handlePredict}>
            {loading ? "Analyzing..." : "Analyze Symptoms"}
          </button>

          {message && <p className="error-message">{message}</p>}
        </section>

        <section className="panel guidance-panel">
          <h2>How to Use</h2>
          <ul>
            <li>Enter the symptoms reported by the patient.</li>
            <li>The AI model predicts the top possible conditions.</li>
            <li>The RAG module adds description, precautions, and advice.</li>
            <li>This system supports screening, not final diagnosis.</li>
          </ul>
        </section>
      </main>

      <section className="results-section">
        {results.map((item, index) => (
          <div
            className={`result-card risk-card ${item.risk.toLowerCase()}`}
            key={index}
          >
            <div className="result-top">
              <div>
                <h2>{item.disease}</h2>
                <p>Probability: {(item.probability * 100).toFixed(0)}%</p>
              </div>

              <span className={`risk-badge ${item.risk.toLowerCase()}`}>
                {item.risk}
              </span>
            </div>

            <p>
              <strong>Severity:</strong> {item.severity}
            </p>

            <p>
              <strong>Description:</strong> {item.description}
            </p>

            <p>
              <strong>Advice:</strong> {item.advice}
            </p>

            <div>
              <strong>Precautions:</strong>
              <ul>
                {item.precautions.map((precaution, i) => (
                  <li key={i}>{precaution}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
