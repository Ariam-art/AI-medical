import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  async function handleRegister(event) {
    event.preventDefault();

    try {
      setMessage("");

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
          Register as a patient/user or doctor to access AI-assisted medical
          screening features.
        </p>

        <div className="role-info">
          <div>
            <h3>User / Patient</h3>
            <p>Can analyze symptoms and view personal screening history.</p>
          </div>

          <div>
            <h3>Doctor</h3>
            <p>Can use the prediction tool and review patient screening records.</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-box" onSubmit={handleRegister}>
          <h2>Sign Up</h2>
          <p className="muted">Create an account to start using the system</p>

          <label>Username</label>
          <input
            type="text"
            placeholder="Choose username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Choose password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label>Role</label>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="user">User / Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <button className="primary-btn" type="submit">
            Register
          </button>

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
