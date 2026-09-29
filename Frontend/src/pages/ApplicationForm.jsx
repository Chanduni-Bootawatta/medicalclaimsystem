import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import jsPDF from "jspdf";

const RELATIONSHIPS = [
  "Self",
  "Spouse",
  "Child",
  "Parent",
];

const CLAIM_FOR_OPTIONS = [
  "Employee",
  "Dependent",
];

const CLAIM_CATEGORIES = [
  "OPD",
  "Dental",
  "Eye Care",
  "Surgery",
  "Hospitalization",
  "Laboratory",
];

const HOSPITAL_TYPES = [
  "Government",
  "Private",
  "Teaching Hospital",
  "Other",
];

const ApplicationForm = () => {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

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

    treatmentStartDate: "",
    treatmentEndDate: "",

    doctorName: "",

    claimCategory: "",
    claimAmount: "",

    hospitalType: "",
    hospitalStayDays: "",

    highRiskProcedureFlag: "0",
  });

  const [files, setFiles] = useState({
    prescription: null,
    medicalBills: [],
    reports: null,
  });

  const handleChange = (e) => {
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = (key, e, multi = false) => {
    setFiles((p) => ({
      ...p,
      [key]: multi
        ? Array.from(e.target.files)
        : e.target.files[0] || null,
    }));
  };

  const downloadSubmittedForm = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text("Medical Claim Application Form", 20, 20);
  
    doc.setFontSize(11);
  
    doc.text(`Service No: ${form.serviceNo}`, 20, 35);
    doc.text(`Account No: ${form.accountNo}`, 20, 45);
    doc.text(`Grade: ${form.grade}`, 20, 55);
    doc.text(`Full Name: ${form.fullName}`, 20, 65);
    doc.text(`Branch: ${form.branch}`, 20, 75);
  
    doc.text(`Claim For: ${form.claimFor}`, 20, 90);
    doc.text(`Relationship: ${form.relationship}`, 20, 100);
  
    doc.text(
      `Treatment Start Date: ${form.treatmentStartDate}`,
      20,
      115
    );
  
    doc.text(
      `Treatment End Date: ${form.treatmentEndDate}`,
      20,
      125
    );
  
    doc.text(`Doctor Name: ${form.doctorName}`, 20, 135);
  
    doc.text(`Hospital Type: ${form.hospitalType}`, 20, 150);
  
    doc.text(`Category: ${form.claimCategory}`, 20, 160);
  
    doc.text(
      `Claim Amount: LKR ${Number(
        form.claimAmount || 0
      ).toLocaleString()}`,
      20,
      170
    );
  
    doc.text(
      `Hospital Stay Days: ${form.hospitalStayDays}`,
      20,
      180
    );
  
    doc.text(
      `Procedure Type: ${
        form.highRiskProcedureFlag === "1"
          ? "High-Risk Procedure"
          : "Normal Procedure"
      }`,
      20,
      190
    );
  
    doc.text("Status: Submitted", 20, 210);
  
    doc.save(
      `Medical_Claim_CLM_${new Date().getTime()}.pdf`
    );
  };

  const handleNext = () => {
    setPage(2);
  };

  const handleSubmit = async () => {
    try {
      // 1. Create the claim first
      const response = await fetch("http://127.0.0.1:5000/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: loggedInUser?.user_id,
          service_no: form.serviceNo,
          account_no: form.accountNo,
          grade: form.grade,
          branch: form.branch,
          claim_for: form.claimFor,
          relationship: form.relationship,
          treatment_start_date: form.treatmentStartDate,
          treatment_end_date: form.treatmentEndDate,
          doctor_name: form.doctorName,
          category: form.claimCategory,
          claim_amount: Number(form.claimAmount),
          hospital_type: form.hospitalType,
          hospital_stay_days: Number(form.hospitalStayDays),
          high_risk_procedure_flag: Number(form.highRiskProcedureFlag),
        }),
      });
  
      const data = await response.json();
  
      if (!data.success) {
        alert(data.message || "Claim submission failed");
        return;
      }
  
      // 2. Get the newly created claim ID
      const claimId = data.claim_id;
  
      console.log("Claim created:", claimId);
  
      // 3. Upload attachments
      const uploadFile = async (file) => {
        const formData = new FormData();
  
        formData.append("file", file);
        formData.append("claim_id", claimId);
  
        const uploadResponse = await fetch(
          "http://127.0.0.1:5000/attachments",
          {
            method: "POST",
            body: formData,
          }
        );
  
        const uploadData = await uploadResponse.json();
  
        if (!uploadData.success) {
          throw new Error(uploadData.message || "File upload failed");
        }
  
        return uploadData;
      };
  
      // Prescription
      if (files.prescription) {
        await uploadFile(files.prescription);
      }
  
      // Medical bills
      for (const file of files.medicalBills) {
        await uploadFile(file);
      }
  
      // Reports
      if (files.reports) {
        await uploadFile(files.reports);
      }
  
      // 4. Run hybrid fraud detection
const fraudResponse = await fetch(
  `http://127.0.0.1:5000/claims/${claimId}/fraud-check`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prescription_provided: files.prescription ? 1 : 0,
      medical_bills_provided: files.medicalBills.length > 0 ? 1 : 0,
      reports_provided: files.reports ? 1 : 0,

      // No separate document-mismatch field exists
      // in the current application form.
      document_mismatch: 0,
    }),
  }
);

const fraudData = await fraudResponse.json();

if (!fraudData.success) {
  throw new Error(
    fraudData.message || "Fraud detection failed"
  );
}

// Display result for testing
console.log("========== HYBRID FRAUD RESULT ==========");
console.log("Fraud Status:", fraudData.fraud_status);
console.log("Rule Score:", fraudData.rule_score);
console.log("ML Score:", fraudData.ml_score);
console.log("Hybrid Score:", fraudData.hybrid_score);
console.log("Risk Level:", fraudData.risk_level);
console.log("==========================================");

// 5. Everything successful
console.log(
  "Claim, attachments and hybrid fraud detection completed"
);

setShowModal(true);
  
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "Submission failed. Please check the backend.");
    }
  };
  return (
    <div className="home-container">

      {/* HEADER */}
      <header className="header">

        <div className="logo">
          <img src={logo} alt="logo" />
        </div>

        <h1>Medical Application Form</h1>

        <div className="top-nav">
          <span
            onClick={() => navigate("/")}
            className="nav-link"
          >
            Home
          </span>
        </div>

      </header>

      {/* MAIN */}
      <div className="main-section">

        <div className="overlay-box2">

          {/* ========================= */}
          {/* PAGE 1 */}
          {/* ========================= */}

          {page === 1 && (
            <>

              {/* PERSONAL & SERVICE DETAILS */}
              <h3>Personal & Service Details</h3>

              <div className="grid-3">

                <input
                  name="serviceNo"
                  placeholder="Service No"
                  onChange={handleChange}
                  value={form.serviceNo}
                />

                <input
                  name="accountNo"
                  placeholder="Account No"
                  onChange={handleChange}
                  value={form.accountNo}
                />

                <input
                  name="grade"
                  placeholder="Grade"
                  onChange={handleChange}
                  value={form.grade}
                />

              </div>

              <input
                name="fullName"
                placeholder="Full Name"
                onChange={handleChange}
                value={form.fullName}
              />

              <input
                name="branch"
                placeholder="Branch"
                onChange={handleChange}
                value={form.branch}
              />


              {/* PATIENT DETAILS */}
              <h3>Patient Details</h3>

              <select
               name="claimFor"
               onChange={handleChange}
               value={form.claimFor}
                >
            <option value="">
             Claim For
              </option>

          {CLAIM_FOR_OPTIONS.map((option) => (
          <option key={option} value={option}>
          {option}
          </option>
          ))}
           </select>

              <select
                name="relationship"
                onChange={handleChange}
                value={form.relationship}
              >

                <option value="">
                  Relationship
                </option>

                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}

              </select>


              {/* TREATMENT DETAILS */}
              <h3>Treatment Details</h3>

              <div className="grid-3">

                <div>
                  <label>Treatment Start Date</label>

                  <input
                    type="date"
                    name="treatmentStartDate"
                    onChange={handleChange}
                    value={form.treatmentStartDate}
                  />
                </div>

                <div>
                  <label>Treatment End Date</label>

                  <input
                    type="date"
                    name="treatmentEndDate"
                    onChange={handleChange}
                    value={form.treatmentEndDate}
                  />
                </div>

                <input
                  name="hospitalStayDays"
                  type="number"
                  min="0"
                  placeholder="Hospital Stay Days"
                  onChange={handleChange}
                  value={form.hospitalStayDays}
                />

              </div>

              <input
                name="doctorName"
                placeholder="Doctor Name"
                onChange={handleChange}
                value={form.doctorName}
              />


              {/* HOSPITAL DETAILS */}
              <h3>Hospital Details</h3>

              <select
                name="hospitalType"
                onChange={handleChange}
                value={form.hospitalType}
              >

                <option value="">
                  Select Hospital Type
                </option>

                {HOSPITAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}

              </select>


              {/* CLAIM DETAILS */}
              <h3>Claim Details</h3>

              <div className="grid-3">

                <select
                  name="claimCategory"
                  onChange={handleChange}
                  value={form.claimCategory}
                >

                  <option value="">
                    Select Category
                  </option>

                  {CLAIM_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}

                </select>

                <input
                  name="claimAmount"
                  type="number"
                  min="0"
                  placeholder="Claim Amount"
                  onChange={handleChange}
                  value={form.claimAmount}
                />

                <select
                  name="highRiskProcedureFlag"
                  onChange={handleChange}
                  value={form.highRiskProcedureFlag}
                >

                  <option value="0">
                    Normal Procedure
                  </option>

                  <option value="1">
                    High-Risk Procedure
                  </option>

                </select>

              </div>


              {/* NEXT BUTTON */}
              <button
                className="next-btn"
                onClick={handleNext}
              >
                →
              </button>

            </>
          )}


          {/* ========================= */}
          {/* PAGE 2 */}
          {/* ========================= */}

          {page === 2 && (
            <>

              <h3>Attachments</h3>

              <div
                className="file-input-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  margin: "15px 0",
                }}
              >

                {/* PRESCRIPTION */}
                <label>
                  Prescription:
                </label>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFile("prescription", e)
                  }
                />


                {/* MEDICAL BILLS */}
                <label>
                  Medical Bills:
                </label>

                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFile(
                      "medicalBills",
                      e,
                      true
                    )
                  }
                />


                {/* REPORTS */}
                <label>
                  Reports:
                </label>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFile("reports", e)
                  }
                />

              </div>


              {/* BUTTONS */}
              <div className="btn-row">

                <button
                  className="back-btn"
                  onClick={() => setPage(1)}
                >
                  ←
                </button>


                <button
                  className="draft-btn"
                  onClick={() =>
                    alert("Draft Saved")
                  }
                >
                  Save Draft
                </button>


                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                >
                  Submit
                </button>

              </div>

            </>
          )}


          {/* ========================= */}
          {/* SUBMISSION MODAL */}
          {/* ========================= */}

          {showModal && (
            <div
              className="modal"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >

              <div
                className="modal-box"
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >

                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    marginBottom: "20px",
                    color: "#333",
                  }}
                >
                  Application Submitted Successfully!
                </p>


                <button
                className="login-btn"
                style={{ margin: "5px" }}
                onClick={downloadSubmittedForm}
                 >
                 Download PDF
                </button>


                <button
                  className="back-btn"
                  style={{
                    margin: "5px",
                    background: "#666",
                    color: "white",
                  }}
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