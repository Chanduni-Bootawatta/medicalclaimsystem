from flask import Blueprint, request, jsonify
from database import get_connection
from ml_detector import detect_fraud
from datetime import date

claims = Blueprint("claims", __name__)

@claims.route("/claims", methods=["POST"])
def create_claim():

    data = request.get_json()

    user_id = data.get("user_id")
    service_no = data.get("service_no")
    account_no = data.get("account_no")
    grade = data.get("grade")
    branch = data.get("branch")
    claim_for = data.get("claim_for")
    relationship = data.get("relationship")

    treatment_start_date = data.get("treatment_start_date")
    treatment_end_date = data.get("treatment_end_date")

    doctor_name = data.get("doctor_name")
    category = data.get("category")
    claim_amount = data.get("claim_amount")

    hospital_type = data.get("hospital_type")
    hospital_stay_days = data.get("hospital_stay_days")
    high_risk_procedure_flag = data.get(
        "high_risk_procedure_flag",
        0
    )

    treatment_period = None

    if treatment_start_date and treatment_end_date:
        treatment_period = (
            f"{treatment_start_date} to {treatment_end_date}"
        )

    db = get_connection()
    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO claims (
            user_id,
            service_no,
            account_no,
            grade,
            branch,
            claim_for,
            relationship,
            treatment_period,
            doctor_name,
            category,
            claim_amount,
            hospital_type,
            hospital_stay_days,
            high_risk_procedure_flag,
            treatment_start_date,
            treatment_end_date
        )
        VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s
        )
        """,
        (
            user_id,
            service_no,
            account_no,
            grade,
            branch,
            claim_for,
            relationship,
            treatment_period,
            doctor_name,
            category,
            claim_amount,
            hospital_type,
            hospital_stay_days,
            high_risk_procedure_flag,
            treatment_start_date,
            treatment_end_date
        )
    )

    db.commit()
    claim_id = cursor.lastrowid
    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Claim submitted successfully",
        "claim_id": claim_id
    }), 201

@claims.route("/claims", methods=["GET"])
def get_claims():

    db = get_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
    SELECT 
        c.*,
        u.full_name
    FROM claims c
    LEFT JOIN users u
        ON c.user_id = u.user_id
    ORDER BY c.claim_id DESC
      """)
    claims_list = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(claims_list)

@claims.route("/claims/<int:claim_id>", methods=["PUT"])
def update_claim_status(claim_id):

    data = request.get_json()

    status = data.get("status")

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        UPDATE claims
        SET status = %s
        WHERE claim_id = %s
        """,
        (status, claim_id)
    )

    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Claim status updated successfully",
        "claim_id": claim_id,
        "status": status
    })
@claims.route("/claims/<int:claim_id>/staff-review", methods=["PUT"])
def staff_review_claim(claim_id):

    data = request.get_json()

    action = data.get("action")

    if action not in ["APPROVE", "REJECT"]:
        return jsonify({
            "success": False,
            "message": "Action must be APPROVE or REJECT"
        }), 400

    db = get_connection()
    cursor = db.cursor()

    if action == "APPROVE":
        new_status = "FRAUD_CHECK"
    else:
        new_status = "REJECTED"

    cursor.execute(
        """
        UPDATE claims
        SET status = %s
        WHERE claim_id = %s
        """,
        (new_status, claim_id)
    )

    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Staff review completed",
        "claim_id": claim_id,
        "action": action,
        "status": new_status
    })
@claims.route("/claims/<int:claim_id>/fraud-check", methods=["PUT"])
def fraud_check_claim(claim_id):

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    # Get claim
    cursor.execute(
        """
        SELECT *
        FROM claims
        WHERE claim_id = %s
        """,
        (claim_id,)
    )

    claim = cursor.fetchone()

    if not claim:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    # --------------------------------------------------
    # ANNUAL LIMITS
    # --------------------------------------------------

    annual_limits = {
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

    grade = claim["grade"]
    category = claim["category"]

    try:
        annual_limit = annual_limits[grade][category]
    except KeyError:

        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Invalid grade or claim category"
        }), 400

    # --------------------------------------------------
    # PREVIOUS CLAIM COUNT
    # --------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS previous_count
        FROM claims
        WHERE user_id = %s
        AND claim_id != %s
        """,
        (
            claim["user_id"],
            claim_id
        )
    )

    previous_result = cursor.fetchone()
    previous_claims_count = previous_result["previous_count"]

    # --------------------------------------------------
    # TREATMENT DURATION
    # --------------------------------------------------

    treatment_duration_days = 1

    if claim["treatment_start_date"] and claim["treatment_end_date"]:

        treatment_duration_days = (
            claim["treatment_end_date"]
            - claim["treatment_start_date"]
        ).days + 1

    # --------------------------------------------------
    # CLAIM SUBMISSION DELAY
    # --------------------------------------------------

    claim_submission_delay_days = 0

    if claim["treatment_end_date"]:

        claim_submission_delay_days = (
            date.today() - claim["treatment_end_date"]
        ).days

        if claim_submission_delay_days < 0:
            claim_submission_delay_days = 0

    # --------------------------------------------------
    # DOCUMENT INFORMATION
    # Sent from React during fraud check
    # --------------------------------------------------

    prescription_provided = int(
        request.json.get("prescription_provided", 0)
    )

    medical_bills_provided = int(
        request.json.get("medical_bills_provided", 0)
    )

    reports_provided = int(
        request.json.get("reports_provided", 0)
    )

    # At this stage we do not have a separate
    # document-mismatch field in the database.
    document_mismatch = int(
        request.json.get("document_mismatch", 0)
    )

    # --------------------------------------------------
    # PREPARE MODEL INPUT
    # --------------------------------------------------

    model_data = {

        "hospital_type": claim["hospital_type"],

        "claim_amount": float(
            claim["claim_amount"] or 0
        ),

        # New claims have not been approved yet
        "approved_amount": 0,

        "hospital_stay_days": int(
            claim["hospital_stay_days"] or 0
        ),

        "previous_claims_count": previous_claims_count,

        "claim_submission_delay_days":
            claim_submission_delay_days,

        "high_risk_procedure_flag": int(
            claim["high_risk_procedure_flag"] or 0
        ),

        "document_mismatch": document_mismatch,

        "prescription_provided":
            prescription_provided,

        "medical_bills_provided":
            medical_bills_provided,

        "reports_provided":
            reports_provided,

        "treatment_duration_days":
            treatment_duration_days,

        "annual_limit":
            annual_limit,

        "grade": claim["grade"],

        "branch": claim["branch"],

        "claim_for": claim["claim_for"],

        "relationship": claim["relationship"],

        "claim_category": claim["category"]
    }

    # --------------------------------------------------
    # RUN HYBRID FRAUD DETECTOR
    # --------------------------------------------------

    result = detect_fraud(model_data)

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Hybrid fraud detection completed",

        "claim_id": claim_id,

        "fraud_status": result["fraud_status"],

        "prediction": result["prediction"],

        "rule_score": result["rule_score"],

        "ml_score": result["ml_score"],

        "hybrid_score": result["hybrid_score"],

        "risk_level": result["risk_level"]
    })
@claims.route("/claims/<int:claim_id>/staff-action", methods=["PUT"])
def staff_action(claim_id):

    data = request.get_json()
    action = data.get("action")

    if action not in ["APPROVE", "SEND_MANAGER", "REJECT"]:
        return jsonify({
            "success": False,
            "message": "Invalid action"
        }), 400

    if action == "APPROVE":
        new_status = "STAFF_REVIEW"
    elif action == "SEND_MANAGER":
        new_status = "MANAGER_REVIEW"
    else:
        new_status = "REJECTED"

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        UPDATE claims
        SET status = %s
        WHERE claim_id = %s
        """,
        (new_status, claim_id)
    )

    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Staff action completed",
        "claim_id": claim_id,
        "action": action,
        "status": new_status
    })
@claims.route("/claims/<int:claim_id>/manager-action", methods=["PUT"])
def manager_action(claim_id):

    data = request.get_json()
    action = data.get("action")

    if action not in ["APPROVE", "REJECT"]:
        return jsonify({
            "success": False,
            "message": "Invalid action"
        }), 400

    if action == "APPROVE":
        new_status = "STAFF_CLAIM_AMOUNT"
    else:
        new_status = "REJECTED"

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        UPDATE claims
        SET status = %s
        WHERE claim_id = %s
        """,
        (new_status, claim_id)
    )

    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Manager action completed",
        "claim_id": claim_id,
        "action": action,
        "status": new_status
    })
@claims.route("/claims/<int:claim_id>/claimed-amount", methods=["PUT"])
def update_claimed_amount(claim_id):

    data = request.get_json()
    claimed_amount = data.get("claimed_amount")

    if claimed_amount is None:
        return jsonify({
            "success": False,
            "message": "Claimed amount is required"
        }), 400

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
         UPDATE claims
         SET claimed_amount = %s
         WHERE claim_id = %s
        """,
        (claimed_amount, claim_id)
    )

    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Claimed amount updated successfully",
        "claim_id": claim_id,
        "claimed_amount": claimed_amount
    })
@claims.route("/claims/<int:claim_id>/send-to-b", methods=["PUT"])
def send_to_b_grade(claim_id):

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT claim_id, claimed_amount
        FROM claims
        WHERE claim_id = %s
        """,
        (claim_id,)
    )

    claim = cursor.fetchone()

    if not claim:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    cursor.execute(
        """
        UPDATE claims
        SET status = %s
        WHERE claim_id = %s
        """,
        ("A_B_REVIEW", claim_id)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Claim sent to B Grade successfully",
        "claim_id": claim_id,
        "status": "A_B_REVIEW"
    })
@claims.route("/claims/<int:claim_id>/b-grade-action", methods=["PUT"])
def b_grade_action(claim_id):

    data = request.get_json()
    action = data.get("action")

    if action not in ["APPROVE", "REJECT"]:
        return jsonify({
            "success": False,
            "message": "Invalid action"
        }), 400

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT claim_id
        FROM claims
        WHERE claim_id = %s
        """,
        (claim_id,)
    )

    claim = cursor.fetchone()

    if not claim:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    if action == "APPROVE":

        b_status = "APPROVED"
        a_status = "PENDING"
        message = "B Grade approval completed"

    else:

        b_status = "REJECTED"
        a_status = "PENDING"
        message = "B Grade rejection completed"

    cursor.execute(
        """
        UPDATE claims
        SET b_status = %s,
            a_status = %s
        WHERE claim_id = %s
        """,
        (b_status, a_status, claim_id)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": message,
        "claim_id": claim_id,
        "action": action,
        "b_status": b_status,
        "a_status": a_status
    })
@claims.route("/claims/<int:claim_id>/send-to-a", methods=["PUT"])
def send_to_a_grade(claim_id):

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT claim_id, b_status
        FROM claims
        WHERE claim_id = %s
        """,
        (claim_id,)
    )

    claim = cursor.fetchone()

    if not claim:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    if claim[1] != "APPROVED":
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim must be approved by B Grade before sending to A Grade"
        }), 400

    cursor.execute(
        """
        UPDATE claims
        SET a_status = %s
        WHERE claim_id = %s
        """,
        ("PENDING", claim_id)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Claim sent to A Grade successfully",
        "claim_id": claim_id,
        "a_status": "PENDING"
    })
@claims.route("/claims/<int:claim_id>/a-grade-action", methods=["PUT"])
def a_grade_action(claim_id):

    data = request.get_json()
    action = data.get("action")

    if action not in ["APPROVE", "REJECT"]:
        return jsonify({
            "success": False,
            "message": "Invalid action"
        }), 400

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        SELECT claim_id, b_status, a_status
        FROM claims
        WHERE claim_id = %s
        """,
        (claim_id,)
    )

    claim = cursor.fetchone()

    if not claim:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    # A Grade can only process a claim approved by B
    if claim[1] != "APPROVED":
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim must be approved by B Grade first"
        }), 400

    if action == "APPROVE":

        a_status = "APPROVED"
        message = "A Grade approval completed"

    else:

        a_status = "REJECTED"
        message = "A Grade rejection completed"

    cursor.execute(
        """
        UPDATE claims
        SET a_status = %s
        WHERE claim_id = %s
        """,
        (a_status, claim_id)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": message,
        "claim_id": claim_id,
        "action": action,
        "a_status": a_status
    })
@claims.route("/claims/ab-pending", methods=["GET"])
def get_ab_pending_claims():

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
    """
    SELECT *
    FROM claims
    WHERE payment_status != 'PAID'
      AND (
          b_status = 'PENDING'
          OR (
              b_status = 'APPROVED'
              AND a_status = 'PENDING'
          )
      )
    """
)

    claims_list = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "claims": claims_list
    })
@claims.route("/claims/ab-approved", methods=["GET"])
def get_ab_approved_claims():

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
    """
    SELECT *
    FROM claims
    WHERE b_status = 'APPROVED'
      AND a_status = 'APPROVED'
      AND payment_status != 'PAID'
    """
)

    claims_list = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "claims": claims_list
    })
@claims.route("/claims/ab-rejected", methods=["GET"])
def get_ab_rejected_claims():

    db = get_connection()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute(
    """
    SELECT *
    FROM claims
    WHERE payment_status != 'PAID'
      AND (
          b_status = 'REJECTED'
          OR a_status = 'REJECTED'
      )
    """
)
    claims_list = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "claims": claims_list
    })

@claims.route("/claims/<int:claim_id>/pay", methods=["PUT"])
def pay_claim(claim_id):

    db = get_connection()
    cursor = db.cursor()

    # Check the claim
    cursor.execute(
        """
        SELECT claim_id, claimed_amount, b_status, a_status, payment_status
        FROM claims
        WHERE claim_id = %s
        """,
        (claim_id,)
    )

    claim = cursor.fetchone()

    if not claim:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    # Only fully approved claims can be paid
    if claim[2] != "APPROVED" or claim[3] != "APPROVED":
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim must be approved by both B and A Grade before payment"
        }), 400

    # Prevent paying twice
    if claim[4] == "PAID":
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim has already been paid"
        }), 400

    # Mark as paid
    cursor.execute(
        """
         UPDATE claims
         SET payment_status = 'PAID',
         status = 'PAID',
         paid_at = NOW()
         WHERE claim_id = %s
        """,
        (claim_id,)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Claim paid successfully",
        "claim_id": claim_id,
        "payment_status": "PAID",
        "status": "PAID",
        "paid_amount": float(claim[1])
    })
@claims.route("/claims/payment-history", methods=["GET"])
def payment_history():

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            claim_id,
            user_id,
            service_no,
            account_no,
            grade,
            branch,
            claim_for,
            relationship,
            treatment_period,
            doctor_name,
            category,
            claim_amount,
            claimed_amount,
            paid_at,
            status,
            b_status,
            a_status,
            payment_status
        FROM claims
        WHERE payment_status = 'PAID'
        ORDER BY claim_id DESC
        """
    )

    claims_list = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "claims": claims_list
    })
@claims.route("/claims/<int:claim_id>/notification", methods=["GET"])
def claim_notification(claim_id):

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            claim_id,
            user_id,
            claim_amount,
            status,
            b_status,
            a_status,
            payment_status
        FROM claims
        WHERE claim_id = %s
        """,
        (claim_id,)
    )

    claim = cursor.fetchone()

    if not claim:
        cursor.close()
        db.close()

        return jsonify({
            "success": False,
            "message": "Claim not found"
        }), 404

    # Determine the message shown to the applier
    if claim["payment_status"] == "PAID":
        notification_status = "PAID"
        message = "Your claim has been paid successfully."

    elif claim["a_status"] == "REJECTED":
        notification_status = "REJECTED"
        message = "Your claim was rejected by A Grade."

    elif claim["b_status"] == "REJECTED":
        notification_status = "REJECTED"
        message = "Your claim was rejected by B Grade."

    elif (
        claim["b_status"] == "APPROVED"
        and claim["a_status"] == "APPROVED"
    ):
        notification_status = "APPROVED"
        message = "Your claim has been approved and is awaiting payment."

    elif (
        claim["b_status"] == "APPROVED"
        and claim["a_status"] == "PENDING"
    ):
        notification_status = "A_GRADE_REVIEW"
        message = "Your claim has been approved by B Grade and is under A Grade review."

    elif claim["status"] == "MANAGER_REVIEW":
        notification_status = "MANAGER_REVIEW"
        message = "Your claim is currently under Manager review."

    elif claim["status"] == "A_B_REVIEW":
        notification_status = "B_GRADE_REVIEW"
        message = "Your claim is currently under B Grade review."

    else:
        notification_status = "PENDING"
        message = "Your claim has been submitted and is pending review."

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "claim_id": claim["claim_id"],
        "status": notification_status,
        "message": message,
        "claim_amount": float(claim["claim_amount"])
        if claim["claim_amount"] is not None else None
    })