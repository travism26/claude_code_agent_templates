'use client';

import { useState, useEffect } from 'react';
import { Employee, EmployeeFormData } from '@/types/employee';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EmployeeForm({ employee, onSubmit, onCancel, isSubmitting }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    role: '',
    capacity: 100,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        role: employee.role,
        capacity: employee.capacity,
      });
    }
  }, [employee]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (formData.capacity < 1 || formData.capacity > 200) {
      newErrors.capacity = 'Capacity must be between 1 and 200';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof EmployeeFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div
      data-testid="employee-form"
      style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600' }}>
        {employee ? 'Edit Employee' : 'Create Employee'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Name *
          </label>
          <input
            id="name"
            type="text"
            data-testid="employee-name-input"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            placeholder="Enter employee name"
          />
          {errors.name && (
            <div data-testid="name-error" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {errors.name}
            </div>
          )}
        </div>

        {/* Role Field */}
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Role *
          </label>
          <input
            id="role"
            type="text"
            data-testid="employee-role-input"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${errors.role ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            placeholder="e.g., Developer, Designer, Manager"
          />
          {errors.role && (
            <div data-testid="role-error" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {errors.role}
            </div>
          )}
        </div>

        {/* Capacity Field */}
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="capacity" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Capacity: {formData.capacity}
          </label>
          <input
            id="capacity"
            type="range"
            min="1"
            max="200"
            data-testid="employee-capacity-slider"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
            style={{
              width: '100%',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
            <span>1</span>
            <span>200</span>
          </div>
          {errors.capacity && (
            <div data-testid="capacity-error" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {errors.capacity}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button
            type="submit"
            data-testid="employee-submit-btn"
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {isSubmitting ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
          </button>
          <button
            type="button"
            data-testid="employee-cancel-btn"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
