'use client';

import { useState } from 'react';
import { Employee, EmployeeFormData } from '@/types/employee';
import { useGetEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeForm } from './EmployeeForm';

export function EmployeeList() {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [nameSearch, setNameSearch] = useState<string>('');

  const { data, isLoading, error } = useGetEmployees({
    role: roleFilter || undefined,
  });

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const handleCreateEmployee = async (formData: EmployeeFormData) => {
    try {
      await createEmployee.mutateAsync(formData);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleUpdateEmployee = async (formData: EmployeeFormData) => {
    if (!editingEmployee) return;
    try {
      await updateEmployee.mutateAsync({ id: editingEmployee.id, data: formData });
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  if (isLoading) {
    return <div data-testid="loading">Loading employees...</div>;
  }

  if (error) {
    return <div data-testid="error" style={{ color: '#ef4444' }}>Error loading employees: {error.message}</div>;
  }

  const employees = data?.employees || [];

  // Client-side filtering by name
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(nameSearch.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Employees</h1>
        {!showForm && !editingEmployee && (
          <button
            onClick={() => setShowForm(true)}
            data-testid="create-employee-btn"
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Create Employee
          </button>
        )}
      </div>

      {/* Form */}
      {(showForm || editingEmployee) && (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
          onCancel={handleCancel}
          isSubmitting={createEmployee.isPending || updateEmployee.isPending}
        />
      )}

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="nameSearch" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Search by Name
          </label>
          <input
            id="nameSearch"
            type="text"
            data-testid="name-search"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Search employees..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="roleFilter" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Filter by Role
          </label>
          <select
            id="roleFilter"
            data-testid="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          >
            <option value="">All Roles</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
            <option value="QA">QA</option>
          </select>
        </div>
      </div>

      {/* Employee List */}
      {filteredEmployees.length === 0 ? (
        <div data-testid="no-employees" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          {nameSearch || roleFilter ? 'No employees match your filters' : 'No employees yet. Create one to get started!'}
        </div>
      ) : (
        <div
          data-testid="employee-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onDelete={handleDeleteEmployee}
            />
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {data?.pagination && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          Showing {filteredEmployees.length} of {data.pagination.total} employees
        </div>
      )}
    </div>
  );
}
