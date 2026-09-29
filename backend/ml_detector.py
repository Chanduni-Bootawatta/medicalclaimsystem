import joblib
import pandas as pd


# ============================================================
# LOAD FINAL RANDOM FOREST MODEL
# ============================================================

MODEL_FILE = "final_medical_claim_fraud_model.pkl"

model = joblib.load(MODEL_FILE)


# ============================================================
# HYBRID MODEL CONFIGURATION
# ============================================================

RULE_WEIGHT = 0.20
ML_WEIGHT = 0.80
HYBRID_THRESHOLD = 50


# ============================================================
# RULE-BASED FRAUD SCORE
# ============================================================

def calculate_rule_score(data):

    score = 0

    if data["claim_amount"] > data["annual_limit"]:
        score += 30

    if data["document_mismatch"] == 1:
        score += 25

    if data["high_risk_procedure_flag"] == 1:
        score += 15

    if data["claim_submission_delay_days"] > 30:
        score += 10

    if data["medical_bills_provided"] == 0:
        score += 10

    if data["prescription_provided"] == 0:
        score += 5

    if data["reports_provided"] == 0:
        score += 5

    return min(score, 100)


# ============================================================
# HYBRID FRAUD DETECTION
# ============================================================

def detect_fraud(data):

    # Convert input dictionary into DataFrame
    input_df = pd.DataFrame([data])

    # --------------------------------------------------------
    # ML probability
    # --------------------------------------------------------

    ml_probability = model.predict_proba(input_df)[0][1]

    ml_score = ml_probability * 100

    # --------------------------------------------------------
    # Rule score
    # --------------------------------------------------------

    rule_score = calculate_rule_score(data)

    # --------------------------------------------------------
    # Hybrid score
    # --------------------------------------------------------

    hybrid_score = (
        RULE_WEIGHT * rule_score
        +
        ML_WEIGHT * ml_score
    )

    # --------------------------------------------------------
    # Final prediction
    # --------------------------------------------------------

    if hybrid_score >= HYBRID_THRESHOLD:
        prediction = 1
        fraud_status = "FRAUD"
    else:
        prediction = 0
        fraud_status = "NOT_FRAUD"

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    if hybrid_score < 30:
        risk_level = "Low"
    elif hybrid_score < 60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "prediction": prediction,
        "fraud_status": fraud_status,
        "rule_score": round(rule_score, 2),
        "ml_score": round(ml_score, 2),
        "hybrid_score": round(hybrid_score, 2),
        "risk_level": risk_level
    }