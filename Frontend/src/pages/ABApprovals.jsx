import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Home.css";
import "../styles/StaffOfficer.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const ABApprovals = () => {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchABApprovals = async () => {
    try {
      // Fetch pending claims
      const pendingResponse = await fetch(
        "http://127.0.0.1:5000/claims/ab-pending"
      );

      const pendingData = await pendingResponse.json();

      if (!pendingResponse.ok) {
        throw new Error(
          pendingData.message || "Failed to load pending claims"
        );
      }

      const pendingClaims = pendingData.claims.map((claim) => ({
        id: `CLM-${String(claim.claim_id).padStart(3, "0")}`,
        claimId: claim.claim_id,
        serviceNo: claim.service_no,
        name: claim.full_name || "Unknown",
        category: claim.category,
        date: claim.submitted_date || "",
        status: "Pending",
        account: claim.account_no,
        gradeBranch: `${claim.grade} / ${claim.branch}`,
        forWho: claim.claim_for,
        relation: claim.relationship,
        period: claim.treatment_period,
        doctor: claim.doctor_name,
        claimAmount: claim.claim_amount,
        claimedAmount: claim.claimed_amount,
        attachments: []
      }));

      // Fetch approved claims
      const approvedResponse = await fetch(
        "http://127.0.0.1:5000/claims/ab-approved"
      );

      const approvedData = await approvedResponse.json();

      if (!approvedResponse.ok) {
        throw new Error(
          approvedData.message || "Failed to load approved claims"
        );
      }

      const approvedClaims = approvedData.claims.map((claim) => ({
        id: `CLM-${String(claim.claim_id).padStart(3, "0")}`,
        claimId: claim.claim_id,
        serviceNo: claim.service_no,
        name: claim.full_name || "Unknown",
        category: claim.category,
        date: claim.treatment_start_date || "",
        status: "Approved",
        account: claim.account_no,
        gradeBranch: `${claim.grade} / ${claim.branch}`,
        forWho: claim.claim_for,
        relation: claim.relationship,
        period: claim.treatment_period,
        doctor: claim.doctor_name,
        claimAmount: claim.claim_amount,
        claimedAmount: claim.claimed_amount,
        attachments: []
      }));

      // Fetch rejected claims
      const rejectedResponse = await fetch(
        "http://127.0.0.1:5000/claims/ab-rejected"
      );

      const rejectedData = await rejectedResponse.json();

      if (!rejectedResponse.ok) {
        throw new Error(
          rejectedData.message || "Failed to load rejected claims"
        );
      }

      const rejectedClaims = rejectedData.claims.map((claim) => ({
        id: `CLM-${String(claim.claim_id).padStart(3, "0")}`,
        claimId: claim.claim_id,
        serviceNo: claim.service_no,
        name: claim.full_name || "Unknown",
        category: claim.category,
        date: claim.treatment_start_date || "",
        status: "Rejected",
        account: claim.account_no,
        gradeBranch: `${claim.grade} / ${claim.branch}`,
        forWho: claim.claim_for,
        relation: claim.relationship,
        period: claim.treatment_period,
        doctor: claim.doctor_name,
        claimAmount: claim.claim_amount,
        claimedAmount: claim.claimed_amount,
        attachments: []
      }));

      // Combine all three
      setClaims([
        ...pendingClaims,
        ...approvedClaims,
        ...rejectedClaims
      ]);

    } catch (error) {
      console.error("A & B approvals error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchABApprovals();
}, []);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");       // typing
  const [appliedSearch, setAppliedSearch] = useState("");   // actual search
  const [showPopup, setShowPopup] = useState(false);
  const [claimAmount, setClaimAmount] = useState("");
   const location = useLocation();
  
  // 2. State to track the active/clicked claim details
  const [selectedClaim, setSelectedClaim] = useState(null);

  const updateClaimStatus = (newStatus) => {
    if (!selectedClaim) return;
  
    setClaims((prevClaims) =>
      prevClaims.map((claim) =>
        claim.id === selectedClaim.id
          ? { ...claim, status: newStatus }
          : claim
      )
    );
  
    setSelectedClaim((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#fbe7e1", color: "#d97456", border: "1px solid #f5cbbd" };
      case "Approved":
        return { backgroundColor: "#e2f7ed", color: "#2fa86c", border: "1px solid #c2eed8" };
      
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
              <h2>A & B Grade Approvals</h2>
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
                    onClick={() => setSelectedClaim(claim)}
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
                  
                  <hr style={{ border: "0.5px solid #eee", margin: "15px 0" }} />
                  
                  <div className="details-data-grid" style={{ lineHeight: "1.8" }}>
                    <div><strong>For:</strong> {selectedClaim.forWho} &nbsp;&nbsp; <strong>Relation:</strong> {selectedClaim.relation}</div>
                    <div><strong>Period:</strong> {selectedClaim.period}</div>
                    <div><strong>Doctor:</strong> {selectedClaim.doctor}</div>
                    <div><strong>Category:</strong> {selectedClaim.category}</div>
                    <div>
                    <strong>Applicant Claim Amount:</strong>{" "}
                    Rs. {Number(selectedClaim.claimAmount || 0).toLocaleString()}
                    </div>
                    <div>
                    <strong>Finalized Claimed Amount:</strong>{" "}
                     Rs. {Number(selectedClaim.claimedAmount || 0).toLocaleString()}
                    </div>
                  </div>

            

      
   
                  {selectedClaim.status === "Approved" && (
  <div
    style={{
      display: "flex",
      gap: "20px",
      marginTop: "25px",
    }}
  >
    <button
      className="btn-action-forward"
      onClick={async () => {
        if (!selectedClaim) return;

        try {
          const response = await fetch(
            `http://127.0.0.1:5000/claims/${selectedClaim.claimId}/pay`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              data.message || "Failed to process payment"
            );
          }

          console.log("PAYMENT RESULT:", data);

          setClaims((prevClaims) =>
            prevClaims.filter(
              (claim) =>
                claim.claimId !== selectedClaim.claimId
            )
          );

          setSelectedClaim(null);
          setShowPopup(true);

        } catch (error) {
          console.error("Payment error:", error);
          alert(
            error.message || "Unable to process payment."
          );
        }
      }}
      style={{
        backgroundColor: "#f1a80a",
        color: "#000",
        border: "none",
        padding: "8px 15px",
        borderRadius: "4px",
        fontWeight: "500",
        cursor: "pointer",
      }}
    >
      Pay the Claim
    </button>
  </div>
)}</div>

                {/* Right Attachments Side */}
                <div className="details-right-side" style={{ flex: "1", borderLeft: "1px solid #eee", paddingLeft: "20px" }}>
                  <h3 className="section-heading">Attachments</h3>
                  <div className="attachments-wrapper" style={{ marginTop: "15px" }}>
                    {selectedClaim.attachments && selectedClaim.attachments.map((file, idx) => (
                      <div key={idx} className="attachment-row-item" style={{ marginBottom: "10px" }}>
                        <a href={`#download-${file.name}`} className="attachment-link-btn" style={{ display: "block", padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", background: "#f9f9f9", textDecoration: "none", color: "#0056b3", fontSize: "14px" }}>
                          {file.type === "pdf" ? "📄 " : "🖼️ "} {file.name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
             
          )}              
{showPopup && (
  <div className="popup-overlay">
    <div className="popup-box">
      <h3>Claim Payment Confirmed!</h3>

      <button
        className="popup-btn"
        onClick={() => setShowPopup(false)}
      >
        OK
      </button>
    </div>
  </div>
)}

</main>

      </div>

      <Footer />
    </div>
  );
};

export default ABApprovals;

