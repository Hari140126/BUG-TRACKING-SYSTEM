
import { User, UserRole, Bug, BugPriority, BugStatus } from './types';

export const MOCK_USERS: User[] = [
  { 
    id: 1, 
    fullName: 'System Manager', 
    username: 'admin',
    email: 'manager@bugs.io',
    role: UserRole.MANAGER, 
    designation: 'Project Lead',
    department: 'Engineering',
    skills: 'Resource Planning, SQL, Python',
    password: 'admin123',
    isApproved: true, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 2, 
    fullName: 'Alice Johnson', 
    username: 'alice_q',
    email: 'alice@bugs.io',
    role: UserRole.TESTER, 
    designation: 'QA Specialist',
    department: 'Quality Control',
    skills: 'Selenium, Cypress, Jest',
    password: 'password123',
    isApproved: true, 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 3, 
    fullName: 'Bob Smith', 
    username: 'bob_dev',
    email: 'bob@bugs.io',
    role: UserRole.DEVELOPER, 
    designation: 'Backend Engineer',
    department: 'Infrastructure',
    skills: 'Python, Flask, MySQL, Redis',
    password: 'password123',
    isApproved: true, 
    createdAt: new Date().toISOString() 
  },
];

export const INITIAL_BUGS: Bug[] = [
  {
    id: 1,
    title: 'MySQL Connection Pool Exhaustion',
    description: 'The pymysql driver is hitting max connections under heavy load spikes.',
    priority: BugPriority.HIGH,
    status: BugStatus.OPEN,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    testerId: 2,
    developerId: null,
    testerName: 'Alice Johnson',
    attachments: []
  }
];

export const BACKEND_FILES = {
  models_py: `from flask_sqlalchemy import SQLAlchemy
from enum import Enum
from datetime import datetime

db = SQLAlchemy()

class UserRole(Enum):
    MANAGER = 'Manager'
    TESTER = 'Tester'
    DEVELOPER = 'Developer'

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.TESTER)
    
    # Professional Details
    department = db.Column(db.String(100), nullable=True)
    skills = db.Column(db.Text, nullable=True)
    
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to bugs reported/assigned
    reported_bugs = db.relationship('Bug', foreign_keys='Bug.tester_id', backref='reporter', lazy=True)
    assigned_bugs = db.relationship('Bug', foreign_keys='Bug.developer_id', backref='assignee', lazy=True)

class Bug(db.Model):
    __tablename__ = 'bugs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.Enum('Low', 'Medium', 'High'), default='Medium')
    status = db.Column(db.Enum('Open', 'In-Progress', 'Resolved'), default='Open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    tester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    developer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)`,

  app_py: `from flask import Flask, request, jsonify, g
from flask_cors import CORS
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Bug, UserRole
import pymysql

# Patch MySQL driver
pymysql.install_as_MySQLdb()

app = Flask(__name__)
# MySQL Connection String: mysql+pymysql://<user>:<password>@<host>/<dbname>
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://admin:admin123@localhost/bug_tracker'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)

# Role Authorization Decorator
def role_required(role_name):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # In a real app, verify JWT token here to get user
            user_id = request.headers.get('X-User-ID') 
            user = User.query.get(user_id)
            if not user or user.role.value != role_name:
                return jsonify({"error": "Unauthorized access"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        return jsonify({
            "id": user.id,
            "username": user.username,
            "role": user.role.value,
            "status": "success"
        })
    return jsonify({"error": "Invalid credentials"}), 401

# --- Manager API ---
@app.route('/api/staff', methods=['GET'])
@role_required('Manager')
def get_staff():
    users = User.query.filter(User.role != UserRole.MANAGER).all()
    result = []
    for u in users:
        bug_count = Bug.query.filter(
            Bug.developer_id == u.id, 
            Bug.status.in_(['Open', 'In-Progress'])
        ).count()
        result.append({
            "id": u.id, "username": u.username, "role": u.role.value,
            "department": u.department, "skills": u.skills, "active_bugs": bug_count
        })
    return jsonify(result)

@app.route('/api/staff', methods=['POST'])
@role_required('Manager')
def create_staff():
    data = request.json
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=UserRole(data['role']),
        department=data.get('department'),
        skills=data.get('skills'),
        is_approved=True
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Staff account created"}), 201

# --- Bug API ---
@app.route('/api/bugs', methods=['POST'])
@role_required('Tester')
def report_bug():
    data = request.json
    new_bug = Bug(
        title=data['title'],
        description=data['description'],
        priority=data['priority'],
        tester_id=request.headers.get('X-User-ID'),
        developer_id=data.get('developer_id')
    )
    db.session.add(new_bug)
    db.session.commit()
    return jsonify({"id": new_bug.id}), 201

@app.route('/api/bugs/<int:id>/status', methods=['PATCH'])
@role_required('Developer')
def update_status(id):
    bug = Bug.query.get_or_404(id)
    if bug.developer_id != int(request.headers.get('X-User-ID')):
        return jsonify({"error": "Not assigned to you"}), 403
    
    bug.status = request.json['status']
    db.session.commit()
    return jsonify({"message": f"Status updated to {bug.status}"})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)`,

  schema_sql: `-- Database Initialization Script for MySQL
CREATE DATABASE IF NOT EXISTS bug_tracker;
USE bug_tracker;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Manager', 'Tester', 'Developer') NOT NULL,
    department VARCHAR(100),
    skills TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bugs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Open', 'In-Progress', 'Resolved') DEFAULT 'Open',
    tester_id INT NOT NULL,
    developer_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tester_id) REFERENCES users(id),
    FOREIGN KEY (developer_id) REFERENCES users(id)
);`
};
