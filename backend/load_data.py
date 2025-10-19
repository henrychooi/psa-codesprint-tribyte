"""
Data loading script - Load employee profiles and sample roles into database
"""
import json
import os
from datetime import datetime
from sqlalchemy.orm import Session
from database import engine, init_db
from models import Employee, Role, Base


def parse_date(date_str):
    """Parse date string to date object"""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except:
        return None


def load_employees(session: Session, json_file: str = '../Employee_Profiles.json'):
    """Load employees from JSON file"""
    print(f"📂 Loading employees from {json_file}...")
    
    with open(json_file, 'r') as f:
        employees_data = json.load(f)
    
    added_count = 0
    updated_count = 0
    
    for emp_data in employees_data:
        personal = emp_data.get('personal_info', {})
        employment = emp_data.get('employment_info', {})
        emp_id = emp_data['employee_id']
        
        # Check if employee already exists
        existing_employee = session.query(Employee).filter_by(employee_id=emp_id).first()
        
        if existing_employee:
            # Update existing employee
            existing_employee.name = personal.get('name', '')
            existing_employee.email = personal.get('email', '')
            existing_employee.office_location = personal.get('office_location', '')
            existing_employee.languages = personal.get('languages', [])
            existing_employee.job_title = employment.get('job_title', '')
            existing_employee.department = employment.get('department', '')
            existing_employee.unit = employment.get('unit', '')
            existing_employee.line_manager = employment.get('line_manager', '')
            existing_employee.in_role_since = parse_date(employment.get('in_role_since'))
            existing_employee.hire_date = parse_date(employment.get('hire_date'))
            existing_employee.skills = emp_data.get('skills', [])
            existing_employee.competencies = emp_data.get('competencies', [])
            existing_employee.experiences = emp_data.get('experiences', [])
            existing_employee.positions_history = emp_data.get('positions_history', [])
            existing_employee.projects = emp_data.get('projects', [])
            existing_employee.education = emp_data.get('education', [])
            print(f"  🔄 Updated {personal.get('name', 'Unknown')}")
            updated_count += 1
        else:
            # Create new employee
            employee = Employee(
                employee_id=emp_id,
                name=personal.get('name', ''),
                email=personal.get('email', ''),
                office_location=personal.get('office_location', ''),
                languages=personal.get('languages', []),
                
                job_title=employment.get('job_title', ''),
                department=employment.get('department', ''),
                unit=employment.get('unit', ''),
                line_manager=employment.get('line_manager', ''),
                in_role_since=parse_date(employment.get('in_role_since')),
                hire_date=parse_date(employment.get('hire_date')),
                
                skills=emp_data.get('skills', []),
                competencies=emp_data.get('competencies', []),
                experiences=emp_data.get('experiences', []),
                positions_history=emp_data.get('positions_history', []),
                projects=emp_data.get('projects', []),
                education=emp_data.get('education', [])
            )
            
            session.add(employee)
            print(f"  ✅ Added {personal.get('name', 'Unknown')}")
            added_count += 1
    
    session.commit()
    print(f"✅ Loaded employees - Added: {added_count}, Updated: {updated_count}")


def infer_min_experience(title: str) -> int:
    """Basic heuristic to keep role seniority reasonable."""
    normalized = title.lower()
    if any(keyword in normalized for keyword in ['chief', 'director', 'principal']):
        return 8
    if any(keyword in normalized for keyword in ['senior', 'lead', 'head']):
        return 6
    if 'manager' in normalized or 'architect' in normalized:
        return 5
    if any(keyword in normalized for keyword in ['analyst', 'engineer', 'consultant', 'specialist']):
        return 3
    return 4


def choose_department(primary: str, fallback: str) -> str:
    """Return the most relevant department label."""
    return primary or fallback or 'PSA Singapore'


def merge_competency_levels(existing: str, incoming: str) -> str:
    """Keep the higher competency level when combining multiple employees."""
    order = {
        'beginner': 1,
        'basic': 1,
        'intermediate': 2,
        'proficient': 3,
        'advanced': 4,
        'expert': 5
    }
    existing_rank = order.get((existing or '').lower(), 0)
    incoming_rank = order.get((incoming or '').lower(), 0)
    return incoming if incoming_rank >= existing_rank else existing


def build_roles_from_employee_profiles(json_file: str, start_index: int):
    """Create role entries using actual job titles from employee profiles."""
    if not os.path.exists(json_file):
        print(f"  ⚠️ Employee data not found at {json_file}, skipping role generation.")
        return []
    
    with open(json_file, 'r') as f:
        employees_data = json.load(f)
    
    aggregated = {}
    for profile in employees_data:
        employment = profile.get('employment_info', {})
        job_title = (employment.get('job_title') or '').strip()
        if not job_title:
            continue
        
        role_bucket = aggregated.setdefault(job_title, {
            'department': employment.get('department', '').strip(),
            'unit': employment.get('unit', '').strip(),
            'skills': set(),
            'specializations': set(),
            'competencies': {}
        })
        
        for skill in profile.get('skills', []):
            skill_name = (skill.get('skill_name') or '').strip()
            specialization = (skill.get('specialization') or '').strip()
            if skill_name:
                role_bucket['skills'].add(skill_name)
            if specialization:
                role_bucket['specializations'].add(specialization)
        
        for competency in profile.get('competencies', []):
            name = (competency.get('name') or '').strip()
            level = (competency.get('level') or '').strip()
            if not name or not level:
                continue
            existing_level = role_bucket['competencies'].get(name)
            role_bucket['competencies'][name] = merge_competency_levels(existing_level, level)
    
    generated_roles = []
    for offset, job_title in enumerate(sorted(aggregated.keys())):
        bucket = aggregated[job_title]
        department = choose_department(bucket.get('department', ''), bucket.get('unit', ''))
        role_number = start_index + offset
        role_id = f"ROLE-{role_number:03d}"
        
        required_skills = sorted(bucket['skills'])
        preferred_skills = sorted(bucket['specializations'])
        competencies = [
            {'name': name, 'min_level': level}
            for name, level in sorted(bucket['competencies'].items())
        ]
        
        generated_roles.append({
            'role_id': role_id,
            'title': job_title,
            'department': department,
            'location': 'PSA Singapore',
            'required_skills': required_skills,
            'preferred_skills': preferred_skills,
            'required_competencies': competencies,
            'description': f"Serve as the {job_title} within {department}, delivering impact through deep functional expertise and collaboration.",
            'responsibilities': [
                f"Lead key initiatives as the {job_title} supporting {department}.",
                "Partner with stakeholders to drive measurable improvements.",
                "Uphold best practices and mentor peers within the function."
            ],
            'min_experience_years': infer_min_experience(job_title)
        })
    
    print(f"  ℹ️ Generated {len(generated_roles)} roles from employee profiles.")
    return generated_roles


def load_sample_roles(session: Session):
    """Load sample roles for demo"""
    print("📂 Loading sample roles...")
    
    sample_roles = [
        {
            'role_id': 'ROLE-001',
            'title': 'Senior Cloud Architect',
            'department': 'Information Technology',
            'location': 'PSA Singapore',
            'required_skills': [
                'Cloud Architecture',
                'Cloud DevOps & Automation',
                'Infrastructure Design, Analysis & Architecture',
                'Securing Cloud Infrastructure'
            ],
            'preferred_skills': [
                'Enterprise Architecture',
                'Network Architecture',
                'Middleware & Web Servers'
            ],
            'required_competencies': [
                {'name': 'Technology Management & Innovation', 'min_level': 'Advanced'},
                {'name': 'Stakeholder & Partnership Management', 'min_level': 'Intermediate'}
            ],
            'description': 'Lead cloud transformation initiatives and architect scalable, secure cloud solutions for enterprise operations.',
            'responsibilities': [
                'Design and implement hybrid cloud architectures',
                'Lead infrastructure-as-code initiatives',
                'Mentor junior architects and engineers',
                'Ensure security and compliance standards'
            ],
            'min_experience_years': 7
        },
        {
            'role_id': 'ROLE-002',
            'title': 'Cybersecurity Manager',
            'department': 'Information Technology',
            'location': 'PSA Singapore',
            'required_skills': [
                'Vulnerability Management',
                'Network Security Management',
                'Cybersecurity Threat Intelligence and Detection',
                'Cybersecurity Risk Management'
            ],
            'preferred_skills': [
                'Cybersecurity Forensics',
                'Security Operations Center (SOC) Management'
            ],
            'required_competencies': [
                {'name': 'IT Audit', 'min_level': 'Advanced'},
                {'name': 'Quality Standards', 'min_level': 'Advanced'},
                {'name': 'Stakeholder & Partnership Management', 'min_level': 'Advanced'}
            ],
            'description': 'Lead cybersecurity operations, manage security incidents, and drive security governance across the organization.',
            'responsibilities': [
                'Manage security operations center',
                'Develop incident response procedures',
                'Conduct risk assessments',
                'Lead security awareness programs'
            ],
            'min_experience_years': 6
        },
        {
            'role_id': 'ROLE-003',
            'title': 'Financial Planning Director',
            'department': 'Finance',
            'location': 'PSA Singapore',
            'required_skills': [
                'Financial Planning and Analysis',
                'Financial Modeling',
                'Cost Management and Budget',
                'Risk Management'
            ],
            'preferred_skills': [
                'Treasury',
                'Carbon Accounting and Management',
                'Terminal Reporting'
            ],
            'required_competencies': [
                {'name': 'Stakeholder & Partnership Management', 'min_level': 'Advanced'},
                {'name': 'Process Improvement & Optimisation and Problem Management', 'min_level': 'Advanced'},
                {'name': 'IT Strategy & Planning', 'min_level': 'Intermediate'}
            ],
            'description': 'Drive strategic financial planning, budgeting, and performance analysis across regional operations.',
            'responsibilities': [
                'Lead annual budgeting and forecasting cycles',
                'Develop financial models for strategic initiatives',
                'Present insights to executive leadership',
                'Mentor FP&A team members'
            ],
            'min_experience_years': 8
        },
        {
            'role_id': 'ROLE-004',
            'title': 'HR Business Partner (Senior)',
            'department': 'Human Resource',
            'location': 'PSA Singapore',
            'required_skills': [
                'Generalist / Business Partner',
                'Talent Management',
                'Staff Development and Engagement',
                'Leadership Development'
            ],
            'preferred_skills': [
                'Compensation',
                'HR Information Systems / Technology',
                'Employee Relations'
            ],
            'required_competencies': [
                {'name': 'Change & Transformation Management', 'min_level': 'Advanced'},
                {'name': 'Stakeholder & Partnership Management', 'min_level': 'Advanced'}
            ],
            'description': 'Partner with business leaders to drive people strategies, talent development, and organizational effectiveness.',
            'responsibilities': [
                'Advise leaders on talent and organizational matters',
                'Design and implement engagement initiatives',
                'Lead succession planning processes',
                'Drive culture transformation'
            ],
            'min_experience_years': 7
        },
        {
            'role_id': 'ROLE-005',
            'title': 'Treasury Manager',
            'department': 'Finance',
            'location': 'PSA Singapore',
            'required_skills': [
                'Treasury',
                'Risk Management',
                'Financial Modeling'
            ],
            'preferred_skills': [
                'Financial Planning and Analysis',
                'Claims and Insurance',
                'Cost Management and Budget'
            ],
            'required_competencies': [
                {'name': 'Vendor and Contract Management', 'min_level': 'Advanced'},
                {'name': 'Stakeholder & Partnership Management', 'min_level': 'Advanced'}
            ],
            'description': 'Manage cash flow, liquidity, and financial risk across the organization\'s operations.',
            'responsibilities': [
                'Oversee daily cash management operations',
                'Manage banking relationships',
                'Implement FX hedging strategies',
                'Ensure compliance with treasury policies'
            ],
            'min_experience_years': 5
        }
    ]
    
    employee_roles = build_roles_from_employee_profiles('../Employee_Profiles.json', len(sample_roles) + 1)
    sample_roles.extend(employee_roles)
    
    added_count = 0
    updated_count = 0
    
    for role_data in sample_roles:
        role_id = role_data['role_id']
        
        # Check if role already exists
        existing_role = session.query(Role).filter_by(role_id=role_id).first()
        
        if existing_role:
            # Update existing role
            for key, value in role_data.items():
                setattr(existing_role, key, value)
            print(f"  🔄 Updated {role_data['title']}")
            updated_count += 1
        else:
            # Create new role
            role = Role(**role_data)
            session.add(role)
            print(f"  ✅ Added {role_data['title']}")
            added_count += 1
    
    session.commit()
    print(f"✅ Loaded roles - Added: {added_count}, Updated: {updated_count}")


def main():
    """Main loading function"""
    print("🚀 Starting data load...")
    
    # Initialize database
    init_db()
    
    # Create session
    from sqlalchemy.orm import Session
    session = Session(engine)
    
    try:
        # Load data
        load_employees(session)
        load_sample_roles(session)
        
        print("\n✅ Data loading complete!")
        print(f"   Employees: {session.query(Employee).count()}")
        print(f"   Roles: {session.query(Role).count()}")
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        session.rollback()
    finally:
        session.close()


if __name__ == '__main__':
    main()
