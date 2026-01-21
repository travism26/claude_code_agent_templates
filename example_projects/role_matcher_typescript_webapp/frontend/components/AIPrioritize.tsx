'use client';

import { useState } from 'react';
import { useAIPrioritize } from '@/hooks/useTasks';
import { AIPrioritizationResponse } from '@/types/task';

export function AIPrioritize() {
  const [result, setResult] = useState<AIPrioritizationResponse | null>(null);
  const aiPrioritize = useAIPrioritize();

  const handlePrioritize = async () => {
    try {
      const response = await aiPrioritize.mutateAsync();
      setResult(response);
    } catch (error) {
      console.error('Error running AI prioritization:', error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>AI Task Prioritization</h2>
        <button
          onClick={handlePrioritize}
          disabled={aiPrioritize.isPending}
          data-testid="ai-prioritize-btn"
          style={{
            padding: '10px 20px',
            backgroundColor: aiPrioritize.isPending ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: aiPrioritize.isPending ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {aiPrioritize.isPending ? 'Running AI...' : 'Run AI Prioritization'}
        </button>
      </div>

      {aiPrioritize.isPending && (
        <div
          data-testid="ai-loading"
          style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '18px', color: '#6b7280' }}>
            AI is analyzing your tasks... This may take a moment.
          </div>
        </div>
      )}

      {aiPrioritize.isError && (
        <div
          data-testid="ai-error"
          style={{
            backgroundColor: '#fef2f2',
            padding: '16px',
            borderRadius: '8px',
            color: '#ef4444',
            border: '1px solid #fecaca',
          }}
        >
          Error: {aiPrioritize.error?.message || 'Failed to run AI prioritization'}
        </div>
      )}

      {result && (
        <div data-testid="ai-results">
          {/* Reranked Tasks */}
          {result.rerankedTasks && result.rerankedTasks.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Re-prioritized Tasks</h3>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {result.rerankedTasks.map((task, index) => (
                  <div
                    key={task.taskId}
                    data-testid={`reranked-task-${task.taskId}`}
                    style={{
                      padding: '12px',
                      marginBottom: index < result.rerankedTasks.length - 1 ? '12px' : 0,
                      borderLeft: '4px solid #8b5cf6',
                      backgroundColor: '#f9fafb',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>Task #{task.taskId}</strong>
                      <span
                        style={{
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        New Priority: {task.newPriority.toFixed(1)}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>{task.justification}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Suggestions */}
          {result.missingSuggestions && result.missingSuggestions.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Missing Task Suggestions</h3>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <ul data-testid="missing-suggestions" style={{ margin: 0, paddingLeft: '20px' }}>
                  {result.missingSuggestions.map((suggestion, index) => (
                    <li key={index} style={{ marginBottom: '8px', color: '#4b5563' }}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Identified Risks */}
          {result.identifiedRisks && result.identifiedRisks.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Identified Risks</h3>
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                }}
              >
                <ul data-testid="identified-risks" style={{ margin: 0, paddingLeft: '20px', color: '#991b1b' }}>
                  {result.identifiedRisks.map((risk, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
