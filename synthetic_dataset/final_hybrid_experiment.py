import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


# ============================================================
# 1. LOAD DATASET
# ============================================================

df = pd.read_csv("medical_claim_dataset.csv")

print("Dataset loaded successfully.")
print("Rows:", len(df))
print("Columns:", len(df.columns))


# ============================================================
# 2. SEPARATE FEATURES AND TARGET
# ============================================================

target = "fraud_label"

X = df.drop(columns=[target])
y = df[target]


# ============================================================
# 3. REMOVE IDENTIFIER / NON-ML COLUMNS
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

X = X.drop(columns=columns_to_remove)


# ============================================================
# 4. CREATE TRAIN / VALIDATION / FINAL TEST SET
# ============================================================

# 80% development data + 20% final test data

X_development, X_test, y_development, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# From the 80% development data:
# 87.5% = 70% of total → Training
# 12.5% = 10% of total → Validation

X_train, X_validation, y_train, y_validation = train_test_split(
    X_development,
    y_development,
    test_size=0.125,
    random_state=42,
    stratify=y_development
)


print("\n======================================")
print("DATA SPLIT")
print("======================================")

print("Training samples   :", len(X_train))
print("Validation samples :", len(X_validation))
print("Final test samples :", len(X_test))

print("\nTraining distribution:")
print(y_train.value_counts())

print("\nValidation distribution:")
print(y_validation.value_counts())

print("\nFinal test distribution:")
print(y_test.value_counts())


# ============================================================
# 5. IDENTIFY FEATURE TYPES
# ============================================================

categorical_features = X_train.select_dtypes(
    include=["object", "str"]
).columns.tolist()

numerical_features = X_train.select_dtypes(
    exclude=["object", "str"]
).columns.tolist()


print("\nCategorical features:")
print(categorical_features)

print("\nNumerical features:")
print(numerical_features)


# ============================================================
# 6. CREATE PREPROCESSING PIPELINE
# ============================================================

numerical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        )
    ]
)


categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            )
        )
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "numerical",
            numerical_pipeline,
            numerical_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)


# ============================================================
# 7. CREATE RANDOM FOREST
# ============================================================

random_forest = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)


model = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "classifier",
            random_forest
        )
    ]
)


# ============================================================
# 8. TRAIN RANDOM FOREST
# ============================================================

print("\n======================================")
print("TRAINING RANDOM FOREST")
print("======================================")

model.fit(
    X_train,
    y_train
)

print("Random Forest training completed.")


# ============================================================
# 9. RULE-BASED DETECTOR
# ============================================================

def calculate_rule_score(row):

    score = 0

    # Rule 1
    if row["claim_amount"] > row["annual_limit"]:
        score += 30

    # Rule 2
    if row["document_mismatch"] == 1:
        score += 25

    # Rule 3
    if row["high_risk_procedure_flag"] == 1:
        score += 15

    # Rule 4
    if row["claim_submission_delay_days"] > 30:
        score += 10

    # Rule 5
    if row["medical_bills_provided"] == 0:
        score += 10

    # Rule 6
    if row["prescription_provided"] == 0:
        score += 5

    # Rule 7
    if row["reports_provided"] == 0:
        score += 5

    return min(score, 100)


# ============================================================
# 10. VALIDATION RULE SCORES
# ============================================================

validation_rules = X_validation.copy()

# X_validation contains the ML features only.
# The rule columns are still present.

validation_rules["rule_score"] = validation_rules.apply(
    calculate_rule_score,
    axis=1
)


# ============================================================
# 11. VALIDATION ML PROBABILITY
# ============================================================

validation_ml_probability = model.predict_proba(
    X_validation
)[:, 1]

validation_ml_score = (
    validation_ml_probability * 100
)


# ============================================================
# 12. TEST RULE SCORES
# ============================================================

test_rules = X_test.copy()

test_rules["rule_score"] = test_rules.apply(
    calculate_rule_score,
    axis=1
)


# ============================================================
# 13. TEST ML PROBABILITY
# ============================================================

test_ml_probability = model.predict_proba(
    X_test
)[:, 1]

test_ml_score = (
    test_ml_probability * 100
)


# ============================================================
# 14. EVALUATION FUNCTION
# ============================================================

def evaluate_configuration(
    y_true,
    predictions
):

    accuracy = accuracy_score(
        y_true,
        predictions
    )

    precision = precision_score(
        y_true,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_true,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_true,
        predictions,
        zero_division=0
    )

    cm = confusion_matrix(
        y_true,
        predictions
    )

    tn, fp, fn, tp = cm.ravel()

    return {
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1,
        "False Positives": fp,
        "False Negatives": fn,
        "True Positives": tp,
        "True Negatives": tn
    }


# ============================================================
# 15. VALIDATION EXPERIMENT
# ============================================================

compositions = [
    (0.10, 0.90),
    (0.20, 0.80),
    (0.30, 0.70),
    (0.40, 0.60),
    (0.50, 0.50),
    (0.60, 0.40),
    (0.70, 0.30),
    (0.80, 0.20),
    (0.90, 0.10)
]

thresholds = [
    50,
    55,
    60
]


validation_results = []


print("\n======================================")
print("VALIDATION EXPERIMENT")
print("======================================")


for rule_weight, ml_weight in compositions:

    hybrid_scores = (
        rule_weight * validation_rules["rule_score"].values
        +
        ml_weight * validation_ml_score
    )

    for threshold in thresholds:

        predictions = (
            hybrid_scores >= threshold
        ).astype(int)

        results = evaluate_configuration(
            y_validation,
            predictions
        )

        validation_results.append({
            "Rule Weight": rule_weight,
            "ML Weight": ml_weight,
            "Threshold": threshold,
            **results
        })


# ============================================================
# 16. VALIDATION RESULTS
# ============================================================

validation_df = pd.DataFrame(
    validation_results
)


print("\n======================================")
print("VALIDATION RESULTS")
print("======================================")

print(
    validation_df.to_string(
        index=False
    )
)


# ============================================================
# 17. SELECT BEST CONFIGURATION
# ============================================================

best_configuration = validation_df.loc[
    validation_df["F1 Score"].idxmax()
]


BEST_RULE_WEIGHT = best_configuration["Rule Weight"]
BEST_ML_WEIGHT = best_configuration["ML Weight"]
BEST_THRESHOLD = best_configuration["Threshold"]


print("\n======================================")
print("SELECTED CONFIGURATION")
print("======================================")

print(
    f"Rule Weight : {BEST_RULE_WEIGHT:.0%}"
)

print(
    f"ML Weight   : {BEST_ML_WEIGHT:.0%}"
)

print(
    f"Threshold   : {BEST_THRESHOLD:.0f}"
)

print(
    f"Validation Accuracy : "
    f"{best_configuration['Accuracy']:.4f}"
)

print(
    f"Validation Precision : "
    f"{best_configuration['Precision']:.4f}"
)

print(
    f"Validation Recall : "
    f"{best_configuration['Recall']:.4f}"
)

print(
    f"Validation F1 Score : "
    f"{best_configuration['F1 Score']:.4f}"
)


# ============================================================
# 18. FINAL TEST USING SELECTED CONFIGURATION
# ============================================================

print("\n======================================")
print("FINAL TEST")
print("======================================")


final_hybrid_scores = (
    BEST_RULE_WEIGHT * test_rules["rule_score"].values
    +
    BEST_ML_WEIGHT * test_ml_score
)


final_predictions = (
    final_hybrid_scores >= BEST_THRESHOLD
).astype(int)


final_results = evaluate_configuration(
    y_test,
    final_predictions
)


# ============================================================
# 19. FINAL RESULTS
# ============================================================

print("\n======================================")
print("FINAL HYBRID MODEL RESULTS")
print("======================================")


print(
    f"Rule Weight : {BEST_RULE_WEIGHT:.0%}"
)

print(
    f"ML Weight   : {BEST_ML_WEIGHT:.0%}"
)

print(
    f"Threshold   : {BEST_THRESHOLD:.0f}"
)

print(
    f"Accuracy    : {final_results['Accuracy']:.4f}"
)

print(
    f"Precision   : {final_results['Precision']:.4f}"
)

print(
    f"Recall      : {final_results['Recall']:.4f}"
)

print(
    f"F1 Score    : {final_results['F1 Score']:.4f}"
)

print(
    f"False Positives : "
    f"{final_results['False Positives']}"
)

print(
    f"False Negatives : "
    f"{final_results['False Negatives']}"
)

print(
    f"True Positives : "
    f"{final_results['True Positives']}"
)

print(
    f"True Negatives : "
    f"{final_results['True Negatives']}"
)


# ============================================================
# 20. CONFUSION MATRIX
# ============================================================

print("\nConfusion Matrix:")

cm = confusion_matrix(
    y_test,
    final_predictions
)

print(cm)


# ============================================================
# 21. CLASSIFICATION REPORT
# ============================================================

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        final_predictions,
        target_names=[
            "Normal",
            "Fraud"
        ],
        zero_division=0
    )
)
# ============================================================
# 21A. McNEMAR TEST: RANDOM FOREST vs HYBRID
# ============================================================

from statsmodels.stats.contingency_tables import mcnemar


print("\n======================================")
print("McNEMAR TEST: RANDOM FOREST vs HYBRID")
print("======================================")


# ------------------------------------------------------------
# RANDOM FOREST PREDICTIONS ON FINAL TEST SET
# ------------------------------------------------------------

rf_predictions = model.predict(
    X_test
)


# ------------------------------------------------------------
# CHECK THAT BOTH MODELS USE THE SAME TEST SET
# ------------------------------------------------------------

print("RF predictions     :", len(rf_predictions))
print("Hybrid predictions :", len(final_predictions))
print("Actual labels      :", len(y_test))


# ------------------------------------------------------------
# DETERMINE CORRECT / INCORRECT PREDICTIONS
# ------------------------------------------------------------

rf_correct = (
    rf_predictions == y_test.values
)

hybrid_correct = (
    final_predictions == y_test.values
)


# ------------------------------------------------------------
# McNEMAR CONTINGENCY TABLE
# ------------------------------------------------------------

both_correct = (
    rf_correct & hybrid_correct
).sum()

rf_correct_hybrid_wrong = (
    rf_correct & ~hybrid_correct
).sum()

rf_wrong_hybrid_correct = (
    ~rf_correct & hybrid_correct
).sum()

both_wrong = (
    ~rf_correct & ~hybrid_correct
).sum()


mcnemar_table = [
    [
        both_correct,
        rf_correct_hybrid_wrong
    ],
    [
        rf_wrong_hybrid_correct,
        both_wrong
    ]
]


print("\nMcNemar Contingency Table:")
print("--------------------------------------")
print("                         Hybrid Correct   Hybrid Incorrect")

print(
    f"RF Correct              {both_correct:>14}   "
    f"{rf_correct_hybrid_wrong:>17}"
)

print(
    f"RF Incorrect            {rf_wrong_hybrid_correct:>14}   "
    f"{both_wrong:>17}"
)


# ------------------------------------------------------------
# PERFORM McNEMAR TEST
# ------------------------------------------------------------

mcnemar_result = mcnemar(
    mcnemar_table,
    exact=False,
    correction=True
)


print("\nMcNemar Test Statistic:",
      f"{mcnemar_result.statistic:.4f}")

print("p-value:",
      f"{mcnemar_result.pvalue:.12f}")


# ------------------------------------------------------------
# INTERPRETATION
# ------------------------------------------------------------

print("\nInterpretation:")

if mcnemar_result.pvalue < 0.05:

    print(
        "There is a statistically significant difference "
        "between the Random Forest and Hybrid models "
        "(p < 0.05)."
    )

else:

    print(
        "There is no statistically significant difference "
        "between the Random Forest and Hybrid models "
        "(p >= 0.05)."
    )

# ============================================================
# 22. SAVE FINAL MODEL
# ============================================================

joblib.dump(
    model,
    "final_medical_claim_fraud_model.pkl"
)


# ============================================================
# 23. SAVE VALIDATION RESULTS
# ============================================================

validation_df.to_csv(
    "final_hybrid_validation_results.csv",
    index=False
)


# ============================================================
# 24. SAVE FINAL TEST RESULTS
# ============================================================

final_test_results = X_test.copy()

final_test_results["actual_fraud"] = (
    y_test.values
)

final_test_results["rule_score"] = (
    test_rules["rule_score"].values
)

final_test_results["ml_probability"] = (
    test_ml_probability
)

final_test_results["ml_score"] = (
    test_ml_score
)

final_test_results["hybrid_score"] = (
    final_hybrid_scores
)

final_test_results["hybrid_prediction"] = (
    final_predictions
)


final_test_results.to_csv(
    "final_hybrid_test_results.csv",
    index=False
)


# ============================================================
# 25. SAVE FINAL CONFIGURATION
# ============================================================

configuration = pd.DataFrame({
    "Rule Weight": [
        BEST_RULE_WEIGHT
    ],
    "ML Weight": [
        BEST_ML_WEIGHT
    ],
    "Threshold": [
        BEST_THRESHOLD
    ],
    "Accuracy": [
        final_results["Accuracy"]
    ],
    "Precision": [
        final_results["Precision"]
    ],
    "Recall": [
        final_results["Recall"]
    ],
    "F1 Score": [
        final_results["F1 Score"]
    ]
})


configuration.to_csv(
    "final_hybrid_configuration.csv",
    index=False
)


print("\n======================================")
print("FILES SAVED")
print("======================================")

print(
    "final_medical_claim_fraud_model.pkl"
)

print(
    "final_hybrid_validation_results.csv"
)

print(
    "final_hybrid_test_results.csv"
)

print(
    "final_hybrid_configuration.csv"
)

print("\nFINAL HYBRID EXPERIMENT COMPLETED.")