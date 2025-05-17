from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from models import db
from routes.auth import auth_bp
from routes.jobs import jobs_bp

load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///jobtrackr.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'supersecretkey')

    db.init_app(app)
    JWTManager(app)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(jobs_bp, url_prefix='/jobs')

    @app.route("/")
    def home():
        return {"msg": "JobTrackr API is running"}

    return app
