from flask import Blueprint, request, jsonify
from database import get_connection

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
    treatment_period = data.get("treatment_period")
    doctor_name = data.get("doctor_name")
    category = data.get("category")
    claim_amount = data.get("claim_amount")

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
            claim_amount
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            claim_amount
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

    cursor.execute("SELECT * FROM claims")

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

    # Temporary rule-based fraud check
    if claim["claim_amount"] is not None and claim["claim_amount"] > 100000:
        fraud_result = "FRAUD"
    else:
        fraud_result = "NOT_FRAUD"

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Fraud check completed",
        "claim_id": claim_id,
        "fraud_result": fraud_result
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
        new_status = "A_B_REVIEW"
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
        SET claim_amount = %s
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
        SELECT claim_id, claim_amount
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
        WHERE b_status = 'APPROVED'
        AND a_status = 'PENDING'
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
        WHERE a_status = 'REJECTED'
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
        SELECT claim_id, claim_amount, b_status, a_status, payment_status
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
            status = 'PAID'
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