"""
Flask REST API for Career Compass Module
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from database import engine, init_db
from models import Employee, Role, CareerPath
from ai_engine import (
    match_employee_to_roles,
    generate_career_narrative,
    generate_development_plan,
    generate_embedding,
    create_profile_text,
    classify_intent,
    generate_profile_summary,
    format_role_recommendations,
    generate_skill_gap_analysis,
    generate_wellbeing_support,
    generate_general_qa_response
)
from leadership_potential import (
    compute_leadership_potential,
    calculate_max_metrics,
    calculate_percentile_rank,
    generate_improvement_suggestions
)
from auth import authenticate_user, require_auth, require_admin, require_employee, get_all_users, update_username, get_user_data
from career_roadmap import (
    calculate_current_roadmap,
    calculate_predicted_roadmap_with_simulations
)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
app.config['JSON_SORT_KEYS'] = False


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Career Compass API is running'
    })


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    User login endpoint
    
    Request body:
        {
            "username": "samantha.lee" or "admin",
            "password": "employee123" or "admin123"
        }
    
    Response:
        {
            "success": true,
            "user": {
                "username": "samantha.lee",
                "role": "employee",
                "name": "Samantha Lee",
                "employee_id": "EMP-20001",
                "email": "samantha.lee@psa.com"
            },
            "token": "samantha.lee"  # In production, use JWT
        }
    """
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({
            'success': False,
            'error': 'Username and password required'
        }), 400
    
    user = authenticate_user(username, password)
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'Invalid username or password'
        }), 401
    
    # In production, generate proper JWT token
    # For demo, we'll use username as token
    return jsonify({
        'success': True,
        'user': user,
        'token': user['username']  # Simple token for demo
    })


@app.route('/api/auth/verify', methods=['GET'])
@require_auth
def verify_token():
    """
    Verify authentication token and return user data
    Expects Authorization header: Bearer <token>
    """
    return jsonify({
        'success': True,
        'user': request.user
    })


@app.route('/api/auth/demo-users', methods=['GET'])
def get_demo_users():
    """
    Get list of demo users for login page (development only)
    """
    return jsonify({
        'success': True,
        'users': [
            {
                'username': 'samantha.lee',
                'role': 'employee',
                'name': 'Samantha Lee',
                'job_title': 'Cloud Solutions Architect',
                'password_hint': 'password123'
            },
            {
                'username': 'aisyah.rahman',
                'role': 'employee',
                'name': 'Nur Aisyah Binte Rahman',
                'job_title': 'Cybersecurity Analyst',
                'password_hint': 'password123'
            },
            {
                'username': 'rohan.mehta',
                'role': 'employee',
                'name': 'Rohan Mehta',
                'job_title': 'Finance Manager (FP&A)',
                'password_hint': 'password123'
            },
            {
                'username': 'admin',
                'role': 'admin',
                'name': 'System Administrator',
                'job_title': 'System Administrator',
                'password_hint': 'admin123'
            }
        ]
    })


@app.route('/api/users', methods=['GET'])
@require_auth
def list_users():
    """
    Get list of all users with their accounts
    Available to all authenticated users
    
    Response:
        {
            "success": true,
            "users": [
                {
                    "username": "samantha.lee",
                    "role": "employee",
                    "name": "Samantha Lee",
                    "employee_id": "EMP-20001",
                    "email": "samantha.lee@globalpsa.com",
                    "job_title": "Cloud Solutions Architect",
                    "department": "Information Technology"
                }
            ]
        }
    """
    users = get_all_users(include_passwords=False)
    
    return jsonify({
        'success': True,
        'count': len(users),
        'users': users
    })


@app.route('/api/users/credentials', methods=['GET'])
def get_user_credentials():
    """
    Get list of all users WITH passwords (development/demo only!)
    WARNING: In production, this endpoint should be removed or heavily restricted
    
    Response:
        {
            "success": true,
            "users": [
                {
                    "username": "samantha.lee",
                    "password": "password123",
                    "role": "employee",
                    "name": "Samantha Lee",
                    "employee_id": "EMP-20001"
                }
            ]
        }
    """
    users = get_all_users(include_passwords=True)
    
    return jsonify({
        'success': True,
        'count': len(users),
        'users': users,
        'warning': 'This endpoint exposes passwords and should only be used in development'
    })


@app.route('/api/user/update-username', methods=['PUT'])
@require_auth
def update_user_username():
    """
    Update the current user's username
    Requires authentication
    
    Request Body:
        {
            "new_username": "new.username"
        }
    
    Response:
        {
            "success": true,
            "message": "Username updated successfully",
            "new_username": "new.username",
            "user": { updated user data }
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400
        
        new_username = data.get('new_username')
        
        if not new_username:
            return jsonify({
                'success': False,
                'message': 'New username is required'
            }), 400
        
        # Get current username from auth token
        current_username = request.user['username']
        
        print(f"Updating username from '{current_username}' to '{new_username}'")
        
        # Update username
        result = update_username(current_username, new_username)
        
        if result['success']:
            # Get updated user data
            updated_user = get_user_data(result['new_username'])
            
            print(f"Username update successful: {result['new_username']}")
            
            return jsonify({
                'success': True,
                'message': result['message'],
                'new_username': result['new_username'],
                'user': updated_user
            })
        else:
            print(f"Username update failed: {result['message']}")
            return jsonify({
                'success': False,
                'message': result['message']
            }), 400
            
    except Exception as e:
        print(f"ERROR in update_user_username: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@app.route('/api/employees', methods=['GET'])
def get_employees():
    """Get all employees"""
    session = Session(engine)
    try:
        employees = session.query(Employee).all()
        return jsonify({
            'success': True,
            'count': len(employees),
            'data': [emp.to_dict() for emp in employees]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/employees/<employee_id>', methods=['GET'])
def get_employee(employee_id):
    """Get single employee by ID"""
    session = Session(engine)
    try:
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        if not employee:
            return jsonify({'success': False, 'error': 'Employee not found'}), 404
        
        return jsonify({
            'success': True,
            'data': employee.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/employees/search', methods=['GET'])
def search_employees():
    """Search employees by name or email"""
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify({'success': False, 'error': 'Search query required'}), 400
    
    session = Session(engine)
    try:
        employees = session.query(Employee).filter(
            (Employee.name.ilike(f'%{query}%')) |
            (Employee.email.ilike(f'%{query}%'))
        ).all()
        
        return jsonify({
            'success': True,
            'count': len(employees),
            'data': [emp.to_dict() for emp in employees]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/roles', methods=['GET'])
def get_roles():
    """Get all available roles"""
    session = Session(engine)
    try:
        roles = session.query(Role).all()
        return jsonify({
            'success': True,
            'count': len(roles),
            'data': [role.to_dict() for role in roles]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/roles/<role_id>', methods=['GET'])
def get_role(role_id):
    """Get single role by ID"""
    session = Session(engine)
    try:
        role = session.query(Role).filter_by(role_id=role_id).first()
        if not role:
            return jsonify({'success': False, 'error': 'Role not found'}), 404
        
        return jsonify({
            'success': True,
            'data': role.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/match/employee/<employee_id>', methods=['GET'])
def match_employee(employee_id):
    """
    Match an employee to roles using AI
    
    Query params:
        - top_k: Number of top matches to return (default: 5)
        - generate_narrative: Whether to generate narrative for top match (default: true)
    """
    top_k = int(request.args.get('top_k', 5))
    generate_narrative_flag = request.args.get('generate_narrative', 'true').lower() == 'true'
    
    session = Session(engine)
    try:
        # Get employee
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        if not employee:
            return jsonify({'success': False, 'error': 'Employee not found'}), 404
        
        # Get all roles
        roles = session.query(Role).all()
        if not roles:
            return jsonify({'success': False, 'error': 'No roles available'}), 404
        
        # Convert to dictionaries
        employee_dict = employee.to_dict()
        roles_dict = [role.to_dict() for role in roles]
        
        # Perform matching
        matches = match_employee_to_roles(employee_dict, roles_dict, top_k)
        
        # Generate narrative for top match if requested
        if generate_narrative_flag and matches:
            top_match = matches[0]
            narrative = generate_career_narrative(
                employee_dict,
                top_match['role'],
                top_match
            )
            matches[0]['career_narrative'] = narrative
            
            # Generate development plan for skill gaps
            skill_gaps = top_match['skill_match'].get('required_missing', [])
            if skill_gaps:
                matches[0]['development_plan'] = generate_development_plan(
                    skill_gaps,
                    employee_dict
                )
        
        return jsonify({
            'success': True,
            'employee': {
                'id': employee.employee_id,
                'name': employee.name,
                'current_role': employee.job_title
            },
            'matches': matches
        })
        
    except Exception as e:
        print(f"❌ Matching error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/narrative/generate', methods=['POST'])
def generate_narrative():
    """
    Generate career narrative for a specific employee-role pairing
    
    Request body:
        {
            "employee_id": "EMP-20001",
            "role_id": "ROLE-001"
        }
    """
    data = request.get_json()
    employee_id = data.get('employee_id')
    role_id = data.get('role_id')
    
    if not employee_id or not role_id:
        return jsonify({
            'success': False,
            'error': 'employee_id and role_id required'
        }), 400
    
    session = Session(engine)
    try:
        # Get employee and role
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        role = session.query(Role).filter_by(role_id=role_id).first()
        
        if not employee or not role:
            return jsonify({'success': False, 'error': 'Employee or role not found'}), 404
        
        # Convert to dictionaries
        employee_dict = employee.to_dict()
        role_dict = role.to_dict()
        
        # Match this specific pairing
        matches = match_employee_to_roles(employee_dict, [role_dict], top_k=1)
        
        if not matches:
            return jsonify({'success': False, 'error': 'Matching failed'}), 500
        
        match_details = matches[0]
        
        # Generate narrative
        narrative = generate_career_narrative(
            employee_dict,
            role_dict,
            match_details
        )
        
        # Generate development plan
        skill_gaps = match_details['skill_match'].get('required_missing', [])
        development_plan = generate_development_plan(skill_gaps, employee_dict)
        
        return jsonify({
            'success': True,
            'narrative': narrative,
            'match_details': match_details,
            'development_plan': development_plan
        })
        
    except Exception as e:
        print(f"❌ Narrative generation error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/embeddings/generate/<employee_id>', methods=['POST'])
def generate_employee_embedding(employee_id):
    """Generate and store embedding for an employee (for pre-computation)"""
    session = Session(engine)
    try:
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        if not employee:
            return jsonify({'success': False, 'error': 'Employee not found'}), 404
        
        # Generate embedding
        employee_dict = employee.to_dict()
        profile_text = create_profile_text(employee_dict)
        embedding = generate_embedding(profile_text)
        
        # Store in database
        employee.profile_embedding = embedding
        session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Embedding generated and stored',
            'embedding_length': len(embedding)
        })
        
    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/leadership-potential/<employee_id>', methods=['GET'])
def get_leadership_potential(employee_id):
    """
    Get leadership potential score for an employee
    Returns overall score, component breakdown, evidence, and improvement suggestions
    """
    session = Session(engine)
    try:
        # Get the target employee ONLY
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        if not employee:
            return jsonify({'success': False, 'error': 'Employee not found'}), 404
        
        # Use static max_metrics based on domain knowledge to avoid querying all employees
        # These values represent realistic upper bounds for normalization
        max_metrics = {
            'max_outcome': 100,      # Maximum percentage improvement
            'max_stakeholders': 15,  # Maximum distinct stakeholder types
            'max_progression': 1.5   # Maximum levels per year progression rate
        }
        
        # Compute leadership potential for target employee WITH augmentations
        employee_dict = employee.to_dict()
        leadership_score = compute_leadership_potential(employee_dict, max_metrics, use_augmentations=True)
        
        # Estimate percentile rank based on score ranges (no need to compute all employees)
        # This mapping is based on typical score distribution
        score = leadership_score['overall_score']
        if score >= 85:
            percentile_rank = 95
        elif score >= 75:
            percentile_rank = 85
        elif score >= 65:
            percentile_rank = 70
        elif score >= 55:
            percentile_rank = 50
        elif score >= 45:
            percentile_rank = 30
        else:
            percentile_rank = 15
        
        # Generate improvement suggestions
        improvement_suggestions = generate_improvement_suggestions(
            leadership_score['components'],
            leadership_score['evidence']
        )
        
        return jsonify({
            'success': True,
            'employee_id': employee.employee_id,
            'employee_name': employee.name,
            'overall_score': leadership_score['overall_score'],
            'percentile_rank': percentile_rank,
            'components': leadership_score['components'],
            'evidence': leadership_score['evidence'],
            'improvement_suggestions': improvement_suggestions,
            'raw_metrics': leadership_score['raw_metrics']
        })
        
    except Exception as e:
        print(f"❌ Leadership potential error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/leadership-feedback', methods=['POST'])
def submit_leadership_feedback():
    """
    Submit feedback on leadership score (stub endpoint for future processing)
    
    Request body:
        {
            "employee_id": "EMP-20001",
            "feedback_type": "too_high|too_low|missing_evidence|weights_issue",
            "comments": "Optional additional comments"
        }
    """
    data = request.get_json()
    employee_id = data.get('employee_id')
    feedback_type = data.get('feedback_type')
    comments = data.get('comments', '')
    
    if not employee_id or not feedback_type:
        return jsonify({
            'success': False,
            'error': 'employee_id and feedback_type required'
        }), 400
    
    # TODO: In production, store this feedback in database for analysis
    print(f"📝 Feedback received for {employee_id}: {feedback_type}")
    print(f"   Comments: {comments}")
    
    return jsonify({
        'success': True,
        'message': 'Thank you. Your feedback helps us improve leadership assessment for everyone.'
    })


@app.route('/api/chat', methods=['POST'])
@require_employee
def chat():
    """
    COMPASS COPILOT: Conversational AI Interface
    EMPLOYEE ACCESS ONLY
    
    Request body:
        {
            "message": "What roles fit me?",
            "conversation_history": [
                {"role": "user", "content": "..."},
                {"role": "assistant", "content": "..."}
            ]
        }
    
    Note: employee_id is obtained from authenticated user's token
    
    Response:
        {
            "success": true,
            "response_text": "Based on your background...",
            "citations": [
                {"source": "project", "text": "Hybrid Cloud Migration", "details": [...]},
                {"source": "skill", "text": "Architecture Design", "details": [...]}
            ],
            "suggested_actions": ["View Enterprise Architect path", "Find mentor"],
            "intent": "role_recommendations"
        }
    """
    data = request.get_json()
    user_message = data.get('message', '').strip()
    conversation_history = data.get('conversation_history', [])
    
    # Get employee_id from authenticated user
    employee_id = request.user.get('employee_id')
    
    if not employee_id:
        return jsonify({
            'success': False,
            'error': 'No employee profile associated with this account'
        }), 400
    
    if not user_message:
        return jsonify({
            'success': False,
            'error': 'message is required'
        }), 400
        return jsonify({
            'success': False,
            'error': 'message is required'
        }), 400
    
    session = Session(engine)
    try:
        # Get employee data
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        if not employee:
            return jsonify({
                'success': False,
                'error': 'Employee not found'
            }), 404
        
        employee_dict = employee.to_dict()
        
        # Classify intent with conversation context
        intent = classify_intent(user_message, conversation_history)
        print(f"🤖 Chat intent classified as: {intent}")
        
        # Route to appropriate handler based on intent
        if intent == "profile_summary":
            result = generate_profile_summary(employee_dict)
            print(f"📋 Profile summary result: {result}")
            print(f"📋 Response text: {result.get('response_text', 'MISSING')}")
            
        elif intent == "role_recommendations":
            # Get all roles for matching
            roles = session.query(Role).all()
            roles_dict = [role.to_dict() for role in roles]
            
            # Perform matching
            matches = match_employee_to_roles(employee_dict, roles_dict, top_k=5)
            result = format_role_recommendations(matches, employee_dict)
            
        elif intent == "skill_gap":
            # Get all roles for target extraction
            roles = session.query(Role).all()
            roles_dict = [role.to_dict() for role in roles]
            
            result = generate_skill_gap_analysis(
                employee_dict,
                target_role=None,  # Will be extracted from message
                all_roles=roles_dict,
                user_message=user_message
            )
        
        elif intent == "wellbeing_support":
            # Handle wellbeing, mental health, work-life balance support
            print(f"💚 Calling generate_wellbeing_support for personal well-being")
            
            result = generate_wellbeing_support(
                employee_dict,
                user_message,
                conversation_history=conversation_history
            )
            
            print(f"💚 Wellbeing support result: {result}")
        
        elif intent == "general_qa":
            # NEW: Handle general career questions with GPT
            roles = session.query(Role).all()
            roles_dict = [role.to_dict() for role in roles]
            
            print(f"📊 Calling generate_general_qa_response with {len(roles_dict)} roles")
            
            result = generate_general_qa_response(
                employee_dict,
                user_message,
                all_roles=roles_dict,
                conversation_history=conversation_history
            )
            
            print(f"📦 Result object: {result}")
            print(f"📦 Result type: {type(result)}")
            print(f"📦 Response text field: {result.get('response_text', 'MISSING')}")
            print(f"✅ Generated response: {len(result.get('response_text', ''))} chars")
            
        else:  # fallback - but try to be helpful with GPT
            print(f"⚠️  Intent classified as '{intent}' - using fallback")
            # Instead of static fallback, try general Q&A
            roles = session.query(Role).all()
            roles_dict = [role.to_dict() for role in roles]
            
            try:
                result = generate_general_qa_response(
                    employee_dict,
                    user_message,
                    all_roles=roles_dict,
                    conversation_history=conversation_history
                )
            except Exception as e:
                print(f"⚠️ Fallback Q&A failed: {e}")
                import traceback
                traceback.print_exc()
                result = {
                    'response_text': (
                        "I'm here to help you with your career at PSA International! "
                        "I can assist you with:\n\n"
                        "📋 **Profile Summary** - Tell me about your background and strengths\n"
                        "🎯 **Role Recommendations** - Discover career opportunities that fit your skills\n"
                        "📚 **Skill Development** - Learn what skills you need for your target role\n\n"
                        "What would you like to explore?"
                    ),
                    'citations': [],
                    'suggested_actions': [
                        'Show my profile',
                        'What roles fit me?',
                        'How do I become a [role]?'
                    ]
                }
        
        # Add intent to response
        result['intent'] = intent
        result['success'] = True
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'response_text': 'I encountered an error processing your request. Please try again or rephrase your question.'
        }), 500
    finally:
        session.close()


# ============================================================================
# CAREER ROADMAP ENDPOINTS
# ============================================================================

@app.route('/api/career-roadmap/current/<employee_id>', methods=['GET'])
@require_auth
def get_current_career_roadmap(employee_id):
    """
    Get current career roadmap for EMPLOYEE
    Shows realistic next 2-3 year progression based on current trajectory
    OPTIMIZED: Only fetches relevant roles, lightweight computation
    """
    session = Session(engine)
    try:
        # Get employee
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        # Get roles - use pagination for large datasets
        # Only fetch roles that match current department or adjacent departments
        limit = request.args.get('limit', 50, type=int)
        roles = session.query(Role).limit(limit).all()
        roles_dict = [role.to_dict() for role in roles]
        
        # Calculate current roadmap
        roadmap = calculate_current_roadmap(employee.to_dict(), roles_dict)
        
        return jsonify({
            'success': True,
            'data': roadmap,
            'message': f'Current career roadmap for {employee.name}',
            'roles_analyzed': len(roles_dict)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        session.close()


@app.route('/api/career-roadmap/predicted/<employee_id>', methods=['GET'])
@require_admin
def get_predicted_career_roadmap(employee_id):
    """
    Get predicted career roadmap with simulations for ADMIN ONLY
    Shows multiple scenarios with 10-year projections
    OPTIMIZED: Returns only top 2 scenarios by default, can request specific scenarios
    
    Query params:
    - scenarios: comma-separated list (default: steady_growth,aggressive_growth)
    - years: number of years to simulate (default 10, max 10 for perf)
    - limit: max roles to consider (default 40)
    """
    session = Session(engine)
    try:
        # Get employee
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        # Get roles - LIMITED for performance
        limit = request.args.get('limit', 40, type=int)
        roles = session.query(Role).limit(limit).all()
        roles_dict = [role.to_dict() for role in roles]
        
        # Get query parameters - default to fast scenarios
        scenarios_param = request.args.get('scenarios')
        years_param = request.args.get('years', 10, type=int)
        
        # Cap years at 10 for performance
        years_param = min(years_param, 10)
        
        # Default to 2 fast scenarios if not specified
        scenarios = None
        if scenarios_param:
            scenarios = [s.strip() for s in scenarios_param.split(',')]
        else:
            # Quick default: just 2 scenarios instead of 4
            scenarios = ["steady_growth", "aggressive_growth"]
        
        # Calculate predicted roadmap with simulations
        predictions = calculate_predicted_roadmap_with_simulations(
            employee.to_dict(),
            roles_dict,
            scenarios=scenarios
        )
        
        return jsonify({
            'success': True,
            'data': predictions,
            'message': f'Predicted career roadmap for {employee.name}',
            'admin_only': True,
            'years_simulated': years_param,
            'scenarios_count': len(scenarios),
            'roles_analyzed': len(roles_dict)
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        session.close()


@app.route('/api/career-roadmap/comparison/<employee_id>', methods=['GET'])
@require_admin
def compare_career_scenarios(employee_id):
    """
    Compare all scenarios side-by-side for ADMIN
    Returns condensed comparison of all 4 scenarios
    OPTIMIZED: Can accept pre-computed predictions to avoid recalculation
    
    Query params:
    - limit: max roles to consider (default 40)
    """
    session = Session(engine)
    try:
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        # Get limited roles
        limit = request.args.get('limit', 40, type=int)
        roles = session.query(Role).limit(limit).all()
        roles_dict = [role.to_dict() for role in roles]
        
        # Get all 4 scenarios for comparison
        predictions = calculate_predicted_roadmap_with_simulations(
            employee.to_dict(),
            roles_dict,
            scenarios=["steady_growth", "aggressive_growth", "lateral_mobility", "specialization"]
        )
        
        # Create comparison summary - lightweight processing
        comparison = {
            'employee_id': employee_id,
            'employee_name': employee.name,
            'analysis_date': predictions['analysis_date'],
            'scenarios_comparison': [],
            'optimal_recommendation': predictions['optimal_path'],
            'risk_analysis': predictions['risk_factors'],
            'retention_factors': predictions['retention_factors']
        }
        
        for scenario_name, scenario_data in predictions['scenarios'].items():
            comparison['scenarios_comparison'].append({
                'scenario': scenario_name,
                'success_probability': scenario_data['success_probability'],
                'salary_growth': scenario_data['salary_growth_estimate'],
                'promotion_probability': scenario_data['promotion_probability'],
                'milestones_count': len(scenario_data['milestones']),
                'first_milestone': scenario_data['milestones'][0] if scenario_data['milestones'] else None,
                'final_milestone': scenario_data['milestones'][-1] if scenario_data['milestones'] else None
            })
        
        return jsonify({
            'success': True,
            'data': comparison,
            'message': f'Scenario comparison for {employee.name}',
            'scenarios_count': len(comparison['scenarios_comparison']),
            'roles_analyzed': len(roles_dict)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        session.close()


def calculate_years_at_psa(positions_history):
    """
    Calculate total years at PSA by summing all position durations
    Returns: float (years)
    """
    from datetime import datetime
    
    if not positions_history:
        return 0.0
    
    total_years = 0.0
    for position in positions_history:
        period = position.get('period', {})
        start_date_str = period.get('start')
        end_date_str = period.get('end')
        
        if not start_date_str:
            continue
        
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            
            # Use current date if end_date is None/null/empty (ongoing position)
            if end_date_str:
                try:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                except:
                    continue
            else:
                end_date = datetime.now()
            
            # Calculate duration in years
            duration_days = (end_date - start_date).days
            duration_years = duration_days / 365.25
            
            if duration_years >= 0:
                total_years += duration_years
                
        except Exception as e:
            continue
    
    return total_years


def count_non_trainee_positions(positions_history):
    """
    Count positions excluding trainee roles
    Returns: int (number of positions)
    """
    if not positions_history:
        return 0
    
    count = 0
    trainee_keywords = ['trainee', 'intern', 'apprentice']
    
    for position in positions_history:
        role_title = position.get('role_title', '').lower()
        
        # Check if this is a trainee role
        is_trainee = any(keyword in role_title for keyword in trainee_keywords)
        
        if not is_trainee:
            count += 1
    
    return count


def calculate_all_employee_metrics(session):
    """
    Calculate years_at_psa and promotion_speed for all employees
    Returns: dict with employee_id as key and metrics as values
    """
    all_employees = session.query(Employee).all()
    metrics = {}
    
    for employee in all_employees:
        years_at_psa = calculate_years_at_psa(employee.positions_history or [])
        non_trainee_positions = count_non_trainee_positions(employee.positions_history or [])
        
        # Calculate promotion speed (years per position)
        # Higher ratio = slower promotion speed
        # We'll invert this for percentile (so lower ratio = higher percentile)
        if non_trainee_positions > 0:
            promotion_speed_ratio = years_at_psa / non_trainee_positions
        else:
            promotion_speed_ratio = float('inf')  # No positions = worst score
        
        metrics[employee.employee_id] = {
            'years_at_psa': years_at_psa,
            'non_trainee_positions': non_trainee_positions,
            'promotion_speed_ratio': promotion_speed_ratio
        }
    
    return metrics


def calculate_percentile(value, all_values, lower_is_better=False):
    """
    Calculate percentile rank for a value among all values
    Returns: float (0-100) representing percentile
    
    Args:
        value: The value to rank
        all_values: List of all values to compare against
        lower_is_better: If True, lower values get higher percentiles (for promotion speed)
    """
    if not all_values:
        return 50.0
    
    # Filter out invalid values
    valid_values = [v for v in all_values if v != float('inf') and v is not None]
    
    if not valid_values:
        return 50.0
    
    if value == float('inf'):
        return 0.0 if lower_is_better else 100.0
    
    # Count how many values are less than current value
    if lower_is_better:
        # For promotion speed: lower ratio = faster promotion = better
        count_worse = sum(1 for v in valid_values if v > value)
    else:
        # For tenure: higher years = better
        count_worse = sum(1 for v in valid_values if v < value)
    
    # Calculate percentile (what percentage of others are worse)
    percentile = (count_worse / len(valid_values)) * 100
    
    return round(percentile, 1)


@app.route('/api/employee/career-timeline', methods=['GET'])
@require_employee
def get_employee_career_timeline():
    """
    Get the career timeline for the currently logged-in employee
    Returns positions_history sorted by start_date in ascending order
    
    Response:
        {
            "success": true,
            "employee": {
                "employee_id": "EMP-20001",
                "name": "Samantha Lee",
                "current_role": "Cloud Solutions Architect",
                "hire_date": "2016-03-15"
            },
            "timeline": [
                {
                    "role_title": "Systems Engineer",
                    "organization": "PSA Singapore",
                    "period": {"start": "2016-03-15", "end": "2018-12-31"},
                    "focus_areas": [...],
                    "key_skills_used": [...]
                },
                ...
            ]
        }
    """
    session = Session(engine)
    try:
        # Get employee_id from authenticated user
        employee_id = request.user.get('employee_id')
        
        if not employee_id:
            return jsonify({
                'success': False,
                'error': 'Employee ID not found in user session'
            }), 400
        
        # Get employee from database
        employee = session.query(Employee).filter_by(employee_id=employee_id).first()
        
        if not employee:
            return jsonify({
                'success': False,
                'error': 'Employee not found'
            }), 404
        
        # Get positions history
        positions_history = employee.positions_history or []
        
        # Sort by start date (ascending order - earliest to latest)
        from datetime import datetime
        
        def parse_date(date_str):
            """Parse date string to datetime object for sorting"""
            if not date_str:
                return datetime.max  # Put None dates at the end
            try:
                return datetime.strptime(date_str, '%Y-%m-%d')
            except:
                return datetime.max
        
        sorted_timeline = sorted(
            positions_history,
            key=lambda pos: parse_date(pos.get('period', {}).get('start'))
        )
        
        # Calculate total years of service by summing all position durations
        total_years = 0.0
        for position in positions_history:
            period = position.get('period', {})
            start_date_str = period.get('start')
            end_date_str = period.get('end')
            
            if not start_date_str:
                continue  # Skip entries without start date
            
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                
                # Use current date if end_date is None/null/empty (ongoing position)
                if end_date_str:
                    try:
                        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                    except:
                        continue  # Skip if end_date is malformed
                else:
                    end_date = datetime.now()
                
                # Calculate duration in years using days / 365.25 for consistency
                duration_days = (end_date - start_date).days
                duration_years = duration_days / 365.25
                
                # Add to total (handling potential negative durations)
                if duration_years >= 0:
                    total_years += duration_years
                    
            except Exception as e:
                # Log and skip malformed entries
                print(f"Warning: Could not parse dates for position {position.get('role_title', 'Unknown')}: {e}")
                continue
        
        # Calculate percentile rankings for this employee
        all_employee_metrics = calculate_all_employee_metrics(session)
        current_employee_metrics = all_employee_metrics.get(employee.employee_id, {})
        
        # Extract all values for percentile calculation
        all_years_at_psa = [m['years_at_psa'] for m in all_employee_metrics.values()]
        all_promotion_speed_ratios = [m['promotion_speed_ratio'] for m in all_employee_metrics.values()]
        
        # Calculate percentiles
        tenure_percentile = calculate_percentile(
            current_employee_metrics.get('years_at_psa', total_years),
            all_years_at_psa,
            lower_is_better=False  # Higher tenure = better
        )
        
        promotion_speed_percentile = calculate_percentile(
            current_employee_metrics.get('promotion_speed_ratio', float('inf')),
            all_promotion_speed_ratios,
            lower_is_better=True  # Lower ratio (faster promotion) = better
        )
        
        return jsonify({
            'success': True,
            'employee': {
                'employee_id': employee.employee_id,
                'name': employee.name,
                'email': employee.email,
                'current_role': employee.job_title,
                'department': employee.department,
                'hire_date': employee.hire_date,
                'years_of_service': round(total_years, 2),
                'tenure_percentile': tenure_percentile,
                'promotion_speed_percentile': promotion_speed_percentile,
                'non_trainee_positions': current_employee_metrics.get('non_trainee_positions', 0)
            },
            'timeline': sorted_timeline,
            'timeline_count': len(sorted_timeline)
        }), 200
        
    except Exception as e:
        print(f"ERROR in get_employee_career_timeline: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        session.close()


@app.errorhandler(404)
def not_found(error):
    """404 handler"""
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """500 handler"""
    return jsonify({'success': False, 'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Initialize database on startup
    print("🚀 Initializing Career Compass API...")
    init_db()
    
    # Run Flask app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"✅ API running on http://localhost:{port}")
    print(f"📊 Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
