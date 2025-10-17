import React from 'react';
import { User, Mail, MapPin, Briefcase, Calendar, Award, BookOpen } from 'lucide-react';

const EmployeeProfile = ({ employee }) => {
  if (!employee) return null;

  const { personal_info, employment_info, skills, competencies, experiences, education } = employee;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-psa-blue to-psa-lightblue p-6 text-white">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-psa-blue" />
        </div>
        <h2 className="text-2xl font-bold mb-1">{personal_info.name}</h2>
        <p className="text-blue-100 text-sm">{employee.employee_id}</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
            <span className="text-gray-600 break-all">{personal_info.email}</span>
          </div>
          <div className="flex items-start space-x-3 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <span className="text-gray-600">{personal_info.office_location}</span>
          </div>
        </div>

        <hr />

        {/* Employment Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-psa-blue" />
            Current Role
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">{employment_info.job_title}</span>
            </div>
            <div className="text-gray-600">{employment_info.department}</div>
            <div className="text-gray-600">{employment_info.unit}</div>
            {employment_info.in_role_since && (
              <div className="flex items-center text-gray-500 text-xs mt-2">
                <Calendar className="w-3 h-3 mr-1" />
                In role since {new Date(employment_info.in_role_since).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <hr />

        {/* Top Skills */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2 text-psa-blue" />
            Key Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills && skills.slice(0, 6).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-psa-blue text-xs rounded-md"
              >
                {skill.skill_name}
              </span>
            ))}
            {skills && skills.length > 6 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Competencies */}
        {competencies && competencies.length > 0 && (
          <>
            <hr />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Competencies</h3>
              <div className="space-y-2">
                {competencies.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{comp.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        comp.level === 'Advanced'
                          ? 'bg-green-100 text-green-800'
                          : comp.level === 'Intermediate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
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

        {/* Education */}
        {education && education.length > 0 && (
          <>
            <hr />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-psa-blue" />
                Education
              </h3>
              <div className="space-y-2 text-sm">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-gray-700">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-gray-500 text-xs">{edu.institution}</div>
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
