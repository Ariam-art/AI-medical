import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getUserHistory, deleteHistory } from "../api";

function History() {
  const user = JSON.parse(localStorage.getItem("medical_user"));

  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [message, setMessage] = useState("");

  async function loadHistory() {
    try {
      const data = await getUserHistory();
      setHistory(data);
    } catch (error) {
      setMessage("Could not load history.");
    }
  }

  async function handleDelete(recordId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this history record?",
    );

    if (!confirmed) return;

    try {
      await deleteHistory(recordId);
      await loadHistory();

      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (error) {
      setMessage("Could not delete history record.");
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="app-page">
      <Navbar />

      <section className="panel">
        <div className="section-header">
          <div>
            <h1>My Screening History</h1>
            <p className="muted">
              View your previous symptom screening records.
            </p>
          </div>

          <button className="secondary-btn" onClick={loadHistory}>
            Refresh
          </button>
        </div>

        {message && <p className="error-message">{message}</p>}

        <div className="history-grid">
          {history.length === 0 && <p>No history found.</p>}

          {history.map((record) => {
            const topResult = record.result?.[0];
            const riskClass = topResult?.risk?.toLowerCase() || "low";

            return (
              <div
                className={`history-card risk-card ${riskClass}`}
                key={record.id}
              >
                <p>
                  <strong>Symptoms:</strong> {record.symptoms}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(record.created_at).toLocaleString()}
                </p>

                {topResult && (
                  <>
                    <p>
                      <strong>Top Prediction:</strong> {topResult.disease}
                    </p>

                    <p>
                      <strong>Risk:</strong>{" "}
                      <span className={`risk-badge ${riskClass}`}>
                        {topResult.risk}
                      </span>
                    </p>

                    <p>
                      <strong>Advice:</strong> {topResult.advice}
                    </p>
                  </>
                )}

                <div className="history-actions">
                  <button
                    className="details-btn"
                    onClick={() => setSelectedRecord(record)}
                  >
                    View Details
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(record.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedRecord && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h2>Screening Details</h2>
              <button onClick={() => setSelectedRecord(null)}>×</button>
            </div>

            <p>
              <strong>Symptoms:</strong> {selectedRecord.symptoms}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedRecord.created_at).toLocaleString()}
            </p>

            <div className="details-results">
              {selectedRecord.result.map((item, index) => {
                const riskClass = item.risk.toLowerCase();

                return (
                  <div
                    className={`result-card risk-card ${riskClass}`}
                    key={index}
                  >
                    <div className="result-top">
                      <div>
                        <h3>{item.disease}</h3>
                        <p>
                          Probability: {(item.probability * 100).toFixed(0)}%
                        </p>
                      </div>

                      <span className={`risk-badge ${riskClass}`}>
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
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
