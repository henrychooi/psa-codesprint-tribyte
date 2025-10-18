import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { careerCompassAPI } from '../services/api';

const EmployeeSearch = ({ onEmployeeSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all employees on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter employees based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.personal_info.name.toLowerCase().includes(query) ||
          emp.personal_info.email.toLowerCase().includes(query) ||
          emp.employment_info.job_title.toLowerCase().includes(query) ||
          emp.employment_info.department.toLowerCase().includes(query)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await careerCompassAPI.getEmployees();
      setEmployees(result.data || []);
      setFilteredEmployees(result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeClick = (employee) => {
    onEmployeeSelect(employee);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-psa-blue focus:border-transparent text-lg"
          placeholder="Search by name, email, job title, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 mx-auto text-psa-blue animate-spin mb-2" />
          <p className="text-gray-600">Loading employees...</p>
        </div>
      ) : (
        /* Employee List */
        <div className="space-y-3">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <button
                key={employee.employee_id}
                onClick={() => handleEmployeeClick(employee)}
                className="w-full bg-white hover:bg-blue-50 border border-gray-200 hover:border-psa-blue rounded-lg p-4 transition text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-psa-blue">
                      {employee.personal_info.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {employee.employment_info.job_title}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>📧 {employee.personal_info.email}</span>
                      <span>🏢 {employee.employment_info.department}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-psa-blue">
                      {employee.skills?.length || 0} Skills
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No employees found matching your search.' : 'No employees available.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;
