import React, { useEffect, useState } from "react";
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

const [paymentData, setPaymentData] = useState([]);
const [loading, setLoading] = useState(true);
const [paidClaim, setPaidClaim] = useState(null);

useEffect(() => {
  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/claims/payment-history"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load payment history"
        );
      }

      const selectedPayment = data.claims.find(
        (item) => item.claim_id === claim.claimId
      );

      if (selectedPayment) {
        setPaidClaim(selectedPayment);
      
        setPaymentData([
          {
            date: selectedPayment.paid_at
              ? new Date(selectedPayment.paid_at).toLocaleString()
              : "—",
            amount: selectedPayment.claimed_amount,
            method: "Payment processed",
            status: selectedPayment.payment_status,
          },
        ]);
      } else {
        setPaidClaim(null);
        setPaymentData([]);
      }
      
    } catch (error) {
      console.error("Payment history error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchPaymentHistory();
}, [claim.claimId]);

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
    <h4>Applicant Claim Amount</h4>
    <p>
      <b>
        LKR {Number(paidClaim?.claim_amount || 0).toLocaleString()}
      </b>
    </p>
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
    <h4>Finalized Claimed Amount</h4>
    <p>
      <b>
        LKR {Number(paidClaim?.claimed_amount|| 0).toLocaleString()}
      </b>
    </p>
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
    <h4>Payment Status</h4>
    <p>
      <b>{claim.status}</b>
    </p>
  </div>
</div>
  {/* DOWNLOAD PAYMENT REPORT */}
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
      doc.text(`Claim ID: ${claim.id}`, 10, 20);
      doc.text(`Service No: ${claim.serviceNo}`, 10, 30);
      doc.text(`Name: ${claim.name}`, 10, 40);
      doc.text(`Category: ${claim.category}`, 10, 50);

      doc.text(
        `Applicant Claim Amount: LKR ${Number(
          claim.claimAmount || 0
        ).toLocaleString()}`,
        10,
        60
      );

      doc.text(
        `Finalized Claimed Amount: LKR ${Number(
          claim.claimedAmount || 0
        ).toLocaleString()}`,
        10,
        70
      );

      doc.text(`Payment Status: ${claim.status}`, 10, 80);

      if (paymentData.length > 0) {
        doc.text(`Payment Date: ${paymentData[0].date}`, 10, 90);
        doc.text(
          `Paid Amount: LKR ${Number(
            paymentData[0].amount || 0
          ).toLocaleString()}`,
          10,
          100
        );
        doc.text(`Payment Method: ${paymentData[0].method}`, 10, 110);
      }

      doc.save(`${claim.id}_payment_report.pdf`);
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
    <th style={{ padding: "10px" }}>Payment</th>
    <th>Amount</th>
    <th>Method</th>
    <th>Status</th>
  </tr>
</thead>

            <tbody>
  {loading ? (
    <tr>
      <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
        Loading payment history...
      </td>
    </tr>
  ) : paymentData.length === 0 ? (
    <tr>
      <td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>
        No payment history found.
      </td>
    </tr>
  ) : (
    paymentData.map((row, index) => (
      <tr key={index} style={{ textAlign: "center" }}>
        <td style={{ padding: "10px" }}>{row.date}</td>

        <td>
          <b>
            LKR {Number(row.amount || 0).toLocaleString()}
          </b>
        </td>

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
    ))
  )}
</tbody>
          </table>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentHistory;