from flask import Flask, jsonify
from flask_cors import CORS

from database import get_connection
from routes.auth import auth
from routes.claims import claims
from routes.attachments import attachments

app = Flask(__name__)

CORS(app)

app.register_blueprint(auth)
app.register_blueprint(claims)
app.register_blueprint(attachments)


@app.route("/")
def home():
    return "Medical Claim Backend Running"


@app.route("/users")
def get_users():
    db = get_connection()

    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users")

    users = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(users)


if __name__ == "__main__":
    app.run(debug=True)