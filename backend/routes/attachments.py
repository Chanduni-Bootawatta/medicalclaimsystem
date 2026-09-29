from flask import Blueprint, request, jsonify, send_from_directory
from database import get_connection
import os
import uuid

attachments = Blueprint("attachments", __name__)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "uploads"
)

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# =========================
# UPLOAD ATTACHMENT
# =========================
@attachments.route("/attachments", methods=["POST"])
def upload_attachment():

    if "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "No file uploaded"
        }), 400

    file = request.files["file"]
    claim_id = request.form.get("claim_id")

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "No file selected"
        }), 400

    original_filename = file.filename

    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    file.save(file_path)

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO attachments
        (claim_id, file_name, file_type, file_path)
        VALUES (%s, %s, %s, %s)
        """,
        (
            claim_id,
            original_filename,
            file.content_type,
            file_path
        )
    )

    db.commit()

    attachment_id = cursor.lastrowid

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "message": "Attachment uploaded successfully",
        "attachment_id": attachment_id,
        "claim_id": claim_id,
        "file_name": original_filename
    }), 201


# =========================
# GET ATTACHMENTS FOR CLAIM
# =========================
@attachments.route("/attachments/<int:claim_id>", methods=["GET"])
def get_attachments(claim_id):

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            attachment_id,
            claim_id,
            file_name,
            file_type,
            file_path
        FROM attachments
        WHERE claim_id = %s
        ORDER BY attachment_id ASC
        """,
        (claim_id,)
    )

    attachments_list = cursor.fetchall()

    cursor.close()
    db.close()

    print("================================")
    print("ATTACHMENTS FOR CLAIM:", claim_id)
    print("ATTACHMENTS:", attachments_list)
    print("================================")

    return jsonify({
        "success": True,
        "claim_id": claim_id,
        "attachments": attachments_list
    })


# =========================
# SERVE ATTACHMENT FILE
# =========================
@attachments.route(
    "/attachments/file/<int:attachment_id>",
    methods=["GET"]
)
def serve_attachment_by_id(attachment_id):

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT file_path, file_name, file_type
        FROM attachments
        WHERE attachment_id = %s
        """,
        (attachment_id,)
    )

    attachment = cursor.fetchone()

    cursor.close()
    db.close()

    if not attachment:
        return jsonify({
            "success": False,
            "message": "Attachment not found"
        }), 404

    filename = os.path.basename(attachment["file_path"])

    full_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    print("================================")
    print("UPLOAD_FOLDER:", UPLOAD_FOLDER)
    print("DB FILE PATH:", attachment["file_path"])
    print("FILENAME:", filename)
    print("FULL PATH:", full_path)
    print("FILE EXISTS:", os.path.exists(full_path))
    print("================================")

    if not os.path.exists(full_path):
        return jsonify({
            "success": False,
            "message": "File does not exist on server"
        }), 404

    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )