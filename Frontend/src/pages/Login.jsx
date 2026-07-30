import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const Login = ({ role }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Role credential data registry
  const credentialsByRole = {
    staff: {
      expectedUser: "staff123",
      expectedPass: "s2026",
      redirectUrl: "/staff-officer" // Safely directs to the matching App.jsx route path
    },
    manager: {
      expectedUser: "m123",
      expectedPass: "m2026",
      redirectUrl: "/manager" 
    },
    a: {
      expectedUser: "a123",
      expectedPass: "a2026",
      redirectUrl: "/a-officer" 
    },
    b: {
      expectedUser: "b123",
      expectedPass: "b2026",
      redirectUrl: "/b-officer" 
    },

    applier: {
      expectedUser: "PB001",
      expectedPass: "pb2026",
      redirectUrl: "/applier-dashboard"
    }

  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const currentRoleConfig = credentialsByRole[role];

    if (!currentRoleConfig) {
      setErrorMessage("Configuration error: Invalid role setup.");
      return;
    }

    if (
      username.trim() === currentRoleConfig.expectedUser && 
      password === currentRoleConfig.expectedPass
    ) {
      navigate(currentRoleConfig.redirectUrl);
    } else {
      setErrorMessage("Invalid Username or Password for this position.");
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="logo">
          <img src={logo} alt="People's Bank" />
        </div>
        <h1 className="page-title">
          Medical Application System ({role ? role.toUpperCase() : ""})
        </h1>
        <div className="top-nav">
          <span onClick={() => navigate("/")} className="nav-link">Home</span>
          <span onClick={() => navigate("/")} className="nav-link">Logout</span>
        </div>
      </header>

      <div className="main-section">
        <form className="login-box" onSubmit={handleLoginSubmit}>
          <div className="form-row">
            <label htmlFor="username">User Name:</label>
            <input 
              type="text" 
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {errorMessage && (
            <div style={{ color: "#8b2626", fontSize: "14px", textAlign: "center", fontWeight: "bold", margin: "0" }}>
              {errorMessage}
            </div>
          )}

          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Login;