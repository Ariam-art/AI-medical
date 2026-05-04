import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAccessRequests, respondAccessRequest } from "../api";

function AccessRequests() {
  const user = JSON.parse(localStorage.getItem("medical_user"));

  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await getAccessRequests(user.username);
      setRequests(data);
      setMessage("");
    } catch (error) {
      setMessage("❌ Could not load access requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(requestId, action) {
    try {
      setProcessingId(requestId);

      await respondAccessRequest({
        request_id: requestId,
        patient_username: user.username,
        action,
      });

      // ✅ Instant UI update (no waiting)
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: action } : req
        )
      );

      setMessage(`✅ Request ${action} successfully`);
    } catch (error) {
      setMessage("❌ Could not update request.");
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="app-page">
      <Navbar />

      <section className="panel">
        <div className="section-header">
          <div>
            <h1>Access Requests</h1>
            <p className="muted">
              Doctors must get your permission before viewing your screening history.
            </p>
          </div>

          <button className="secondary-btn" onClick={loadRequests}>
            Refresh
          </button>
        </div>

        {message && <p className="error-message">{message}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="history-grid">
            {requests.length === 0 && <p>No access requests found.</p>}

            {requests.map((request) => (
              <div className="history-card" key={request.id}>
                <p>
                  <strong>Doctor:</strong> {request.doctor_username}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        request.status === "accepted"
                          ? "green"
                          : request.status === "rejected"
                          ? "red"
                          : "orange",
                    }}
                  >
                    {request.status}
                  </span>
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(request.created_at).toLocaleString()}
                </p>

                {request.status === "pending" && (
                  <div className="history-actions">
                    <button
                      className="details-btn"
                      disabled={processingId === request.id}
                      onClick={() =>
                        handleRespond(request.id, "accepted")
                      }
                    >
                      {processingId === request.id ? "Processing..." : "Accept"}
                    </button>

                    <button
                      className="delete-btn"
                      disabled={processingId === request.id}
                      onClick={() =>
                        handleRespond(request.id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AccessRequests;