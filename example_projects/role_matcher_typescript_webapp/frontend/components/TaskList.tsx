'use client';

import { useState } from 'react';
import { Task, TaskFormData } from '@/types/task';
import { useGetTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

export function TaskList() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const { data, isLoading, error } = useGetTasks({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  });

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      await createTask.mutateAsync(formData);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask) return;
    try {
      await updateTask.mutateAsync({ id: editingTask.id, data: formData });
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return <div data-testid="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div data-testid="error" style={{ color: '#ef4444' }}>Error loading tasks: {error.message}</div>;
  }

  const tasks = data?.tasks || [];

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Tasks</h1>
        {!showForm && !editingTask && (
          <button
            onClick={() => setShowForm(true)}
            data-testid="create-task-btn"
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
            Create Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="statusFilter" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Filter by Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="status-filter"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="categoryFilter" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Filter by Category
          </label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            data-testid="category-filter"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="urgent">Urgent</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Task Form */}
      {(showForm || editingTask) && (
        <div style={{ marginBottom: '20px' }}>
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancel}
            isLoading={createTask.isPending || updateTask.isPending}
          />
        </div>
      )}

      {/* Task List */}
      <div data-testid="task-list">
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#6b7280' }}>No tasks found. Create your first task!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
