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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();
      console.log("LOGIN USER:", data.user);
      console.log("LOGIN ROLE:", data.user?.role);
      if (!response.ok || !data.success) {
        setErrorMessage(
          data.message || "Invalid Username or Password."
        );
        return;
      }

      // Save logged-in user's details
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Redirect according to database role
      switch (data.user.role) {
        case "staff":
          navigate("/staff-officer");
          break;

        case "manager":
          navigate("/manager");
          break;

        case "a":
          navigate("/a-officer");
          break;

        case "b":
          navigate("/b-officer");
          break;

        case "applier":
          navigate("/applier-dashboard");
          break;

        default:
          setErrorMessage("Invalid user role.");
      }

    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Unable to connect to the server."
      );
    }
  };

  return (
    <div className="home-container">

      <header className="header">

        <div className="logo">
          <img src={logo} alt="People's Bank" />
        </div>

        <h1 className="page-title">
          Medical Application System (
          {role ? role.toUpperCase() : ""}
          )
        </h1>

        <div className="top-nav">

          <span
            onClick={() => navigate("/")}
            className="nav-link"
          >
            Home
          </span>

          <span
            onClick={() => navigate("/")}
            className="nav-link"
          >
            Logout
          </span>

        </div>

      </header>

      <div className="main-section">

        <form
          className="login-box"
          onSubmit={handleLoginSubmit}
        >

          <div className="form-row">

            <label htmlFor="username">
              User Name:
            </label>

            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

          </div>

          <div className="form-row">

            <label htmlFor="password">
              Password:
            </label>

            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          {errorMessage && (
            <div
              style={{
                color: "#8b2626",
                fontSize: "14px",
                textAlign: "center",
                fontWeight: "bold",
                margin: "0"
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>

      </div>

      <Footer />

    </div>
  );
};

export default Login;