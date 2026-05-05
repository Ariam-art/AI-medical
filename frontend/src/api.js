const API_BASE_URL = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Request failed");
  }

  return response.json();
}

// 🔐 AUTH
export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

// 🧠 AI Prediction
export async function predictSymptoms(payload) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      symptoms: payload.symptoms,
    }),
  });

  return handleResponse(response);
}

// 📊 User History
export async function getUserHistory() {
  const response = await fetch(`${API_BASE_URL}/history/me`, {
    headers: authHeaders(),
  });

  return handleResponse(response);
}

export async function deleteHistory(historyId) {
  const response = await fetch(`${API_BASE_URL}/history/${historyId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handleResponse(response);
}

// 🔗 Access Requests
export async function sendAccessRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/access-request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      patient_username: payload.patient_username,
    }),
  });

  return handleResponse(response);
}

export async function getAccessRequests() {
  const response = await fetch(`${API_BASE_URL}/access-requests/me`, {
    headers: authHeaders(),
  });

  return handleResponse(response);
}

export async function respondAccessRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/access-request/respond`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

// 👨‍⚕️ Doctor
export async function getDoctorHistory() {
  const response = await fetch(`${API_BASE_URL}/doctor/history`, {
    headers: authHeaders(),
  });

  return handleResponse(response);
}