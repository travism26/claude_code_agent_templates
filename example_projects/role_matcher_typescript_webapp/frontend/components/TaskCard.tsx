'use client';

import { Task } from '@/types/task';
import { RecommendationsPanel } from './RecommendationsPanel';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const priorityColor = (priority: number) => {
    if (priority >= 7) return '#ef4444'; // red
    if (priority >= 4) return '#f59e0b'; // orange
    return '#22c55e'; // green
  };

  const statusDisplay = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div
      data-testid={`task-card-${task.id}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
            {task.title}
          </h3>
          <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
            {task.description}
          </p>
        </div>
        <div
          style={{
            backgroundColor: priorityColor(task.priority),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            marginLeft: '12px',
          }}
          data-testid={`task-priority-${task.id}`}
        >
          {task.priority.toFixed(1)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px', fontSize: '14px' }}>
        <div>
          <strong>Status:</strong> <span data-testid={`task-status-${task.id}`}>{statusDisplay[task.status]}</span>
        </div>
        <div>
          <strong>Category:</strong> {task.category}
        </div>
        <div style={{ color: isOverdue ? '#ef4444' : 'inherit' }}>
          <strong>Due Date:</strong> {formatDate(task.dueDate)}
          {isOverdue && <span style={{ marginLeft: '4px' }}>(Overdue)</span>}
        </div>
        <div>
          <strong>Effort:</strong> {task.effort}/10
        </div>
        <div>
          <strong>Importance:</strong> {task.importance}/10
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
        <RecommendationsPanel taskId={task.id} taskTitle={task.title} />
        {onEdit && (
          <button
            data-testid={`task-edit-btn-${task.id}`}
            onClick={() => onEdit(task)}
            style={{
              padding: '6px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            data-testid={`task-delete-btn-${task.id}`}
            onClick={() => onDelete(task.id)}
            style={{
              padding: '6px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
