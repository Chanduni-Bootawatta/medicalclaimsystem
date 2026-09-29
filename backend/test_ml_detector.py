from ml_detector import detect_fraud


test_claim = {
    "hospital_type": "Private",
    "claim_amount": 150000,
    "approved_amount": 0,
    "hospital_stay_days": 5,
    "previous_claims_count": 2,
    "claim_submission_delay_days": 10,
    "high_risk_procedure_flag": 0,
    "document_mismatch": 0,
    "prescription_provided": 1,
    "medical_bills_provided": 1,
    "reports_provided": 1,
    "treatment_duration_days": 5,
    "annual_limit": 200000,

    "grade": "A",
    "branch": "Kandy",
    "claim_for": "Self",
    "relationship": "Self",
    "claim_category": "A1"
}


result = detect_fraud(test_claim)

print("\n================================")
print("HYBRID FRAUD DETECTION TEST")
print("================================")

print("Prediction    :", result["prediction"])
print("Fraud Status  :", result["fraud_status"])
print("Rule Score    :", result["rule_score"])
print("ML Score      :", result["ml_score"])
print("Hybrid Score  :", result["hybrid_score"])
print("Risk Level    :", result["risk_level"])