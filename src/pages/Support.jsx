import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/Support.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const Support = () => {

  const navigate = useNavigate();

  return (

    <div className="home-container">

      {/* HEADER */}

      <header className="header">

        <div className="logo">
          <img src={logo} alt="People's Bank" />
        </div>

        <h1 className="page-title">
          Support & Help Center
        </h1>

        <div className="top-nav">
          <span className="nav-link" onClick={() => navigate("/applier-dashboard")}>
            Dashboard
          </span>

          <span className="nav-link" onClick={() => navigate("/")}>
            Logout
          </span>
        </div>

      </header>


      <div className="main-section">

        <div className="support-card">

          <h2>Need Assistance?</h2>

          <p className="support-text">
            If you experience any issues while submitting or tracking your
            medical claims, please contact the Medical Claims Division using
            the information below.
          </p>


          {/* Contact Cards */}

          <div className="contact-grid">

            <div className="contact-box">

              <h3>Medical Claims Division</h3>

              <p><strong>Email</strong></p>
              <p>medicalclaims@peoplesbank.lk</p>

              <p><strong>Telephone</strong></p>
              <p>+94 81 220 1234</p>

            </div>


            <div className="contact-box">

              <h3>Working Hours</h3>

              <p>Monday - Friday</p>
              <p>8.30 AM - 4.30 PM</p>

              <br />

              <p>Saturday, Sunday & Public Holidays</p>
              <p>Closed</p>

            </div>

          </div>


          {/* FAQ */}

          <div className="faq-section">

            <h2>Frequently Asked Questions</h2>

            <table className="faq-table">

              <tbody>

                <tr>
                  <td>How can I submit a medical claim?</td>
                  <td>Go to <b>New Application</b> and complete the claim form.</td>
                </tr>

                <tr>
                  <td>How do I know whether my claim is approved?</td>
                  <td>Check your Notification Inbox and My Claims page.</td>
                </tr>

                <tr>
                  <td>Where can I view payment details?</td>
                  <td>Open the Payments section from your dashboard.</td>
                </tr>

                <tr>
                  <td>What documents should I upload?</td>
                  <td>Prescription, Medical Bills and Reports.</td>
                </tr>

                <tr>
                  <td>Who should I contact if my application is rejected?</td>
                  <td>Contact the Medical Claims Division using the contact details above.</td>
                </tr>

              </tbody>

            </table>

          </div>


          <div className="back-btn-area">

            <button
              className="back-dashboard-btn"
              onClick={() => navigate("/applier-dashboard")}
            >
              Back to Dashboard
            </button>

          </div>

        </div>

      </div>

      <Footer />

    </div>

  );

};

export default Support;