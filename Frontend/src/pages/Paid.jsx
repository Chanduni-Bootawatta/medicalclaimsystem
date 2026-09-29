import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Home.css";
import "../styles/StaffOfficer.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const Paid = () => {
  const navigate = useNavigate();

 
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaidClaims = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/claims/payment-history"
        );
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load paid claims"
          );
        }
  
        const paidClaims = data.claims.map((claim) => ({
          id: `CLM-${String(claim.claim_id).padStart(3, "0")}`,
          claimId: claim.claim_id,
          serviceNo: claim.service_no,
          name: claim.full_name || "Unknown",
          category: claim.category,
          date: claim.treatment_start_date || "",
          status: "Paid",
          account: claim.account_no,
          gradeBranch: `${claim.grade} / ${claim.branch}`,
          forWho: claim.claim_for,
          relation: claim.relationship,
          period: claim.treatment_period,
          doctor: claim.doctor_name,
          paidAmount: claim.claimed_amount,
          attachments: []
        }));
  
        setClaims(paidClaims);
  
      } catch (error) {
        console.error("Paid claims error:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPaidClaims();
  }, []);

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");       // typing
  const [appliedSearch, setAppliedSearch] = useState("");   // actual search

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
      
        case "Paid":
  return { backgroundColor: "#f1a80a",color: "#821f1f",border: "1px solidrgb(51, 4, 4)"
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
  
    window.location.reload();
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
              <h2>Paid Claims</h2>
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
    
    <th style={{ textAlign: "center" }}>Status</th>
    <th style={{ textAlign: "center" }}>History</th>
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
                   
                    <td style={{ textAlign: "center" }}>
                      <span className="status-badge" style={getStatusStyle(claim.status)}>
                        {claim.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                  <button
                 className="history-btn"
                 onClick={(e) => {
                    e.stopPropagation();
                    navigate("/payment-history", { state: { claim } });
                  }}
             style={{
                   backgroundColor: "#fbe7e1", color: "#821f1f", border: "1px solid #821f1f", padding: "4px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "500", cursor: "pointer"
                  }}
                  >
             View History
           </button>
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
                    <div><strong>Paid Amount:</strong> Rs. {selectedClaim.paidAmount}</div>
                  </div>

                 




  <button
    className="btn-action-close"
    onClick={() => setSelectedClaim(null)}
    style={{ backgroundColor: "#f1a80a", color: "#000", border: "none", padding: "8px 15px", borderRadius: "4px", fontWeight: "500", cursor: "pointer" }}
  >
    Close
  </button>


      
   
  

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

export default Paid;

