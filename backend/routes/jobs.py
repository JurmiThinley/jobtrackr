from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import User, Job, db

jobs_bp = Blueprint('jobs', __name__)

# Existing protected route for testing user info
@jobs_bp.route('/protected-route', methods=['GET'])
@jwt_required()
def protected_route():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify(message="User not found"), 404
    return jsonify(message=f"Hello, {user.username}! Welcome to your dashboard."), 200


# GET all jobs for current user
@jobs_bp.route('/', methods=['GET'])
@jwt_required()
def get_jobs():
    user_id = get_jwt_identity()
    jobs = Job.query.filter_by(user_id=user_id).all()
    return jsonify([job.to_dict() for job in jobs]), 200


# POST a new job application
@jobs_bp.route('/', methods=['POST'])
@jwt_required()
def add_job():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Handle date_applied input
    date_str = data.get('date_applied')
    if date_str:
        try:
            date_applied = datetime.fromisoformat(date_str).date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD."}), 400
    else:
        date_applied = None  # Will fallback to model default

    new_job = Job(
        title=data.get('title'),
        company=data.get('company'),
        location=data.get('location'),
        status=data.get('status', 'applied'),
        date_applied=date_applied,
        notes=data.get('notes'),
        user_id=user_id
    )
    db.session.add(new_job)
    db.session.commit()
    return jsonify(new_job.to_dict()), 201


# PUT update a job by ID
@jobs_bp.route('/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    user_id = get_jwt_identity()
    job = Job.query.filter_by(id=job_id, user_id=user_id).first()
    if not job:
        return jsonify({"msg": "Job not found"}), 404

    data = request.get_json()

    job.title = data.get('title', job.title)
    job.company = data.get('company', job.company)
    job.location = data.get('location', job.location)
    job.status = data.get('status', job.status)

    date_str = data.get('date_applied')
    if date_str:
        try:
            job.date_applied = datetime.fromisoformat(date_str).date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD."}), 400

    job.notes = data.get('notes', job.notes)

    db.session.commit()
    return jsonify(job.to_dict()), 200


# DELETE a job by ID
@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    user_id = get_jwt_identity()
    job = Job.query.filter_by(id=job_id, user_id=user_id).first()
    if not job:
        return jsonify({"msg": "Job not found"}), 404

    db.session.delete(job)
    db.session.commit()
    return jsonify({"msg": "Job deleted"}), 200
