import React from 'react';
import { User, Mail, MapPin, Briefcase, Calendar, Award, BookOpen } from 'lucide-react';

const EmployeeProfile = ({ employee }) => {
  if (!employee) return null;

  const { personal_info, employment_info, skills, competencies, experiences, education } = employee;

  return (
    <div className="glass-card border border-white/55 overflow-hidden sticky top-4">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 px-6 py-8 text-white">
        <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/40">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-semibold mb-1">{personal_info.name}</h2>
        <p className="text-indigo-100 text-sm font-medium">{employee.employee_id}</p>
      </div>

      <div className="px-6 py-6 space-y-6 bg-white/70">
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Mail className="w-4 h-4 text-slate-400 mt-1" />
            <span className="text-slate-600 break-all">{personal_info.email}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 mt-1" />
            <span className="text-slate-600">{personal_info.office_location}</span>
          </div>
        </div>

        <div className="glass-divider" />

        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            Current Role
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">{employment_info.job_title}</p>
            <p>{employment_info.department}</p>
            <p>{employment_info.unit}</p>
            {employment_info.in_role_since && (
              <div className="flex items-center text-xs text-slate-400 pt-1">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                In role since {new Date(employment_info.in_role_since).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div className="glass-divider" />

        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            Key Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills && skills.slice(0, 6).map((skill, idx) => (
              <span
                key={idx}
                className="glass-chip px-2.5 py-1 text-xs font-medium text-indigo-600"
              >
                {skill.skill_name}
              </span>
            ))}
            {skills && skills.length > 6 && (
              <span className="glass-chip px-2.5 py-1 text-xs font-medium text-slate-500">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {competencies && competencies.length > 0 && (
          <>
            <div className="glass-divider" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Competencies</h3>
              <div className="space-y-2">
                {competencies.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm text-slate-600">
                    <span>{comp.name}</span>
                    <span
                      className={`glass-chip px-2 py-0.5 text-xs font-semibold ${
                        comp.level === 'Advanced'
                          ? 'text-emerald-600'
                          : comp.level === 'Intermediate'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {comp.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {education && education.length > 0 && (
          <>
            <div className="glass-divider" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Education
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-medium text-slate-800">{edu.degree}</p>
                    <p className="text-xs text-slate-400">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
