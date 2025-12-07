import { useState, useEffect } from 'react';
import { employeeService } from '../services/employeeService';

export const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = employeeService.subscribeToEmployees((data) => {
            setEmployees(data);
            setLoading(false);
            setError(null);
        });

        return () => unsubscribe();
    }, []);

    const addEmployee = async (employeeData) => {
        const result = await employeeService.addEmployee(employeeData);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const updateEmployee = async (id, employeeData) => {
        const result = await employeeService.updateEmployee(id, employeeData);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const deleteEmployee = async (id) => {
        const result = await employeeService.deleteEmployee(id);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const loadSampleData = async () => {
        const result = employeeService.loadSampleData();
        if (result.success) {
            // Trigger a reload by fetching again or just letting the subscription handle it (if polling)
            // Since we are using polling in mock mode, it should pick it up.
            // But to be sure, we can manually set state if needed, but subscription is better.
        }
        return result;
    };

    return {
        employees,
        loading,
        error,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        loadSampleData
    };
};
