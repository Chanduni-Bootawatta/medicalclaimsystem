from flask import Blueprint, request, jsonify
from database import get_connection
import os

attachments = Blueprint("attachments", __name__)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


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

    filename = file.filename

    file_path = os.path.join(UPLOAD_FOLDER, filename)

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
            filename,
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
        "file_name": filename
    }), 201
@attachments.route("/attachments/<int:claim_id>", methods=["GET"])
def get_attachments(claim_id):

    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM attachments
        WHERE claim_id = %s
        """,
        (claim_id,)
    )

    attachments_list = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "success": True,
        "claim_id": claim_id,
        "attachments": attachments_list
    })