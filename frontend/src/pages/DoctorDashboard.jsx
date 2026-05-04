import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getDoctorHistory, sendAccessRequest } from "../api";

function DoctorDashboard() {
  const storedUser = localStorage.getItem("medical_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [patientUsername, setPatientUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRecords() {
    if (!user) {
      setMessage("Unauthorized. Please login again.");
      return;
    }

    if (user.role !== "doctor") {
      setMessage("Only doctors can access this dashboard.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await getDoctorHistory(user.username);
      setRecords(data);
    } catch (error) {
      setMessage(error.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest() {
    if (!user) {
      setMessage("Unauthorized. Please login again.");
      return;
    }

    if (!patientUsername.trim()) {
      setMessage("Enter patient username first.");
      return;
    }

    try {
      setMessage("");

      await sendAccessRequest({
        doctor_username: user.username,
        patient_username: patientUsername.trim(),
      });

      setMessage("Access request sent successfully.");
      setPatientUsername("");
    } catch (error) {
      setMessage(error.message || "Failed to send request.");
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  if (!user) {
    return (
      <div className="app-page">
        <section className="panel">
          <h1>Unauthorized</h1>
          <p>Please login again.</p>
        </section>
      </div>
    );
  }

  const filteredRecords = records.filter((record) => {
    const username = record.username || "";
    const symptoms = record.symptoms || "";
    const searchText = search.toLowerCase();

    return (
      username.toLowerCase().includes(searchText) ||
      symptoms.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="app-page">
      <Navbar />

      <section className="panel">
        <div className="section-header">
          <div>
            <h1>Doctor Dashboard</h1>
            <p className="muted">
              Request patient permission and review approved screening records.
            </p>
          </div>

          <button className="secondary-btn" onClick={loadRecords}>
            Refresh
          </button>
        </div>

        <div className="request-box">
          <h2>Request Patient Access</h2>
          <p className="muted">
            Enter the exact patient username. Records are visible only after the
            patient accepts the request.
          </p>

          <div className="request-row">
            <input
              type="text"
              placeholder="Patient username"
              value={patientUsername}
              onChange={(event) => setPatientUsername(event.target.value)}
            />

            <button className="primary-small-btn" onClick={handleSendRequest}>
              Send Request
            </button>
          </div>
        </div>


        <input
          className="search-input"
          placeholder="Search approved records by patient or symptoms..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {message && <p className="error-message">{message}</p>}

        {loading && <p>Loading records...</p>}

        <div className="doctor-table">
          {!loading && filteredRecords.length === 0 && (
            <p>No approved patient records found.</p>
          )}

          {filteredRecords.map((record) => {
            const topResult = record.result?.[0];
            const riskClass = topResult?.risk?.toLowerCase() || "low";

            return (
              <div
                className={`doctor-record risk-card ${riskClass}`}
                key={record.id}
              >
                <div className="doctor-record-header">
                  <h3>{record.username}</h3>
                  <span>{new Date(record.created_at).toLocaleString()}</span>
                </div>

                <p>
                  <strong>Symptoms:</strong>{" "}
                  {record.symptoms || "Not provided"}
                </p>

                {topResult && (
                  <div className="doctor-result">
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
                      <strong>Severity:</strong> {topResult.severity}
                    </p>

                    <p>
                      <strong>Advice:</strong> {topResult.advice}
                    </p>
                  </div>
                )}

                <div className="history-actions">
                  <button
                    className="details-btn"
                    onClick={() => setSelectedRecord(record)}
                  >
                    View Details
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
              <div>
                <h2>Patient Screening Details</h2>
                <p className="muted">
                  Patient: <strong>{selectedRecord.username}</strong>
                </p>
              </div>

              <button onClick={() => setSelectedRecord(null)}>×</button>
            </div>

            <p>
              <strong>Symptoms:</strong>{" "}
              {selectedRecord.symptoms || "N/A"}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedRecord.created_at).toLocaleString()}
            </p>

            <div className="details-results">
              {selectedRecord.result?.map((item, index) => {
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
                        {item.precautions?.map((precaution, i) => (
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

export default DoctorDashboard;
