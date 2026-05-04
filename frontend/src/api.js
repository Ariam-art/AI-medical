const API_BASE_URL = "http://127.0.0.1:8000";

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function predictSymptoms(payload) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function getUserHistory(username) {
  const response = await fetch(`${API_BASE_URL}/history/${username}`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function getDoctorHistory(username) {
  const response = await fetch(
    `${API_BASE_URL}/doctor/history?username=${username}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function deleteHistory(historyId, username) {
  const response = await fetch(
    `${API_BASE_URL}/history/${historyId}?username=${username}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function sendAccessRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/access-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function getAccessRequests(patientUsername) {
  const response = await fetch(
    `${API_BASE_URL}/access-requests/${patientUsername}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function respondAccessRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/access-request/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
