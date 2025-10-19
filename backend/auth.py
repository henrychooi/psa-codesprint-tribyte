"""
Authentication and User Management
Simple demo authentication for role-based access control
"""
from functools import wraps
from flask import request, jsonify

# Demo users (in production, this would be in database with hashed passwords)
DEMO_USERS = {
    # Employees (mapped to Employee_Profiles.json)
    "samantha.lee": {
        "password": "password123",
        "role": "employee",
        "name": "Samantha Lee",
        "employee_id": "EMP-20001",
        "email": "samantha.lee@globalpsa.com",
        "job_title": "Cloud Solutions Architect",
        "department": "Information Technology"
    },
    "aisyah.rahman": {
        "password": "password123",
        "role": "employee",
        "name": "Nur Aisyah Binte Rahman",
        "employee_id": "EMP-20002",
        "email": "aisyah.rahman@globalpsa.com",
        "job_title": "Cybersecurity Analyst",
        "department": "Information Technology"
    },
    "rohan.mehta": {
        "password": "password123",
        "role": "employee",
        "name": "Rohan Mehta",
        "employee_id": "EMP-20003",
        "email": "rohan.mehta@globalpsa.com",
        "job_title": "Finance Manager (FP&A)",
        "department": "Finance"
    },
    "emily.wong": {
        "password": "password123",
        "role": "employee",
        "name": "Emily Wong",
        "employee_id": "EMP-20004",
        "email": "emily.wong@globalpsa.com",
        "job_title": "Data Scientist",
        "department": "Business Analytics"
    },
    "david.tan": {
        "password": "password123",
        "role": "employee",
        "name": "David Tan",
        "employee_id": "EMP-20005",
        "email": "david.tan@globalpsa.com",
        "job_title": "Operations Manager",
        "department": "Terminal Operations"
    },
    
    # Admins
    "admin": {
        "password": "admin123",
        "role": "admin",
        "name": "System Administrator",
        "employee_id": None,
        "email": "admin@psa.com",
        "job_title": "System Administrator",
        "department": "IT Administration"
    },
    "hr.admin": {
        "password": "admin123",
        "role": "admin",
        "name": "HR Administrator",
        "employee_id": None,
        "email": "hr.admin@psa.com",
        "job_title": "HR Administrator",
        "department": "Human Resources"
    }
}


def authenticate_user(username: str, password: str) -> dict:
    """
    Authenticate user with username and password
    Returns user data if successful, None otherwise
    """
    username_lower = username.lower().strip()
    
    if username_lower in DEMO_USERS:
        user = DEMO_USERS[username_lower]
        if user["password"] == password:
            # Return user data without password
            home_route = "/employee-home" if user["role"] == "employee" else "/"
            return {
                "username": username_lower,
                "role": user["role"],
                "name": user["name"],
                "employee_id": user["employee_id"],
                "email": user["email"],
                "job_title": user.get("job_title"),
                "department": user.get("department"),
                "home_route": home_route
            }
    
    return None


def get_all_users(include_passwords: bool = False) -> list:
    """
    Get list of all users (for admin purposes)
    """
    users = []
    for username, user in DEMO_USERS.items():
        home_route = "/employee-home" if user["role"] == "employee" else "/"
        user_data = {
            "username": username,
            "role": user["role"],
            "name": user["name"],
            "employee_id": user["employee_id"],
            "email": user["email"],
            "job_title": user.get("job_title"),
            "department": user.get("department"),
            "home_route": home_route
        }
        if include_passwords:
            user_data["password"] = user["password"]
        users.append(user_data)
    return users


def get_user_by_employee_id(employee_id: str) -> dict:
    """
    Get user data by employee ID
    """
    for username, user in DEMO_USERS.items():
        if user.get("employee_id") == employee_id:
            return {
                "username": username,
                "role": user["role"],
                "name": user["name"],
                "employee_id": user["employee_id"],
                "email": user["email"]
            }
    return None


def update_username(old_username: str, new_username: str) -> dict:
    """
    Update a user's username
    Returns success status and message
    """
    old_username = old_username.lower().strip()
    new_username = new_username.lower().strip()
    
    # Validate new username
    if not new_username or len(new_username) < 3:
        return {
            "success": False,
            "message": "Username must be at least 3 characters long"
        }
    
    if not new_username.replace(".", "").replace("_", "").isalnum():
        return {
            "success": False,
            "message": "Username can only contain letters, numbers, dots, and underscores"
        }
    
    # Check if old username exists
    if old_username not in DEMO_USERS:
        return {
            "success": False,
            "message": "User not found"
        }
    
    # Check if new username is already taken
    if new_username in DEMO_USERS and new_username != old_username:
        return {
            "success": False,
            "message": "Username already taken"
        }
    
    # Update username
    user_data = DEMO_USERS.pop(old_username)
    DEMO_USERS[new_username] = user_data
    
    return {
        "success": True,
        "message": "Username updated successfully",
        "new_username": new_username
    }


def get_user_data(username: str) -> dict:
    """
    Get user data by username (without password)
    """
    username = username.lower().strip()
    
    if username in DEMO_USERS:
        user = DEMO_USERS[username]
        home_route = "/employee-home" if user["role"] == "employee" else "/"
        return {
            "username": username,
            "role": user["role"],
            "name": user["name"],
            "employee_id": user["employee_id"],
            "email": user["email"],
            "job_title": user.get("job_title"),
            "department": user.get("department"),
            "home_route": home_route
        }
    
    return None


def require_auth(f):
    """
    Decorator to require authentication for endpoints
    Expects 'Authorization' header with format: 'Bearer <username>'
    In production, use proper JWT tokens
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        
        username = auth_header.replace('Bearer ', '').strip()
        
        if username.lower() not in DEMO_USERS:
            return jsonify({
                'success': False,
                'error': 'Invalid authentication'
            }), 401
        
        # Add user data to request context
        request.user = {
            "username": username.lower(),
            "role": DEMO_USERS[username.lower()]["role"],
            "name": DEMO_USERS[username.lower()]["name"],
            "employee_id": DEMO_USERS[username.lower()].get("employee_id")
        }
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_admin(f):
    """
    Decorator to require admin role
    """
    @wraps(f)
    @require_auth
    def decorated_function(*args, **kwargs):
        if request.user.get('role') != 'admin':
            return jsonify({
                'success': False,
                'error': 'Admin access required'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_employee(f):
    """
    Decorator to require employee role (or admin)
    """
    @wraps(f)
    @require_auth
    def decorated_function(*args, **kwargs):
        if request.user.get('role') not in ['employee', 'admin']:
            return jsonify({
                'success': False,
                'error': 'Employee access required'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function
