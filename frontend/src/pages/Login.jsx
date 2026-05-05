import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setMessage("");

      const data = await loginUser({
        username,
        password,
      });

      // Save token
      localStorage.setItem("token", data.access_token);

      localStorage.setItem(
        "medical_user",
        JSON.stringify({
          username: data.username,
          role: data.role,
        })
      );

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message || "Invalid username or password");
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <h1>🩺 AI Medical Screening System</h1>
        <p>
          A web-based AI symptom screening and decision-support platform for
          patients and doctors.
        </p>

        <div className="auth-points">
          <span>✓ Symptom prediction</span>
          <span>✓ RAG-based medical information</span>
          <span>✓ Risk and severity support</span>
          <span>✓ Patient history tracking</span>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-box" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p className="muted">Login to continue to your dashboard</p>

          {/* Username */}
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* Password */}
          <label>Password</label>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: "40px" }}
            />

            {/* 👁️ Toggle */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Login button */}
          <button className="primary-btn" type="submit">
            Login
          </button>

          {/* Error message */}
          {message && <p className="error-message">{message}</p>}

          {/* Register link */}
          <p className="auth-switch">
            Do not have an account? <Link to="/register">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;