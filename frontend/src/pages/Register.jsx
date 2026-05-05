import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 Password validation rule
  function isValidPassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    return regex.test(password);
  }

  // 📊 Password strength logic
  function getPasswordStrength(password) {
    if (!password) return { label: "", color: "" };

    if (password.length < 6) {
      return { label: "Weak", color: "red", width: "33%" };
    }

    if (!isValidPassword(password)) {
      return { label: "Medium", color: "orange", width: "66%" };
    }

    return { label: "Strong", color: "green", width: "100%" };
  }

  const strength = getPasswordStrength(password);

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");

    // 🔒 Block weak password
    if (!isValidPassword(password)) {
      setMessage(
        "Password must contain letters, numbers, special characters and be at least 8 characters long."
      );
      return;
    }

    try {
      await registerUser({
        username,
        password,
        role,
      });

      navigate("/login");
    } catch (error) {
      setMessage("Registration failed. Username may already exist.");
    }
  }

  return (
    <div className="auth-layout register-theme">
      <div className="auth-left">
        <h1>Create Your Account</h1>
        <p>
          Register as a patient/user or doctor to access AI medical screening.
        </p>
      </div>

      <div className="auth-right">
        <form className="auth-box" onSubmit={handleRegister}>
          <h2>Sign Up</h2>

          {/* Username */}
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* Password */}
          <label>Password</label>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: "40px" }}
            />

            {/* 👁️ Toggle password */}
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

          {/* 📊 Strength bar */}
          {password && (
            <div style={{ marginTop: "8px" }}>
              <div
                style={{
                  height: "6px",
                  width: "100%",
                  background: "#ddd",
                  borderRadius: "5px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: strength.width,
                    background: strength.color,
                    borderRadius: "5px",
                    transition: "0.3s",
                  }}
                />
              </div>

              <p style={{ color: strength.color, fontSize: "12px" }}>
                {strength.label}
              </p>
            </div>
          )}

          <p className="muted">
            Must include letters, numbers, special characters (min 8 chars).
          </p>

          {/* Role */}
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User / Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <button className="primary-btn" type="submit">
            Register
          </button>

          {/* Error message */}
          {message && <p className="error-message">{message}</p>}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;