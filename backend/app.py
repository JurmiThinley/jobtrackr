from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.jobs import jobs_bp

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Later move to .env
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(jobs_bp, url_prefix='/jobs')

@app.route('/')
def home():
    return {"message": "JobTrackr API is running"}

if __name__ == '__main__':
    app.run(debug=True)
