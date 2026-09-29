import pandas as pd

# Load the original Kaggle dataset
df = pd.read_csv("data/kaggle_original.csv")

# Basic information
print("Number of rows:", len(df))
print("Number of columns:", len(df.columns))

print("\nColumn names:")
for column in df.columns:
    print("-", column)

print("\nFirst 5 rows:")
print(df.head())

print("\nData types:")
print(df.dtypes)

print("\nFraud label distribution:")
print(df["fraud_label"].value_counts())

print("\nFraud label percentages:")
print(df["fraud_label"].value_counts(normalize=True) * 100)

print("\nAverage claim amount by fraud label:")
print(df.groupby("fraud_label")["claim_amount"].mean())

print("\nAverage anomaly score by fraud label:")
print(df.groupby("fraud_label")["anomaly_score"].mean())

print("\nDocument mismatch by fraud label:")
print(pd.crosstab(df["document_mismatch_flag"], df["fraud_label"]))

print("\nHigh-risk procedure by fraud label:")
print(pd.crosstab(df["high_risk_procedure_flag"], df["fraud_label"]))

print("\nTreatment categories:")
print(df["treatment_category"].value_counts())

print("\nHospital types:")
print(df["hospital_type"].value_counts())

print("\nPatient genders:")
print(df["patient_gender"].value_counts())

print("\nFraud label distribution:")
print(df["fraud_label"].value_counts())

import numpy as np
from faker import Faker

fake = Faker("en_US")

# Your system's grades
grades = [
    "Executive",
    "Grade I",
    "Grade II",
    "Grade III",
    "Pensioner"
]

# Your system's branches
branches = [
    "Kandy",
    "Matale",
    "Nuwara Eliya"
]

# Claim categories used by your application
claim_categories = [
    "OPD",
    "Dental",
    "Eye Care",
    "Surgery",
    "Hospitalization",
    "Laboratory"
]

# Claim relationships
relationships = [
    "Self",
    "Spouse",
    "Child",
    "Parent"
]

# Who the claim is for
claim_for_options = [
    "Employee",
    "Dependent"
]

# Generate application-related fields
df["service_no"] = [
    f"SRV{100000 + i}"
    for i in range(len(df))
]

df["account_no"] = [
    f"AC{10000000 + i}"
    for i in range(len(df))
]

df["grade"] = np.random.choice(
    grades,
    size=len(df),
    p=[0.10, 0.20, 0.30, 0.25, 0.15]
)

df["full_name"] = [
    fake.name()
    for _ in range(len(df))
]

df["branch"] = np.random.choice(
    branches,
    size=len(df),
    p=[0.50, 0.25, 0.25]
)

df["claim_for"] = np.random.choice(
    claim_for_options,
    size=len(df),
    p=[0.70, 0.30]
)

df["relationship"] = np.where(
    df["claim_for"] == "Employee",
    "Self",
    np.random.choice(
        ["Spouse", "Child", "Parent"],
        size=len(df)
    )
)

df["doctor_name"] = [
    fake.name()
    for _ in range(len(df))
]

df["claim_category"] = np.random.choice(
    claim_categories,
    size=len(df),
    p=[0.35, 0.10, 0.10, 0.15, 0.20, 0.10]
)

# Document availability
df["prescription_provided"] = np.random.choice(
    [0, 1],
    size=len(df),
    p=[0.10, 0.90]
)

df["medical_bills_provided"] = np.random.choice(
    [0, 1],
    size=len(df),
    p=[0.05, 0.95]
)

df["reports_provided"] = np.random.choice(
    [0, 1],
    size=len(df),
    p=[0.20, 0.80]
)

print("\nNew application fields added successfully.")

print("\nNew columns:")
print(df.columns.tolist())

# Remove fields that are not part of our medical claim application
df = df.drop(columns=[
    "diagnosis_code",
    "patient_age",
    "patient_gender",
    "policy_tenure_years",
    "anomaly_score"
])

# Rename document mismatch field to match our application
df = df.rename(columns={
    "document_mismatch_flag": "document_mismatch"
})

print("\nIrrelevant fields removed and document field renamed.")

print("\nCurrent columns:")
print(df.columns.tolist())
from datetime import datetime, timedelta

# Generate treatment dates
start_dates = []
end_dates = []
durations = []

base_date = datetime(2025, 1, 1)

for _ in range(len(df)):
    start_date = base_date + timedelta(
        days=np.random.randint(0, 365)
    )

    duration = np.random.randint(1, 15)

    end_date = start_date + timedelta(days=duration)

    start_dates.append(start_date.date())
    end_dates.append(end_date.date())
    durations.append(duration)

df["treatment_start_date"] = start_dates
df["treatment_end_date"] = end_dates
df["treatment_duration_days"] = durations

# Remove the original Kaggle treatment category
df = df.drop(columns=["treatment_category"])

print("\nTreatment dates added successfully.")

print("\nCurrent columns:")
print(df.columns.tolist())

# Annual payment limits based on grade and claim category
ANNUAL_LIMITS = {
    "Executive": {
        "OPD": 30000,
        "Dental": 20000,
        "Eye Care": 50000,
        "Surgery": 300000,
        "Hospitalization": 500000,
        "Laboratory": 15000
    },

    "Grade I": {
        "OPD": 25000,
        "Dental": 15000,
        "Eye Care": 40000,
        "Surgery": 250000,
        "Hospitalization": 400000,
        "Laboratory": 12000
    },

    "Grade II": {
        "OPD": 20000,
        "Dental": 10000,
        "Eye Care": 30000,
        "Surgery": 200000,
        "Hospitalization": 300000,
        "Laboratory": 10000
    },

    "Grade III": {
        "OPD": 15000,
        "Dental": 8000,
        "Eye Care": 25000,
        "Surgery": 150000,
        "Hospitalization": 250000,
        "Laboratory": 8000
    },

    "Pensioner": {
        "OPD": 10000,
        "Dental": 5000,
        "Eye Care": 20000,
        "Surgery": 100000,
        "Hospitalization": 200000,
        "Laboratory": 5000
    }
}


def get_annual_limit(grade, category):
    return ANNUAL_LIMITS[grade][category]


df["annual_limit"] = [
    get_annual_limit(grade, category)
    for grade, category in zip(
        df["grade"],
        df["claim_category"]
    )
]

print("\nAnnual limits added successfully.")

print("\nExample grade/category/limit combinations:")
print(
    df[
        ["grade", "claim_category", "annual_limit"]
    ].head(10)
)

# ============================================================
# IMPROVE FRAUD PATTERNS FOR MACHINE LEARNING
# ============================================================

print("\nCreating realistic fraud-related patterns...")

# ------------------------------------------------------------
# 1. Generate document mismatch based on missing documents
# ------------------------------------------------------------

# Claims with missing required documents have a higher
# probability of having a document mismatch.

document_risk = (
    (1 - df["prescription_provided"]) * 0.30
    + (1 - df["medical_bills_provided"]) * 0.40
    + (1 - df["reports_provided"]) * 0.30
)

df["document_mismatch"] = np.random.binomial(
    1,
    np.clip(document_risk, 0.02, 0.80)
)


# ------------------------------------------------------------
# 2. Generate high-risk procedure flag
# ------------------------------------------------------------

# Surgery and hospitalization are more likely to contain
# high-risk procedures.

high_risk_probability = np.where(
    df["claim_category"].isin(["Surgery", "Hospitalization"]),
    0.35,
    0.08
)

df["high_risk_procedure_flag"] = np.random.binomial(
    1,
    high_risk_probability
)


# ------------------------------------------------------------
# 3. Generate claim submission delays
# ------------------------------------------------------------

# Most claims are submitted normally, while some claims
# have unusually long delays.

df["claim_submission_delay_days"] = np.random.choice(
    [0, 1, 2, 3, 5, 7, 10, 15, 20, 30, 45],
    size=len(df),
    p=[
        0.18,
        0.15,
        0.14,
        0.12,
        0.10,
        0.08,
        0.07,
        0.05,
        0.04,
        0.04,
        0.03
    ]
)


# ------------------------------------------------------------
# 4. Generate previous claim counts
# ------------------------------------------------------------

df["previous_claims_count"] = np.random.poisson(
    lam=2.5,
    size=len(df)
)

# Keep values within a reasonable range
df["previous_claims_count"] = df[
    "previous_claims_count"
].clip(0, 15)


# ------------------------------------------------------------
# 5. Calculate claim amount relative to annual limit
# ------------------------------------------------------------

claim_limit_ratio = (
    df["claim_amount"] / df["annual_limit"]
)

# Convert very large values to a manageable range
claim_limit_ratio = claim_limit_ratio.clip(0, 3)


# ------------------------------------------------------------
# 6. Normalize important fraud indicators
# ------------------------------------------------------------

# High claim amount compared with annual benefit limit
amount_risk = np.clip(
    claim_limit_ratio / 2,
    0,
    1
)

# Repeated claims
previous_claim_risk = np.clip(
    df["previous_claims_count"] / 10,
    0,
    1
)

# Delayed submission
delay_risk = np.clip(
    df["claim_submission_delay_days"] / 30,
    0,
    1
)

# Longer treatment duration
duration_risk = np.clip(
    df["treatment_duration_days"] / 14,
    0,
    1
)


# ------------------------------------------------------------
# 7. Create a combined fraud risk score
# ------------------------------------------------------------

fraud_risk_score = (
    amount_risk * 0.25
    + previous_claim_risk * 0.15
    + delay_risk * 0.15
    + duration_risk * 0.10
    + df["document_mismatch"] * 0.20
    + df["high_risk_procedure_flag"] * 0.15
)

# Add a small amount of random variation
fraud_risk_score += np.random.normal(
    0,
    0.03,
    size=len(df)
)

fraud_risk_score = np.clip(
    fraud_risk_score,
    0,
    1
)


# ------------------------------------------------------------
# 8. Create fraud labels
# ------------------------------------------------------------

# Use the top 15% highest-risk claims as fraudulent.
fraud_threshold = np.percentile(
    fraud_risk_score,
    85
)

df["fraud_label"] = (
    fraud_risk_score >= fraud_threshold
).astype(int)



# 9. Create anomaly score
# Anomaly detection is not part of our hybrid approach



# ------------------------------------------------------------
# 10. Make approved amount realistic
# ------------------------------------------------------------

approval_ratio = np.random.uniform(
    0.70,
    1.00,
    size=len(df)
)

df["approved_amount"] = (
    df["claim_amount"] * approval_ratio
).round(2)


# ------------------------------------------------------------
# 11. Display results
# ------------------------------------------------------------

print("\nFraud patterns created successfully.")

print("\nFraud label distribution:")
print(df["fraud_label"].value_counts())

print("\nFraud label percentages:")
print(
    df["fraud_label"]
    .value_counts(normalize=True)
    .mul(100)
    .round(2)
)

print("\nAverage claim amount by fraud label:")
print(
    df.groupby("fraud_label")["claim_amount"].mean()
)

print("\nAverage previous claims by fraud label:")
print(
    df.groupby("fraud_label")["previous_claims_count"].mean()
)

print("\nAverage submission delay by fraud label:")
print(
    df.groupby("fraud_label")[
        "claim_submission_delay_days"
    ].mean()
)

print("\nAverage treatment duration by fraud label:")
print(
    df.groupby("fraud_label")[
        "treatment_duration_days"
    ].mean()
)

print("\nDocument mismatch by fraud label:")
print(
    pd.crosstab(
        df["document_mismatch"],
        df["fraud_label"]
    )
)

print("\nHigh-risk procedure by fraud label:")
print(
    pd.crosstab(
        df["high_risk_procedure_flag"],
        df["fraud_label"]
    )
)


# ------------------------------------------------------------
# 12. Save final dataset
# ------------------------------------------------------------

# Arrange columns in a clean order

final_columns = [
    "claim_id",
    "hospital_type",
    "claim_amount",
    "approved_amount",
    "hospital_stay_days",
    "previous_claims_count",
    "claim_submission_delay_days",
    "high_risk_procedure_flag",
    "document_mismatch",
    "fraud_label",
    "service_no",
    "account_no",
    "grade",
    "full_name",
    "branch",
    "claim_for",
    "relationship",
    "doctor_name",
    "claim_category",
    "prescription_provided",
    "medical_bills_provided",
    "reports_provided",
    "treatment_start_date",
    "treatment_end_date",
    "treatment_duration_days",
    "annual_limit",
   
]

df = df[final_columns]

# Save the final dataset
df.to_csv(
    "medical_claim_dataset.csv",
    index=False
)

print("\n======================================")
print("FINAL DATASET CREATED SUCCESSFULLY")
print("======================================")
print("Rows:", len(df))
print("Columns:", len(df.columns))
print("\nSaved as:")
print("medical_claim_dataset.csv")

print("\nFinal columns:")
print(df.columns.tolist())