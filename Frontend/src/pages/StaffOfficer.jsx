import React, { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Home.css";
import "../styles/StaffOfficer.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const StaffOfficer = () => {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");       // typing
  const [appliedSearch, setAppliedSearch] = useState("");   // actual search
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/claims"
        );
  
        const data = await response.json();

        console.log("CLAIMS FROM BACKEND:", data);
  
        if (!response.ok) {
          throw new Error("Failed to load claims");
        }
  
        const formattedClaims = data.map((claim) => ({
          id: claim.claim_id,
          serviceNo: claim.service_no,
          name: claim.full_name || "Unknown",
          category: claim.category,
          date: claim.submitted_date || "",
          status: claim.status || "PENDING",
          account: claim.account_no,
          gradeBranch: `${claim.grade} / ${claim.branch}`,
          forWho: claim.claim_for,
          relation: claim.relationship,
          period: claim.treatment_period,
          doctor: claim.doctor_name,
          claimAmount: claim.claim_amount,
          attachments: []
        }));
  
        setClaims(formattedClaims);
  
      } catch (error) {
        console.error("Error loading claims:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchClaims();
  }, []);
  
  // 2. State to track the active/clicked claim details
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [fraudResult, setFraudResult] = useState(null);

  const updateClaimStatus = async (action) => {
    if (!selectedClaim) return;
  
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/claims/${selectedClaim.id}/staff-action`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: action,
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Staff action failed"
        );
      }
  
      // Update the claim in the React interface
      setClaims((prevClaims) =>
        prevClaims.map((claim) =>
          claim.id === selectedClaim.id
            ? {
                ...claim,
                status: data.status,
              }
            : claim
        )
      );
  
      setSelectedClaim((prev) => ({
        ...prev,
        status: data.status,
      }));
  
      console.log("STAFF ACTION RESULT:", data);
      return true;
  
    } catch (error) {
      console.error("Staff action error:", error);
      alert("Unable to update claim status.");
      return false;
    }
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#fbe7e1", color: "#d97456", border: "1px solid #f5cbbd" };
      case "Approved":
        return { backgroundColor: "#e2f7ed", color: "#2fa86c", border: "1px solid #c2eed8" };
      case "Sent":
        return { backgroundColor: "#e1e6fe", color: "#586ff7", border: "1px solid #c8d0fd" };
        case "Rejected":
  return { backgroundColor: "#fde2e2",color: "#d93025",border: "1px solid #f5b5b5"
  };
      default:
        return {};
    }
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesCategory =
      categoryFilter === "All" || claim.category === categoryFilter;
  
    const matchesStatus =
      statusFilter === "All" || claim.status === statusFilter;
  
      const matchesSearch =
      appliedSearch === "" ||
      claim.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      claim.serviceNo.toLowerCase().includes(appliedSearch.toLowerCase());
  
    return matchesCategory && matchesStatus && matchesSearch;
  });
  const handleRefresh = () => {
    setCategoryFilter("All");
    setStatusFilter("All");
    setSearchQuery("");
    setAppliedSearch("");
    setSelectedClaim(null);
    setFraudResult(null);
  };
  
  
  
  const checkFraud = async () => {
    if (!selectedClaim) return;
  
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/claims/${selectedClaim.id}/fraud-check`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prescription_provided: 1,
            medical_bills_provided: 1,
            reports_provided: 1,
            document_mismatch: 0,
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Fraud detection failed"
        );
      }
  
      setFraudResult(data);
  
    } catch (error) {
      console.error("Fraud detection error:", error);
  
      setFraudResult({
        fraud_status: "ERROR",
        risk_level: "Error",
        message: "Unable to perform fraud detection."
      });
    }
  };
  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src={logo} alt="People's Bank" />
        </div>
        <h1 className="page-title">Staff Officer Inbox</h1>
        <div className="top-nav">
          <span onClick={() => navigate("/")} className="nav-link">Home</span>
          <span onClick={() => navigate("/staff-login")} className="nav-link">Logout</span>
        </div>
      </header>

      {/* Main Workspace split into Sidebar and Dashboard Content */}
      <div className="main-section inbox-layout-container">
        
        {/* Left Side: Menu and Filters Column */}
        <aside className="sidebar-container">
          <div className="menu-section">
            <h3>Menu</h3>
            <ul className="menu-links">
            <li
  className={location.pathname === "/staff-officer" ? "active-link" : ""}
  onClick={() => navigate("/staff-officer")}
>
  Inbox
</li>

<li
  className={location.pathname === "/manager-approvals" ? "active-link" : ""}
  onClick={() => navigate("/manager-approvals")}
>
  Manager Approvals
</li>


<li
  className={location.pathname === "/ab-approvals" ? "active-link" : ""}
  onClick={() => navigate("/ab-approvals")}
>
  A & B Grade Approvals
</li>

<li
  className={location.pathname === "/paid-claims" ? "active-link" : ""}
  onClick={() => navigate("/paid-claims")}
>
  Paid Claims
</li>
</ul>
          </div>

          

          <hr className="sidebar-divider" />

          <div className="filter-section">
            <span className="filter-title-label">Filters</span>
            
            <div className="filter-group">
              <label>Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="OPD">OPD</option>
              <option value="Dental">Dental</option>
              <option value="Eye Care">Eye Care</option>
              <option value="Surgery">Surgery</option>
              <option value="Hospitalization">Hospitalization</option>
              <option value="Laboratory">Laboratory</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Sent">Sent</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            

            <button className="refresh-btn" onClick={handleRefresh}>
  Refresh
</button>
          </div>
        </aside>

        {/* Right Side: Inbox Contents Block */}
        <main className="inbox-content-card">
          <div className="inbox-header-row">
            <div className="inbox-title-block">
              <h2>Inbox</h2>
              <p>Click a claim to view details and attachments (inline preview).</p>
            </div>
            
            <div className="inbox-actions-block">
            <input 
  type="text"
  placeholder="Search by name or Service No"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="search-input"
/>

<button 
  className="new-claim-btn"
  onClick={() => setAppliedSearch(searchQuery)}
>
  Search
</button>
           
            </div>
          </div>

          {/* Table Element */}
          <div className="table-responsive-wrapper">
            <table className="claims-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service No</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
              {filteredClaims.map((claim) => (
                  <tr 
                  key={claim.id} 
                  onClick={async () => {
                    setSelectedClaim(claim);
                    setFraudResult(null);
                
                    try {
                      const response = await fetch(
                        `http://127.0.0.1:5000/attachments/${claim.id}`
                      );
                
                      const data = await response.json();

console.log("ATTACHMENT RESPONSE:", data);

if (data.success) {
  setSelectedClaim({
    ...claim,
    attachments: data.attachments
  });
} 
                    } catch (error) {
                      console.error("Error loading attachments:", error);
                    }
                  }}
                    className={`table-row-clickable ${selectedClaim?.id === claim.id ? "active-row" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="bold-id">{claim.id}</td>
                    <td>{claim.serviceNo}</td>
                    <td>{claim.name}</td>
                    <td>{claim.category}</td>
                    <td>{claim.date}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="status-badge" style={getStatusStyle(claim.status)}>
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Conditional Detail Panel Rendering */}
          {selectedClaim && (
            <div className="claim-details-panel">
              <div className="details-split-container" style={{ display: "flex", justifyContent: "space-between", marginTop: "25px" }}>
                
                {/* Left Metadata Side */}
                <div className="details-left-side" style={{ flex: "2", paddingRight: "40px" }}>
                  <h3 className="section-heading">Claim Details</h3>
                  <p className="details-meta-id">ID: {selectedClaim.id} • Submitted: {selectedClaim.date}</p>
                  
                  <div className="details-data-grid" style={{ lineHeight: "1.8", margin: "15px 0" }}>
  <div><strong>Service No:</strong> {selectedClaim.serviceNo}</div>
  <div><strong>Account:</strong> {selectedClaim.account}</div>
  <div><strong>Name:</strong> {selectedClaim.name}</div>
  <div><strong>Grade / Branch:</strong> {selectedClaim.gradeBranch}</div>
</div>

<div
  style={{
    marginTop: "15px",
    padding: "12px 15px",
    backgroundColor: "#f5f7ff",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "17px"
  }}
>
  <strong>Applicant Claim Amount:</strong>{" "}
  <span style={{ fontWeight: "bold" }}>
    Rs. {Number(selectedClaim.claimAmount || 0).toLocaleString()}
  </span>
</div>
                  
                  <hr style={{ border: "0.5px solid #eee", margin: "15px 0" }} />
                  
                  <div className="details-data-grid" style={{ lineHeight: "1.8" }}>
                    <div><strong>For:</strong> {selectedClaim.forWho} &nbsp;&nbsp; <strong>Relation:</strong> {selectedClaim.relation}</div>
                    <div><strong>Period:</strong> {selectedClaim.period}</div>
                    <div><strong>Doctor:</strong> {selectedClaim.doctor}</div>
                    <div><strong>Category:</strong> {selectedClaim.category}</div>
                   

              
                  </div>

                  {/* Notes Textarea */}
                  <div className="notes-container" style={{ marginTop: "20px" }}>
                    <textarea 
                      placeholder="Add review notes (Optional)" 
                      className="review-notes-textarea"
                      style={{ width: "100%", height: "60px", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                    />
                  </div>

                  {/* Action Buttons Group */}
                  <div className="details-actions" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
 
 className="btn-action-fraud"
  onClick={checkFraud}
  style={{
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "4px",
    cursor: "pointer"
  }}
>
  🔍 Check Fraud
</button>
<button
  className="btn-action-approve"
  onClick={async () => {
    const success = await updateClaimStatus("APPROVE");

    if (success) {
      setPopupMessage("Claim has been approved successfully.");
      setShowPopup(true);
    }
  }}
  style={{
    backgroundColor: "#8a2b2b",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "4px",
    cursor: "pointer"
  }}
>
  Approved
</button>

<button
  className="btn-action-reject"
  onClick={async () => {
    const success = await updateClaimStatus("REJECT");

    if (success) {
      setPopupMessage("Claim has been rejected successfully.");
      setShowPopup(true);
    }
  }}
  style={{
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #ccc",
    padding: "8px 15px",
    borderRadius: "4px",
    cursor: "pointer"
  }}
>
  Reject
</button>

<button
  className="btn-action-forward"
  onClick={async () => {
    const success = await updateClaimStatus("SEND_MANAGER");

    if (success) {
      setPopupMessage(
        "Claim has been approved and sent to Manager for approval."
      );
      setShowPopup(true);
    }
  }}
  style={{
    backgroundColor: "#f1a80a",
    color: "#000",
    border: "none",
    padding: "8px 15px",
    borderRadius: "4px",
    fontWeight: "500",
    cursor: "pointer"
  }}
>
  Approve & Send to Manager
</button>

  <button
    className="btn-action-close"
    onClick={() => {
      setSelectedClaim(null);
      setFraudResult(null);
    }}
    style={{ backgroundColor: "#fff", color: "#333", border: "1px solid #ccc", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}
  >
    Close
  </button>
</div> {showPopup && (
  <div className="popup-overlay">
    <div className="popup-box">

      <h3>Action Completed</h3>

      <p>{popupMessage}</p>

      <button
        className="popup-btn"
        onClick={() => {
          setShowPopup(false);
          setPopupMessage("");
          setSelectedClaim(null);
          setFraudResult(null);
        }}
      >
        OK
      </button>

    </div>
  </div>
)}

{fraudResult && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      background: "#f5f7ff",
      borderRadius: "8px",
      border: "1px solid #ddd"
    }}
  >
    <h3>Hybrid Fraud Detection Result</h3>

    <p>
      <strong>Fraud Status:</strong>{" "}
      {fraudResult.fraud_status}
    </p>

    <p>
      <strong>Rule-Based Score:</strong>{" "}
      {fraudResult.rule_score}%
    </p>

    <p>
      <strong>ML Score:</strong>{" "}
      {fraudResult.ml_score}%
    </p>

    <p>
      <strong>Hybrid Score:</strong>{" "}
      {fraudResult.hybrid_score}%
    </p>

    <p>
      <strong>Risk Level:</strong>{" "}
      {fraudResult.risk_level}
    </p>
  </div>
)}
                </div>

                {/* Right Attachments Side */}
                <div className="details-right-side" style={{ flex: "1", borderLeft: "1px solid #eee", paddingLeft: "20px" }}>
                  <h3 className="section-heading">Attachments</h3>
                  <div className="attachments-wrapper" style={{ marginTop: "15px" }}>
                  {selectedClaim.attachments &&
  selectedClaim.attachments.map((file, idx) => {

    return (
      <div
        key={idx}
        className="attachment-row-item"
        style={{ marginBottom: "10px" }}
      >
        <a
          href={`http://127.0.0.1:5000/attachments/file/${file.attachment_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="attachment-link-btn"
          style={{
            display: "block",
            padding: "6px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            background: "#f9f9f9",
            textDecoration: "none",
            color: "#0056b3",
            fontSize: "14px"
          }}
        >
          {file.file_type?.includes("pdf") ? "📄 " : "🖼️ "}
          {file.file_name}
        </a>
      </div>
    );
  })}
                 
                  </div>
                </div>

              </div>
            </div>
             
          )}
        </main>

      </div>

      <Footer />
    </div>
  );
};

export default StaffOfficer;