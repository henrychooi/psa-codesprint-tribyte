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
    create_profile_text
)
from leadership_potential import (
    compute_leadership_potential,
    calculate_max_metrics,
    calculate_percentile_rank,
    generate_improvement_suggestions
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
