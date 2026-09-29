import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/StaffOfficer.css";
import "../styles/Manager.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const Manager = () => {
  const navigate = useNavigate();

const [claims, setClaims] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchClaims = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/claims"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load claims");
      }

      const managerClaims = data
        .filter((claim) => claim.status === "MANAGER_REVIEW")
        .map((claim) => ({
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
          attachments: []
        }));

      setClaims(managerClaims);

    } catch (error) {
      console.error("Error loading manager claims:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchClaims();
}, []);


  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");       // typing
  const [appliedSearch, setAppliedSearch] = useState("");   // actual search
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  
  // 2. State to track the active/clicked claim details
  const [selectedClaim, setSelectedClaim] = useState(null);
  const updateManagerClaimStatus = async (action) => {
    if (!selectedClaim) return false;
  
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/claims/${selectedClaim.claimId}/manager-action`,
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
          data.message || "Manager action failed"
        );
      }
  
      console.log("MANAGER ACTION RESULT:", data);
  
      // Remove processed claim from Manager Inbox
      setClaims((prevClaims) =>
        prevClaims.filter(
          (claim) => claim.claimId !== selectedClaim.claimId
        )
      );
  
      setSelectedClaim(null);
  
      return true;
  
    } catch (error) {
      console.error("Manager action error:", error);
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
  };
  
  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src={logo} alt="People's Bank" />
        </div>
        <h1 className="page-title">Branch Manager Inbox</h1>
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
            <li className="active-link">Inbox</li>
         

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
                  <div>
                  <strong>Applicant Claim Amount:</strong>{" "}
                   Rs. {Number(selectedClaim.claimAmount || 0).toLocaleString()}
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
                 className="btn-action-approve"
                 onClick={async () => {
                   const success = await updateManagerClaimStatus("APPROVE");
                
                   if (success) {
                     setShowPopup(true);
                   }
                 }}
                >
                 Approve
                </button>
                <button
  className="btn-action-reject"
  onClick={async () => {
    const success = await updateManagerClaimStatus("REJECT");

    if (success) {
      setPopupMessage("Claim has been rejected successfully.");
      setShowPopup(true);
    }
  }}
>
  Reject
</button>

  <button
    className="btn-action-close"
    onClick={() => setSelectedClaim(null)}
   
  >
    Close
  </button>
</div>
{showPopup && (
  <div className="popup-overlay">
    <div className="popup-box">
      <h3>Action Completed</h3>

      <p>{popupMessage}</p>

      <button
        className="popup-btn"
        onClick={() => {
          setShowPopup(false);
          setPopupMessage("");
        }}
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

export default Manager;