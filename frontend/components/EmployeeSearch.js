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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Input */}
      <div className="glass-panel border border-white/55 px-4 py-2.5 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full bg-transparent pl-11 pr-4 py-3 text-base text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0"
          placeholder="Search by name, email, job title, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-panel border border-rose-200/70 bg-rose-50/80 text-rose-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="glass-panel border border-white/55 text-center py-12">
          <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin mb-3" />
          <p className="text-slate-500">Loading employees…</p>
        </div>
      ) : (
        /* Employee List */
        <div className="space-y-3">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <button
                key={employee.employee_id}
                onClick={() => handleEmployeeClick(employee)}
                className="group w-full glass-panel border border-white/55 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 px-4 py-4 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600">
                      {employee.personal_info.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {employee.employment_info.job_title}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="glass-chip px-3 py-1 text-xs text-indigo-600">
                        📧 {employee.personal_info.email}
                      </span>
                      <span className="glass-chip px-3 py-1 text-xs text-slate-600">
                        🏢 {employee.employment_info.department}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="glass-chip px-3 py-1 text-xs font-semibold text-indigo-600">
                      {employee.skills?.length || 0} Skills
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="glass-panel border border-white/55 text-center py-12 text-slate-500">
              {searchQuery ? 'No employees found matching your search.' : 'No employees available.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSearch;
