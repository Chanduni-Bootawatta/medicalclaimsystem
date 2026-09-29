import pandas as pd


# LOAD DATASET


df = pd.read_csv("medical_claim_dataset.csv")

print("Dataset loaded successfully.")
print("Rows:", len(df))


# RULE-BASED FRAUD DETECTION


def calculate_rule_score(row):
    """
    Calculate a fraud risk score from 0 to 100
    using predefined medical claim validation rules.
    """

    score = 0

    # RULE 1: Claim exceeds annual medical claim limit
   

    if row["claim_amount"] > row["annual_limit"]:
        score += 30


  
    # RULE 2: Document mismatch
  

    if row["document_mismatch"] == 1:
        score += 25


    # RULE 3: High-risk procedure
  

    if row["high_risk_procedure_flag"] == 1:
        score += 15


  
    # RULE 4: Long submission delay
   

    if row["claim_submission_delay_days"] > 30:
        score += 10


    # RULE 5: Missing medical bills
   

    if row["medical_bills_provided"] == 0:
        score += 10


    # RULE 6: Missing prescription
  

    if row["prescription_provided"] == 0:
        score += 5

    # RULE 7: Missing medical reports


    if row["reports_provided"] == 0:
        score += 5


    # Make sure score does not exceed 100
    score = min(score, 100)

    return score


# APPLY RULE ENGINE


df["rule_score"] = df.apply(
    calculate_rule_score,
    axis=1
)


# RULE-BASED DECISION


def rule_decision(score):

    if score >= 60:
        return "High Risk"

    elif score >= 30:
        return "Medium Risk"

    else:
        return "Low Risk"


df["rule_decision"] = df["rule_score"].apply(
    rule_decision
)


# ============================================================
# FINAL TEST SET EVALUATION
# SAME 70/10/20 SPLIT USED IN HYBRID EXPERIMENT
# ============================================================

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# First: separate final test set (20%)
development, test = train_test_split(
    df,
    test_size=0.20,
    random_state=42,
    stratify=df["fraud_label"]
)

# Then: split remaining 80% into 70% training and 10% validation
train, validation = train_test_split(
    development,
    test_size=0.125,
    random_state=42,
    stratify=development["fraud_label"]
)

print("\n======================================")
print("DATA SPLIT")
print("======================================")

print("Training samples   :", len(train))
print("Validation samples :", len(validation))
print("Final test samples :", len(test))

print("\nFinal test distribution:")
print(test["fraud_label"].value_counts())


# ============================================================
# PURE RULE-BASED PREDICTION
# ============================================================

# Rule score >= 60 = Fraud
y_test = test["fraud_label"]
y_rule_pred = (test["rule_score"] >= 60).astype(int)


# ============================================================
# EVALUATION
# ============================================================

accuracy = accuracy_score(y_test, y_rule_pred)

precision = precision_score(
    y_test,
    y_rule_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_rule_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_rule_pred,
    zero_division=0
)

cm = confusion_matrix(y_test, y_rule_pred)


print("\n======================================")
print("PURE RULE-BASED MODEL RESULTS")
print("======================================")

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")

print("\nConfusion Matrix:")
print(cm)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_rule_pred,
        target_names=["Normal", "Fraud"],
        zero_division=0
    )
)
