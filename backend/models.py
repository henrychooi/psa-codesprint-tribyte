"""
Database models for Career Compass
"""
from sqlalchemy import Column, Integer, String, Date, JSON, Float, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Employee(Base):
    """Employee profile model"""
    __tablename__ = 'employees'
    
    id = Column(Integer, primary_key=True)
    employee_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    office_location = Column(String(100))
    languages = Column(JSON)  # List of {language, proficiency}
    
    # Employment info
    job_title = Column(String(100), nullable=False)
    department = Column(String(100))
    unit = Column(String(100))
    line_manager = Column(String(100))
    in_role_since = Column(Date)
    hire_date = Column(Date)
    
    # Skills & Competencies (stored as JSON for flexibility)
    skills = Column(JSON)  # List of {function_area, specialization, skill_name}
    competencies = Column(JSON)  # List of {name, level}
    
    # Experience & History
    experiences = Column(JSON)  # List of programs, rotations, etc.
    positions_history = Column(JSON)
    projects = Column(JSON)
    education = Column(JSON)
    
    # Embeddings for AI matching
    profile_embedding = Column(JSON)  # Vector representation of entire profile
    skills_embedding = Column(JSON)  # Vector representation of skills only
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'employee_id': self.employee_id,
            'personal_info': {
                'name': self.name,
                'email': self.email,
                'office_location': self.office_location,
                'languages': self.languages
            },
            'employment_info': {
                'job_title': self.job_title,
                'department': self.department,
                'unit': self.unit,
                'line_manager': self.line_manager,
                'in_role_since': self.in_role_since.isoformat() if self.in_role_since else None,
                'hire_date': self.hire_date.isoformat() if self.hire_date else None
            },
            'skills': self.skills,
            'competencies': self.competencies,
            'experiences': self.experiences,
            'positions_history': self.positions_history,
            'projects': self.projects,
            'education': self.education
        }


class Role(Base):
    """Role/Job opening model"""
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True)
    role_id = Column(String(50), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    department = Column(String(100))
    location = Column(String(100))
    
    # Requirements
    required_skills = Column(JSON)  # List of skill names
    preferred_skills = Column(JSON)
    required_competencies = Column(JSON)  # List of {name, min_level}
    
    description = Column(Text)
    responsibilities = Column(JSON)  # List of strings
    min_experience_years = Column(Integer)
    
    # Embeddings
    role_embedding = Column(JSON)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'role_id': self.role_id,
            'title': self.title,
            'department': self.department,
            'location': self.location,
            'required_skills': self.required_skills,
            'preferred_skills': self.preferred_skills,
            'required_competencies': self.required_competencies,
            'description': self.description,
            'responsibilities': self.responsibilities,
            'min_experience_years': self.min_experience_years
        }


class CareerPath(Base):
    """Suggested career paths / transitions"""
    __tablename__ = 'career_paths'
    
    id = Column(Integer, primary_key=True)
    from_role = Column(String(100), nullable=False)
    to_role = Column(String(100), nullable=False)
    typical_timeline_months = Column(Integer)
    skill_gap_analysis = Column(JSON)  # Skills needed to bridge the gap
    common_transitions = Column(Integer, default=0)  # How many people made this move
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'from_role': self.from_role,
            'to_role': self.to_role,
            'typical_timeline_months': self.typical_timeline_months,
            'skill_gap_analysis': self.skill_gap_analysis,
            'common_transitions': self.common_transitions
        }
