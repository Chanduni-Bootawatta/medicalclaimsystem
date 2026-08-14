from flask import Blueprint, request, jsonify
from database import get_connection

auth = Blueprint("auth", __name__)


@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT user_id, username, full_name, role, branch, service_no, applicant_type
        FROM users
        WHERE username=%s AND password=%s
        """,
        (username, password)
    )

    user = cursor.fetchone()

    cursor.close()
    db.close()

    if user:
        return jsonify({
            "success": True,
            "user": user
        })

    return jsonify({
        "success": False,
        "message": "Invalid login"
    }), 401