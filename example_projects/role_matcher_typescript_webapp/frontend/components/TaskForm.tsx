'use client';

import { useState, useEffect } from 'react';
import { Task, TaskFormData, TaskStatus } from '@/types/task';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: null,
    effort: 5,
    importance: 5,
    category: 'work',
    status: 'pending',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        effort: task.effort,
        importance: task.importance,
        category: task.category,
        status: task.status,
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'effort' || name === 'importance' ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} data-testid="task-form" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
        {task ? 'Edit Task' : 'Create New Task'}
      </h2>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          data-testid="task-title-input"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          data-testid="task-description-input"
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            data-testid="task-category-input"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="urgent">Urgent</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            data-testid="task-status-input"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="dueDate" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
          Due Date
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate || ''}
          onChange={handleChange}
          data-testid="task-duedate-input"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label htmlFor="effort" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Effort: {formData.effort}/10
          </label>
          <input
            id="effort"
            name="effort"
            type="range"
            min="1"
            max="10"
            value={formData.effort}
            onChange={handleChange}
            data-testid="task-effort-input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="importance" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Importance: {formData.importance}/10
          </label>
          <input
            id="importance"
            name="importance"
            type="range"
            min="1"
            max="10"
            value={formData.importance}
            onChange={handleChange}
            data-testid="task-importance-input"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          data-testid="task-cancel-btn"
          style={{
            padding: '8px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          data-testid="task-submit-btn"
          style={{
            padding: '8px 20px',
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
