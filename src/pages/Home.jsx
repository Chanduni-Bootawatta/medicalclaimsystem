import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import bgImage from "../assets/medical-bg.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  return (
    <div className="home-container">

      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <h1>Medical Application System</h1>
      </header>

      {/* Main */}
      <div
        className="main-section"
     
      >
        <div className="overlay-box">

          <select
            className="dropdown"
            value={role}   // ✅ controlled dropdown
            onChange={(e) => {
              const value = e.target.value;
              setRole(value);

              if (value === "applier") navigate("/applier-login");
              else if (value === "staff") navigate("/staff-login");
              else if (value === "manager") navigate("/manager-login");
              else if (value === "a") navigate("/a-login");
              else if (value === "b") navigate("/b-login");
            }}
          >
            <option value="" disabled>
              Select Role
            </option>

            <option value="applier">Applier</option>
            <option value="staff">Staff Officer</option>
            <option value="manager">Branch Manager</option>
            <option value="a">A Grade Officer</option>
            <option value="b">B Grade Officer</option>
          </select>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;