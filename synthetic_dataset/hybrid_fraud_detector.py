import pandas as pd
import joblib


# LOAD DATASET AND TRAINED ML MODEL


df = pd.read_csv("medical_claim_dataset.csv")

model = joblib.load(
    "medical_claim_fraud_model.pkl"
)

print("Dataset loaded successfully.")
print("ML model loaded successfully.")
print("Rows:", len(df))


# RULE-BASED FRAUD DETECTION


def calculate_rule_score(row):

    score = 0

    # Rule 1: Claim exceeds annual limit
    if row["claim_amount"] > row["annual_limit"]:
        score += 30

    # Rule 2: Document mismatch
    if row["document_mismatch"] == 1:
        score += 25

    # Rule 3: High-risk procedure
    if row["high_risk_procedure_flag"] == 1:
        score += 15

    # Rule 4: Large submission delay
    if row["claim_submission_delay_days"] > 30:
        score += 10

    # Rule 5: Medical bills missing
    if row["medical_bills_provided"] == 0:
        score += 10

    # Rule 6: Prescription missing
    if row["prescription_provided"] == 0:
        score += 5

    # Rule 7: Reports missing
    if row["reports_provided"] == 0:
        score += 5

    return min(score, 100)


df["rule_score"] = df.apply(
    calculate_rule_score,
    axis=1
)


# PREPARE DATA FOR MACHINE LEARNING


target = "fraud_label"

X = df.drop(columns=[target])


# These columns were excluded during ML training
columns_to_remove = [
    "claim_id",
    "service_no",
    "account_no",
    "full_name",
    "doctor_name",
    "treatment_start_date",
    "treatment_end_date"
]

X = X.drop(
    columns=columns_to_remove
)

# MACHINE LEARNING FRAUD PROBABILITY


ml_probability = model.predict_proba(X)[:, 1]

df["ml_probability"] = ml_probability

df["ml_score"] = (
    df["ml_probability"] * 100
)


# HYBRID RISK SCORE


RULE_WEIGHT = 0.40
ML_WEIGHT = 0.60

df["hybrid_score"] = (
    RULE_WEIGHT * df["rule_score"]
    +
    ML_WEIGHT * df["ml_score"]
)


# HYBRID DECISION


def hybrid_decision(score):

    if score >= 60:
        return "High Risk"

    elif score >= 30:
        return "Medium Risk"

    else:
        return "Low Risk"


df["hybrid_decision"] = df["hybrid_score"].apply(
    hybrid_decision
)


# DISPLAY RESULTS


print("\n======================================")
print("HYBRID FRAUD DETECTION")
print("======================================")

print("\nRule weight:", RULE_WEIGHT)
print("ML weight:", ML_WEIGHT)


print("\nHybrid score statistics:")
print(
    df["hybrid_score"].describe()
)


print("\nHybrid decision distribution:")
print(
    df["hybrid_decision"].value_counts()
)



# HYBRID DECISION VS ACTUAL FRAUD
print("\nHybrid decision vs actual fraud:")

print(
    pd.crosstab(
        df["hybrid_decision"],
        df["fraud_label"]
    )
)


# AVERAGE SCORES BY FRAUD LABEL


print("\nAverage scores by fraud label:")

print(
    df.groupby("fraud_label")[
        [
            "rule_score",
            "ml_score",
            "hybrid_score"
        ]
    ].mean()
)


# SAMPLE RESULTS


print("\nSample hybrid results:")

print(
    df[
        [
            "claim_id",
            "rule_score",
            "ml_score",
            "hybrid_score",
            "hybrid_decision",
            "fraud_label"
        ]
    ].head(20)
)