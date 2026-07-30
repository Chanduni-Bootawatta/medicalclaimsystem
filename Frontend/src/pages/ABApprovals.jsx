import React, { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Home.css";
import "../styles/StaffOfficer.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const ABApprovals = () => {
  const navigate = useNavigate();

  // 1. Expanded Mock data with the extra details shown in your design screenshot
  const [claims, setClaims] = useState([
    { 
      id: "CLM-001", 
      serviceNo: "SVC123456", 
      name: "K. M. Perera", 
      category: "A-1", 
      date: "2025-10-01", 
      status: "Pending",
      account: "ACC0012345",
      gradeBranch: "B-Grade / Colombo",
      forWho: "Self",
      relation: "Employee",
      period: "2025-09-10 to 2025-09-20",
      doctor: "Dr. S. Samaraweera",
      paidAmount: "LKR 25,000",
      attachments: [{ type: "pdf", name: "Open PDF" }]
    },
    { 
      id: "CLM-002", 
      serviceNo: "SVC999888", 
      name: "A. R. Jayawardena", 
      category: "C", 
      date: "2025-09-28", 
      status: "Approved",
      account: "ACC0099887",
      gradeBranch: "A-Grade / Kandy",
      forWho: "Spouse",
      relation: "Wife",
      period: "2025-09-01 to 2025-09-30",
      doctor: "Dr. H.T. Kumar",
      paidAmount: "LKR 40,000",
      attachments: [{ type: "pdf", name: "Open PDF" }, { type: "image", name: "asset.jpg" }]
    },
    { 
      id: "CLM-003", 
      serviceNo: "SVC654321", 
      name: "N. A. Silva", 
      category: "B-3", 
      date: "2025-10-02", 
      status: "Approved",
      account: "ACC0076543",
      gradeBranch: "C-Grade / Galle",
      forWho: "Child",
      relation: "Son",
      period: "2025-09-15 to 2025-09-22",
      doctor: "Dr. R. Perera",
      paidAmount: "LKR 15,000",
      attachments: [{ type: "image", name: "receipt.jpg" }]
    }
  ]);

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
  className={location.pathname === "/reversed-claims" ? "active-link" : ""}
  onClick={() => navigate("/reversed-claims")}
>
  Reversed Claims
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
                <option value="A-1">A-1</option>
                <option value="B-3">B-3</option>
                <option value="C">C</option>
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
                    <div><strong>Paid Amount:</strong> {selectedClaim.paidAmount}</div>
                  </div>

            

      
   
  <div style={{ display: "flex", gap: "20px", marginTop: "25px" }}>      
  <button
    className="btn-action-forward"
    onClick={() => {
      updateClaimStatus("Approved");
      setShowPopup(true);
    }}
    style={{ backgroundColor: "#f1a80a", color: "#000", border: "none", padding: "8px 15px", borderRadius: "4px", fontWeight: "500", cursor: "pointer" }}
  >
Pay the Claim

  </button>
</div> {showPopup && (
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
                </div>

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
        </main>

      </div>

      <Footer />
    </div>
  );
};

export default ABApprovals;

