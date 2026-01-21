'use client';

import { Recommendation } from '@/types/assignment';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAssign?: (employeeId: number, matchScore: number) => void;
}

export function RecommendationCard({ recommendation, onAssign }: RecommendationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green - excellent match
    if (score >= 60) return '#3b82f6'; // blue - good match
    if (score >= 40) return '#f59e0b'; // orange - moderate match
    return '#ef4444'; // red - poor match
  };

  const getRecommendationColor = (text: string) => {
    if (text.toLowerCase().includes('perfect')) return '#22c55e';
    if (text.toLowerCase().includes('strong')) return '#3b82f6';
    if (text.toLowerCase().includes('moderate')) return '#f59e0b';
    return '#ef4444';
  };

  const utilizationPercentage = recommendation.capacity > 0
    ? (recommendation.workload / recommendation.capacity) * 100
    : 0;

  const isOverCapacity = utilizationPercentage >= 100;

  return (
    <div
      data-testid={`recommendation-card-${recommendation.employeeId}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {/* Employee Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
            {recommendation.employeeName}
          </h4>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
            {recommendation.employeeRole}
          </p>
        </div>
        <div
          style={{
            backgroundColor: getScoreColor(recommendation.matchScore),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
          }}
          data-testid={`recommendation-score-${recommendation.employeeId}`}
        >
          {recommendation.matchScore.toFixed(0)}%
        </div>
      </div>

      {/* Match Score Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', marginBottom: '4px', fontWeight: '500' }}>Match Score</div>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(recommendation.matchScore, 100)}%`,
              height: '100%',
              backgroundColor: getScoreColor(recommendation.matchScore),
            }}
          />
        </div>
      </div>

      {/* Workload / Capacity */}
      <div style={{ marginBottom: '12px', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span><strong>Workload:</strong> {recommendation.workload}/{recommendation.capacity}</span>
          <span style={{ color: isOverCapacity ? '#ef4444' : '#6b7280' }}>
            {utilizationPercentage.toFixed(0)}%
          </span>
        </div>
        {isOverCapacity && (
          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
            ⚠ At or over capacity
          </div>
        )}
      </div>

      {/* Skill Breakdown */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Skill Breakdown:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {recommendation.skillMatches.map((skill) => (
            <div
              key={skill.skillName}
              data-testid={`skill-match-${recommendation.employeeId}-${skill.skillName}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                backgroundColor: skill.match ? '#f0fdf4' : '#fef2f2',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: '500' }}>{skill.skillName}</span>
                {' '}
                <span style={{ color: '#6b7280' }}>
                  (Required: {skill.required}, Has: {skill.employeeLevel !== null ? skill.employeeLevel : 'N/A'})
                </span>
              </div>
              <div
                style={{
                  padding: '2px 8px',
                  backgroundColor: skill.match ? '#22c55e' : '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                {skill.match ? '✓ Match' : '✗ Missing'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      {recommendation.missingSkills.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#ef4444' }}>
            Missing Skills:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {recommendation.missingSkills.map((skill) => (
              <span
                key={skill}
                data-testid={`missing-skill-${recommendation.employeeId}-${skill}`}
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Text */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          marginBottom: '12px',
          borderLeft: `4px solid ${getRecommendationColor(recommendation.recommendation)}`,
        }}
      >
        <div style={{ fontSize: '13px', color: '#374151' }}>
          {recommendation.recommendation}
        </div>
      </div>

      {/* Assign Button */}
      {onAssign && (
        <button
          data-testid={`assign-btn-${recommendation.employeeId}`}
          onClick={() => onAssign(recommendation.employeeId, recommendation.matchScore)}
          disabled={isOverCapacity}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isOverCapacity ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isOverCapacity ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {isOverCapacity ? 'Employee at Capacity' : 'Assign to This Employee'}
        </button>
      )}
    </div>
  );
}
