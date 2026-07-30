import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const RELATIONSHIPS = ["Self", "Wife", "Husband", "Child"];
const CLAIM_CATEGORIES = ["A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "D", "E"];

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    serviceNo: "",
    accountNo: "",
    grade: "",
    fullName: "",
    branch: "",
    claimFor: "",
    relationship: "",
    periodOfTreatment: "",
    doctorName: "",
    claimCategory: "",
  });

  const [files, setFiles] = useState({
    prescription: null,
    medicalBills: [],
    reports: null,
  });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (key, e, multi = false) =>
    setFiles((p) => ({
      ...p,
      [key]: multi ? Array.from(e.target.files) : e.target.files[0] || null,
    }));

  return (
    <div className="home-container">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <h1>Medical Application Form</h1>
        <div className="top-nav">
          <span onClick={() => navigate("/")} className="nav-link">Home</span>
        </div>
      </header>

      {/* MAIN */}
      <div className="main-section">
        <div className="overlay-box2">
          {/* PAGE 1 */}
          {page === 1 && (
            <>
              <h3>Personal & Service Details</h3>

              <div className="grid-3">
                <input name="serviceNo" placeholder="Service No" onChange={handleChange} value={form.serviceNo} />
                <input name="accountNo" placeholder="Account No" onChange={handleChange} value={form.accountNo} />
                <input name="grade" placeholder="Grade" onChange={handleChange} value={form.grade} />
              </div>

              <input name="fullName" placeholder="Full Name" onChange={handleChange} value={form.fullName} />
              <input name="branch" placeholder="Branch" onChange={handleChange} value={form.branch} />

              <h3>Patient Details</h3>

              <input name="claimFor" placeholder="Claim For" onChange={handleChange} value={form.claimFor} />

              <select name="relationship" onChange={handleChange} value={form.relationship}>
                <option value="">Relationship</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <h3>Treatment Details</h3>

              <input
                name="periodOfTreatment"
                placeholder="Treatment Period"
                onChange={handleChange}
                value={form.periodOfTreatment}
              />
              <input name="doctorName" placeholder="Doctor Name" onChange={handleChange} value={form.doctorName} />

              <h3>Claim Category</h3>

              <select name="claimCategory" onChange={handleChange} value={form.claimCategory}>
                <option value="">Select Category</option>
                {CLAIM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button className="next-btn" onClick={() => setPage(2)}>
                →
              </button>
            </>
          )}

          {/* PAGE 2 */}
          {page === 2 && (
            <>
              <h3>Attachments</h3>

              <div className="file-input-group" style={{ display: "flex", flexDirection: "column", gap: "15px", margin: "15px 0" }}>
                <label>Prescription:</label>
                <input type="file" onChange={(e) => handleFile("prescription", e)} />
                
                <label>Medical Bills:</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFile("medicalBills", e, true)}
                />
                
                <label>Reports:</label>
                <input type="file" onChange={(e) => handleFile("reports", e)} />
              </div>

              <div className="btn-row">
                <button className="back-btn" onClick={() => setPage(1)}>
                  ←
                </button>

                <button className="draft-btn" onClick={() => alert("Draft Saved")}>
                  Save Draft
                </button>

                <button
                  className="submit-btn"
                  onClick={() => setShowModal(true)}
                >
                  Submit
                </button>
              </div>
            </>
          )}

          {/* SUBMISSION MODAL OVERLAY */}
          {showModal && (
            <div className="modal" style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
            }}>
              <div className="modal-box" style={{ background: "white", padding: "30px", borderRadius: "8px", textAlign: "center" }}>
                <p style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "20px", color: "#333" }}>
                  Application Submitted Successfully!
                </p>

                <button className="login-btn" style={{ margin: "5px" }} onClick={() => alert("Download PDF")}>
                  Download PDF
                </button>

                <button className="back-btn" style={{ margin: "5px", background: "#666", color: "white" }}
                  onClick={() => {
                    setShowModal(false);
                    setPage(1);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ApplicationForm;