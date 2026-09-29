import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)


# ============================================================
# LOAD DATASET AND TRAINED MODEL
# ============================================================

df = pd.read_csv("medical_claim_dataset.csv")

model = joblib.load(
    "medical_claim_fraud_model.pkl"
)

print("Dataset loaded successfully.")
print("Model loaded successfully.")
print("Rows:", len(df))


# ============================================================
# SEPARATE FEATURES AND TARGET
# ============================================================

target = "fraud_label"

X = df.drop(columns=[target])
y = df[target]


# ============================================================
# SAME TRAIN / TEST SPLIT USED DURING TRAINING
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\n======================================")
print("TEST DATA")
print("======================================")

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

print("\nTesting target distribution:")
print(y_test.value_counts())


# ============================================================
# RULE-BASED DETECTOR
# ============================================================

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


# Calculate rule scores only for TEST data
X_test_rules = X_test.copy()

X_test_rules["rule_score"] = X_test_rules.apply(
    calculate_rule_score,
    axis=1
)


# ============================================================
# RULE-BASED CLASSIFICATION
# ============================================================

def rule_prediction(score):

    if score >= 60:
        return 1

    return 0


rule_predictions = X_test_rules["rule_score"].apply(
    rule_prediction
)


# ============================================================
# RANDOM FOREST PREDICTIONS
# ============================================================

columns_to_remove = [
    "claim_id",
    "service_no",
    "account_no",
    "full_name",
    "doctor_name",
    "treatment_start_date",
    "treatment_end_date"
]

X_test_ml = X_test.drop(
    columns=columns_to_remove
)


# ML probability of fraud
ml_probability = model.predict_proba(
    X_test_ml
)[:, 1]

# Convert probability to 0-100 score
ml_score = ml_probability * 100

# ML classification
ml_predictions = (
    ml_probability >= 0.50
).astype(int)


# ============================================================
# EVALUATION FUNCTION
# ============================================================

def calculate_metrics(actual, predictions):

    accuracy = accuracy_score(
        actual,
        predictions
    )

    precision = precision_score(
        actual,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        actual,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        actual,
        predictions,
        zero_division=0
    )

    return accuracy, precision, recall, f1


# ============================================================
# BASELINE MODEL RESULTS
# ============================================================

rule_accuracy, rule_precision, rule_recall, rule_f1 = calculate_metrics(
    y_test,
    rule_predictions
)

ml_accuracy, ml_precision, ml_recall, ml_f1 = calculate_metrics(
    y_test,
    ml_predictions
)


# ============================================================
# HYBRID COMPOSITION EXPERIMENT
# ============================================================

compositions = [
    (0.20, 0.80),
    (0.30, 0.70),
    (0.40, 0.60),
    (0.50, 0.50),
    (0.60, 0.40),
    (0.70, 0.30),
    (0.80, 0.20)
]

HYBRID_THRESHOLD = 60

hybrid_results = []


print("\n======================================")
print("HYBRID COMPOSITION EXPERIMENT")
print("======================================")

print("\nHybrid threshold:", HYBRID_THRESHOLD)


for rule_weight, ml_weight in compositions:

    # Calculate hybrid score
    hybrid_scores = (
        rule_weight * X_test_rules["rule_score"].values
        +
        ml_weight * ml_score
    )

    # Convert hybrid score to prediction
    hybrid_predictions = (
        hybrid_scores >= HYBRID_THRESHOLD
    ).astype(int)

    # Calculate metrics
    accuracy, precision, recall, f1 = calculate_metrics(
        y_test,
        hybrid_predictions
    )

    # Confusion matrix
    cm = confusion_matrix(
        y_test,
        hybrid_predictions
    )

    # Save results
    hybrid_results.append({
        "Rule Weight": rule_weight,
        "ML Weight": ml_weight,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1
    })

    # Display results
    print("\n--------------------------------------")
    print(
        f"Rule {rule_weight:.0%} + ML {ml_weight:.0%}"
    )
    print("--------------------------------------")

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    print("\nConfusion Matrix:")
    print(cm)


# ============================================================
# HYBRID RESULTS TABLE
# ============================================================

hybrid_comparison = pd.DataFrame(
    hybrid_results
)


print("\n======================================")
print("HYBRID COMPOSITION COMPARISON")
print("======================================")

print(
    hybrid_comparison.to_string(
        index=False
    )
)


# ============================================================
# BASELINE COMPARISON
# ============================================================

baseline_comparison = pd.DataFrame({

    "Model": [
        "Rule-Based",
        "Random Forest"
    ],

    "Accuracy": [
        rule_accuracy,
        ml_accuracy
    ],

    "Precision": [
        rule_precision,
        ml_precision
    ],

    "Recall": [
        rule_recall,
        ml_recall
    ],

    "F1 Score": [
        rule_f1,
        ml_f1
    ]
})


print("\n======================================")
print("BASELINE MODEL COMPARISON")
print("======================================")

print(
    baseline_comparison.to_string(
        index=False
    )
)


# ============================================================
# FIND BEST HYBRID COMPOSITION
# ============================================================

best_result = hybrid_comparison.loc[
    hybrid_comparison["F1 Score"].idxmax()
]


print("\n======================================")
print("BEST HYBRID COMPOSITION")
print("======================================")

print(
    f"Rule Weight : {best_result['Rule Weight']:.0%}"
)

print(
    f"ML Weight   : {best_result['ML Weight']:.0%}"
)

print(
    f"Accuracy    : {best_result['Accuracy']:.4f}"
)

print(
    f"Precision   : {best_result['Precision']:.4f}"
)

print(
    f"Recall      : {best_result['Recall']:.4f}"
)

print(
    f"F1 Score    : {best_result['F1 Score']:.4f}"
)


# ============================================================
# SAVE COMPOSITION RESULTS
# ============================================================

hybrid_comparison.to_csv(
    "hybrid_composition_results.csv",
    index=False
)

print("\n======================================")
print("RESULTS SAVED")
print("======================================")

print(
    "hybrid_composition_results.csv"
)

# ============================================================
# THRESHOLD EXPERIMENT FOR 20% RULE + 80% ML
# ============================================================

RULE_WEIGHT = 0.20
ML_WEIGHT = 0.80

hybrid_scores_20_80 = (
    RULE_WEIGHT * X_test_rules["rule_score"].values
    +
    ML_WEIGHT * ml_score
)

thresholds = [40, 45, 50, 55, 60, 65, 70]

threshold_results = []

print("\n======================================")
print("THRESHOLD EXPERIMENT - HYBRID 20/80")
print("======================================")

for threshold in thresholds:

    hybrid_predictions = (
        hybrid_scores_20_80 >= threshold
    ).astype(int)

    accuracy, precision, recall, f1 = calculate_metrics(
        y_test,
        hybrid_predictions
    )

    cm = confusion_matrix(
        y_test,
        hybrid_predictions
    )

    tn, fp, fn, tp = cm.ravel()

    threshold_results.append({
        "Threshold": threshold,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1,
        "False Positives": fp,
        "False Negatives": fn,
        "True Positives": tp,
        "True Negatives": tn
    })

    print("\n--------------------------------------")
    print(f"Threshold: {threshold}")
    print("--------------------------------------")

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    print("\nConfusion Matrix:")
    print(cm)


# ============================================================
# THRESHOLD COMPARISON TABLE
# ============================================================

threshold_comparison = pd.DataFrame(
    threshold_results
)

print("\n======================================")
print("THRESHOLD COMPARISON")
print("======================================")

print(
    threshold_comparison.to_string(
        index=False
    )
)


# ============================================================
# SAVE THRESHOLD RESULTS
# ============================================================

threshold_comparison.to_csv(
    "hybrid_threshold_results.csv",
    index=False
)

print("\nThreshold results saved as:")
print("hybrid_threshold_results.csv")

# ============================================================
# COMBINED COMPOSITION + THRESHOLD EXPERIMENT
# ============================================================

compositions = [
    (0.20, 0.80),
    (0.30, 0.70),
    (0.40, 0.60),
    (0.50, 0.50),
    (0.60, 0.40),
    (0.70, 0.30),
    (0.80, 0.20)
]

thresholds = [50, 55, 60]

combined_results = []

print("\n======================================")
print("COMBINED COMPOSITION + THRESHOLD EXPERIMENT")
print("======================================")

for rule_weight, ml_weight in compositions:

    # Calculate hybrid score for this composition
    hybrid_scores = (
        rule_weight * X_test_rules["rule_score"].values
        +
        ml_weight * ml_score
    )

    for threshold in thresholds:

        # Convert hybrid score to prediction
        hybrid_predictions = (
            hybrid_scores >= threshold
        ).astype(int)

        # Calculate metrics
        accuracy, precision, recall, f1 = calculate_metrics(
            y_test,
            hybrid_predictions
        )

        # Confusion matrix
        cm = confusion_matrix(
            y_test,
            hybrid_predictions
        )

        tn, fp, fn, tp = cm.ravel()

        combined_results.append({
            "Rule Weight": rule_weight,
            "ML Weight": ml_weight,
            "Threshold": threshold,
            "Accuracy": accuracy,
            "Precision": precision,
            "Recall": recall,
            "F1 Score": f1,
            "False Positives": fp,
            "False Negatives": fn,
            "True Positives": tp,
            "True Negatives": tn
        })


# ============================================================
# CREATE RESULTS TABLE
# ============================================================

combined_comparison = pd.DataFrame(
    combined_results
)


print("\n======================================")
print("ALL COMBINED RESULTS")
print("======================================")

print(
    combined_comparison.to_string(
        index=False
    )
)


# ============================================================
# BEST BY F1 SCORE
# ============================================================

best_f1 = combined_comparison.loc[
    combined_comparison["F1 Score"].idxmax()
]


print("\n======================================")
print("BEST CONFIGURATION BY F1 SCORE")
print("======================================")

print(
    f"Rule Weight : {best_f1['Rule Weight']:.0%}"
)

print(
    f"ML Weight   : {best_f1['ML Weight']:.0%}"
)

print(
    f"Threshold   : {best_f1['Threshold']}"
)

print(
    f"Accuracy    : {best_f1['Accuracy']:.4f}"
)

print(
    f"Precision   : {best_f1['Precision']:.4f}"
)

print(
    f"Recall      : {best_f1['Recall']:.4f}"
)

print(
    f"F1 Score    : {best_f1['F1 Score']:.4f}"
)

print(
    f"False Positives: {best_f1['False Positives']}"
)

print(
    f"False Negatives: {best_f1['False Negatives']}"
)


# ============================================================
# BEST BY RECALL
# ============================================================

best_recall = combined_comparison.loc[
    combined_comparison["Recall"].idxmax()
]


print("\n======================================")
print("BEST CONFIGURATION BY RECALL")
print("======================================")

print(
    f"Rule Weight : {best_recall['Rule Weight']:.0%}"
)

print(
    f"ML Weight   : {best_recall['ML Weight']:.0%}"
)

print(
    f"Threshold   : {best_recall['Threshold']}"
)

print(
    f"Accuracy    : {best_recall['Accuracy']:.4f}"
)

print(
    f"Precision   : {best_recall['Precision']:.4f}"
)

print(
    f"Recall      : {best_recall['Recall']:.4f}"
)

print(
    f"F1 Score    : {best_recall['F1 Score']:.4f}"
)

print(
    f"False Positives: {best_recall['False Positives']}"
)

print(
    f"False Negatives: {best_recall['False Negatives']}"
)


# ============================================================
# SAVE RESULTS
# ============================================================

combined_comparison.to_csv(
    "hybrid_composition_threshold_results.csv",
    index=False
)

print("\n======================================")
print("RESULTS SAVED")
print("======================================")

print(
    "hybrid_composition_threshold_results.csv"
)