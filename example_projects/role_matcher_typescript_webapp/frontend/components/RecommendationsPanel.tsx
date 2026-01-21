'use client';

import { useState } from 'react';
import { useGetTaskRecommendations } from '@/hooks/useAssignments';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { RecommendationCard } from './RecommendationCard';

interface RecommendationsPanelProps {
  taskId: number;
  taskTitle: string;
}

export function RecommendationsPanel({ taskId, taskTitle }: RecommendationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: recommendations, isLoading, error, refetch } = useGetTaskRecommendations(taskId, 10);
  const createAssignment = useCreateAssignment();

  const handleFindMatch = () => {
    setIsOpen(true);
    refetch();
  };

  const handleAssign = async (employeeId: number, matchScore: number) => {
    try {
      await createAssignment.mutateAsync({
        taskId,
        employeeId,
        score: matchScore,
        status: 'proposed',
      });
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment');
    }
  };

  return (
    <div data-testid={`recommendations-panel-${taskId}`}>
      {!isOpen ? (
        <button
          data-testid={`find-match-btn-${taskId}`}
          onClick={handleFindMatch}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Find Best Match
        </button>
      ) : (
        <div
          data-testid={`recommendations-modal-${taskId}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '700px',
              maxHeight: '80vh',
              overflow: 'auto',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600' }}>
                  Employee Recommendations
                </h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Task: {taskTitle}
                </p>
              </div>
              <button
                data-testid="close-recommendations-btn"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Close
              </button>
            </div>

            {isLoading && (
              <div data-testid="recommendations-loading" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Finding best matches...
              </div>
            )}

            {error && (
              <div data-testid="recommendations-error" style={{ color: '#ef4444', padding: '20px', textAlign: 'center' }}>
                Error loading recommendations: {error.message}
              </div>
            )}

            {!isLoading && !error && recommendations && recommendations.length === 0 && (
              <div data-testid="no-recommendations" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No employee recommendations found for this task.
              </div>
            )}

            {!isLoading && !error && recommendations && recommendations.length > 0 && (
              <div data-testid="recommendations-list">
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
                  Found {recommendations.length} potential matches, sorted by match score:
                </div>
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.employeeId}
                    recommendation={rec}
                    onAssign={handleAssign}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
