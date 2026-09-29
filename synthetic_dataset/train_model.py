import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

# Load the final synthetic dataset
df = pd.read_csv("medical_claim_dataset.csv")

print("Dataset loaded successfully.")
print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\nColumns:")
for column in df.columns:
    print("-", column)



# TARGET VARIABLE

target = "fraud_label"

X = df.drop(columns=[target])
y = df[target]

print("\nTarget variable:", target)

print("\nTarget distribution:")
print(y.value_counts())

print("\nTarget percentages:")
print(
    y.value_counts(normalize=True).mul(100).round(2)
)

# REMOVE IDENTIFIER / NON-ML COLUMNS


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

print("\nRemoved identifier/date columns.")

print("\nRemaining ML features:")
for column in X.columns:
    print("-", column)


# SEPARATE NUMERICAL AND CATEGORICAL FEATURES


categorical_features = X.select_dtypes(
    include=["str", "object"]
).columns.tolist()

numerical_features = X.select_dtypes(
    exclude=["str", "object"]
).columns.tolist()

print("\nCategorical features:")
print(categorical_features)

print("\nNumerical features:")
print(numerical_features)


# TRAIN / TEST SPLIT

X_development, X_test, y_development, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

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

print("\nTraining target distribution:")
print(y_train.value_counts())

print("\nValidation target distribution:")
print(y_validation.value_counts())

print("\nFinal test target distribution:")
print(y_test.value_counts())

# PREPROCESSING


# Numerical features
numerical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median"))
    ]
)

# Categorical features
categorical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            )
        )
    ]
)


# Combine both preprocessing pipelines
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


print("\nPreprocessing pipeline created successfully.")


# RANDOM FOREST MODEL


from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


# Create the Random Forest model
random_forest = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)



# COMPLETE ML PIPELINE

model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", random_forest)
    ]
)


print("\n======================================")
print("TRAINING RANDOM FOREST MODEL")
print("======================================")


# Train the model
model.fit(X_train, y_train)

print("Random Forest training completed successfully.")


# PREDICTIONS


y_pred = model.predict(X_test)

y_probability = model.predict_proba(X_test)[:, 1]



# MODEL EVALUATION


accuracy = accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)


print("\n======================================")
print("MODEL EVALUATION")
print("======================================")

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")



# CONFUSION MATRIX


print("\nConfusion Matrix:")

cm = confusion_matrix(
    y_test,
    y_pred
)

print(cm)



# CLASSIFICATION REPORT


print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred,
        target_names=["Normal", "Fraud"],
        zero_division=0
    )
)

# SAVE TRAINED MODEL

MODEL_FILE = "medical_claim_fraud_model.pkl"

joblib.dump(model, MODEL_FILE)

print("\n======================================")
print("MODEL SAVED")
print("======================================")
print(f"Saved model as: {MODEL_FILE}")
# ============================================================
# McNEMAR TEST: PURE RULE-BASED vs PURE ML
# ============================================================

from statsmodels.stats.contingency_tables import mcnemar


# ------------------------------------------------------------
# CREATE RULE-BASED PREDICTIONS FOR THE SAME TEST SET
# ------------------------------------------------------------

# Recreate the same 20% final test split
development_df, test_df = train_test_split(
    df,
    test_size=0.20,
    random_state=42,
    stratify=df["fraud_label"]
)


# Rule-based fraud scoring
def calculate_rule_score(row):

    score = 0

    if row["claim_amount"] > row["annual_limit"]:
        score += 30

    if row["document_mismatch"] == 1:
        score += 25

    if row["high_risk_procedure_flag"] == 1:
        score += 15

    if row["claim_submission_delay_days"] > 30:
        score += 10

    if row["medical_bills_provided"] == 0:
        score += 10

    if row["prescription_provided"] == 0:
        score += 5

    if row["reports_provided"] == 0:
        score += 5

    return min(score, 100)


# Calculate rule scores for final test set
test_df["rule_score"] = test_df.apply(
    calculate_rule_score,
    axis=1
)


# Rule score >= 60 = Fraud
y_rule_pred = (
    test_df["rule_score"] >= 60
).astype(int).to_numpy()


# Actual labels
y_actual = test_df["fraud_label"].to_numpy()


# ML predictions already generated above
y_ml_pred = y_pred


# ------------------------------------------------------------
# CHECK SAME NUMBER OF PREDICTIONS
# ------------------------------------------------------------

print("\n======================================")
print("McNEMAR TEST: RULE-BASED vs ML")
print("======================================")

print("Rule-Based predictions:", len(y_rule_pred))
print("ML predictions        :", len(y_ml_pred))
print("Actual labels         :", len(y_actual))


# ------------------------------------------------------------
# DETERMINE CORRECT / INCORRECT PREDICTIONS
# ------------------------------------------------------------

rule_correct = (y_rule_pred == y_actual)
ml_correct = (y_ml_pred == y_actual)


# ------------------------------------------------------------
# CREATE McNEMAR CONTINGENCY TABLE
# ------------------------------------------------------------

both_correct = (
    rule_correct & ml_correct
).sum()

rule_correct_ml_wrong = (
    rule_correct & ~ml_correct
).sum()

rule_wrong_ml_correct = (
    ~rule_correct & ml_correct
).sum()

both_wrong = (
    ~rule_correct & ~ml_correct
).sum()


table = [
    [both_correct, rule_correct_ml_wrong],
    [rule_wrong_ml_correct, both_wrong]
]


print("\nMcNemar Contingency Table:")
print("--------------------------------------")
print("                         ML Correct   ML Incorrect")

print(
    f"Rule Correct            {both_correct:>11}   "
    f"{rule_correct_ml_wrong:>13}"
)

print(
    f"Rule Incorrect          {rule_wrong_ml_correct:>11}   "
    f"{both_wrong:>13}"
)


# ------------------------------------------------------------
# RUN McNEMAR TEST
# ------------------------------------------------------------

result = mcnemar(
    table,
    exact=False,
    correction=True
)


print("\nMcNemar Test Statistic:", f"{result.statistic:.4f}")
print("p-value:", f"{result.pvalue:.12f}")


# ------------------------------------------------------------
# INTERPRETATION
# ------------------------------------------------------------

if result.pvalue < 0.05:

    print("\nInterpretation:")
    print(
        "There is a statistically significant difference "
        "between the Rule-Based and ML models (p < 0.05)."
    )

else:

    print("\nInterpretation:")
    print(
        "There is no statistically significant difference "
        "between the Rule-Based and ML models (p >= 0.05)."
    )