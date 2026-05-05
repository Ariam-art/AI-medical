import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("medical_user"));

  function logout() {
    localStorage.removeItem("medical_user");
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div>
        <h2>AI Medical Screening</h2>
        <p>
          {user?.username} — <span>{user?.role}</span>
        </p>
      </div>

      <nav>
        <Link to="/dashboard">Prediction</Link>
        <Link to="/history">My History</Link>

        {user?.role === "user" && <Link to="/requests">Access Requests</Link>}

        {user?.role === "doctor" && <Link to="/doctor">Doctor Dashboard</Link>}

        <button onClick={logout}>Logout</button>
      </nav>
    </header>
  );
}

export default Navbar;
