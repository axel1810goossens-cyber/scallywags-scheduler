import { useState } from 'react';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { useEmployees } from '../../hooks/useEmployees';
import EmployeeCard from './EmployeeCard';
import EmployeeForm from './EmployeeForm';
import './EmployeeList.scss';

const EmployeeList = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState('All');

    const { employees, loading, loadSampleData } = useEmployees();

    const handleLoadSampleData = async () => {
        if (window.confirm('This will load sample employee data. Continue?')) {
            await loadSampleData();
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = positionFilter === 'All' || emp.position === positionFilter;

        return matchesSearch && matchesPosition;
    });

    const positions = ['All', ...new Set(employees.map(e => e.position))];

    if (loading) {
        return (
            <div className="employee-list-loading">
                <div className="spinner"></div>
                <p>Loading employees...</p>
            </div>
        );
    }

    return (
        <div className="employee-list-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Employees</h1>
                    <p>Manage your staff and their availability</p>
                </div>
                <button onClick={() => setShowAddForm(true)} className="add-button">
                    <FiPlus /> Add Employee
                </button>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
                    <FiFilter />
                    <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                    >
                        {positions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredEmployees.length === 0 ? (
                <div className="empty-state">
                    <p>No employees found matching your criteria</p>
                    {employees.length === 0 && (
                        <div className="empty-actions">
                            <button onClick={() => setShowAddForm(true)} className="empty-state-button">
                                <FiPlus /> Add Your First Employee
                            </button>
                            <button
                                onClick={handleLoadSampleData}
                                className="empty-state-button secondary"
                                style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                            >
                                Load Sample Data
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="employees-grid">
                    {filteredEmployees.map(employee => (
                        <EmployeeCard key={employee.id} employee={employee} />
                    ))}
                </div>
            )}

            {showAddForm && (
                <EmployeeForm
                    onClose={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
};

export default EmployeeList;
