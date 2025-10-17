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
    
    for emp_data in employees_data:
        personal = emp_data.get('personal_info', {})
        employment = emp_data.get('employment_info', {})
        
        employee = Employee(
            employee_id=emp_data['employee_id'],
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
    
    session.commit()
    print(f"✅ Loaded {len(employees_data)} employees")


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
    
    for role_data in sample_roles:
        role = Role(**role_data)
        session.add(role)
        print(f"  ✅ Added {role_data['title']}")
    
    session.commit()
    print(f"✅ Loaded {len(sample_roles)} roles")


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
