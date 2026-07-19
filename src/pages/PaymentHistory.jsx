import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/StaffOfficer.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import jsPDF from "jspdf";
 


const PaymentHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const claim = location.state?.claim;

  // ✅ Safety check
  if (!claim) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>No claim selected</h3>
        <button
          onClick={() => navigate("/paid-claims")}
          style={{
            padding: "8px 12px",
            backgroundColor: "#f1a80a",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back to Paid Claims
        </button>
      </div>
    );
  }

  // Dummy payment history per claim
  const paymentHistoryData = {
    "CLM-001": [
      {
        date: "2025-10-02",
        amount: "LKR 2000",
        method: "Bank Transfer",
        status: "Completed",
      },
    ],
    "CLM-002": [
      {
        date: "2025-09-25",
        amount: "LKR 3000",
        method: "Bank Transfer",
        status: "Completed",
      },
      {
        date: "2025-09-20",
        amount: "LKR 2000",
        method: "Bank Transfer",
        status: "Completed",
      },
    ],
    "CLM-003": [
      {
        date: "2025-10-02",
        amount: "LKR 1500",
        method: "Bank Transfer",
        status: "Completed",
      },
    ],
  };

  const paymentData = paymentHistoryData[claim.id] || [];

  return (
    <div className="home-container">

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src={logo} alt="People's Bank" />
        </div>

        <h1 className="page-title">Payment History</h1>

        <div className="top-nav">
          <span onClick={() => navigate("/paid-claims")} className="nav-link">
            Back
          </span>
          <span onClick={() => navigate("/staff-login")} className="nav-link">
            Logout
          </span>
        </div>
      </header>

      {/* MAIN CONTENT ONLY */}
      <div className="main-section" style={{ justifyContent: "center" }}>
        <main className="inbox-content-card" style={{ width: "90%" }}>

          {/* TITLE */}
          <div className="inbox-header-row">
            <div className="inbox-title-block">
              <h2>Payment History</h2>
              <p>Claim payment breakdown and history</p>
            </div>
          </div>

          {/* CLAIM INFO */}
          <div
            style={{
              background: "#f5f7fb",
              padding: "10px",
              borderRadius: "6px",
              marginTop: "10px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              fontSize: "14px",
            }}
          >
            <span><b>ID:</b> {claim.id}</span>
            <span>|</span>
            <span><b>Service:</b> {claim.serviceNo}</span>
            <span>|</span>
            <span><b>Name:</b> {claim.name}</span>
            <span>|</span>
            <span><b>Category:</b> {claim.category}</span>
          </div>

          {/* SUMMARY CARDS */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "15px",
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "8px",
              }}
            >
              <h4>Total Limit</h4>
              <p><b>LKR 10,000</b></p>
            </div>

            <div
              style={{
                flex: 1,
                padding: "15px",
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "8px",
              }}
            >
              <h4>Deducted</h4>
              <p><b>LKR 7,000</b></p>
            </div>

            <div
              style={{
                flex: 1,
                padding: "15px",
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "8px",
              }}
            >
              <h4>Remaining</h4>
              <p><b>LKR 3,000</b></p>
            </div>
          </div>

          {/* DOWNLOAD */}
          <div style={{ marginTop: "20px" }}>
            <button 

          style={{
                background: "#f1a80a",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => {
                const doc = new jsPDF();
                doc.text("Payment Report", 10, 10);
                doc.text("Claim ID: CLM-003", 10, 20);
                doc.text("Total Limit: LKR 10,000", 10, 30);
                doc.text("Deducted: LKR 7,000", 10, 40);
                doc.text("Remaining: LKR 3,000", 10, 50);
                doc.save("test.pdf");
              }}
            >
              📥 Download Report
            </button>
          </div>

          {/* TABLE */}
          <table
            style={{
              width: "100%",
              marginTop: "20px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#0b1f3a", color: "white" }}>
                <th style={{ padding: "10px" }}>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {paymentData.map((row, index) => (
                <tr key={index} style={{ textAlign: "center" }}>
                  <td style={{ padding: "10px" }}>{row.date}</td>
                  <td><b>{row.amount}</b></td>
                  <td>{row.method}</td>
                  <td>
                    <span
                      style={{
                        background: "#e6f4ea",
                        color: "#2fa86c",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentHistory;