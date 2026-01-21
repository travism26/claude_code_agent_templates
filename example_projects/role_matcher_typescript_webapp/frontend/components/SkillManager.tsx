'use client';

import { useState } from 'react';
import { EmployeeSkill, SkillFormData } from '@/types/employee';

interface SkillManagerProps {
  employeeId: number;
  skills: EmployeeSkill[];
  onAddSkill: (data: SkillFormData) => Promise<void>;
  onUpdateSkill: (skillName: string, level: number) => Promise<void>;
  onDeleteSkill: (skillName: string) => Promise<void>;
}

export function SkillManager({ employeeId, skills, onAddSkill, onUpdateSkill, onDeleteSkill }: SkillManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState<SkillFormData>({ skillName: '', level: 3 });
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState(3);
  const [error, setError] = useState('');

  const handleAddSkill = async () => {
    if (!newSkill.skillName.trim()) {
      setError('Skill name is required');
      return;
    }

    try {
      await onAddSkill(newSkill);
      setNewSkill({ skillName: '', level: 3 });
      setShowAddForm(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to add skill');
    }
  };

  const handleUpdateSkill = async (skillName: string) => {
    try {
      await onUpdateSkill(skillName, editLevel);
      setEditingSkill(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to update skill');
    }
  };

  const handleDeleteSkill = async (skillName: string) => {
    if (confirm(`Are you sure you want to remove the skill "${skillName}"?`)) {
      try {
        await onDeleteSkill(skillName);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to delete skill');
      }
    }
  };

  const startEditing = (skill: EmployeeSkill) => {
    setEditingSkill(skill.skillName);
    setEditLevel(skill.level);
  };

  const getLevelColor = (level: number) => {
    if (level >= 4) return '#22c55e'; // green - expert
    if (level >= 3) return '#3b82f6'; // blue - intermediate
    return '#f59e0b'; // orange - beginner
  };

  return (
    <div data-testid={`skill-manager-${employeeId}`} style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Skills</h3>
        {!showAddForm && (
          <button
            data-testid="add-skill-btn"
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            + Add Skill
          </button>
        )}
      </div>

      {error && (
        <div data-testid="skill-error" style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Add Skill Form */}
      {showAddForm && (
        <div
          data-testid="add-skill-form"
          style={{
            backgroundColor: '#f9fafb',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Skill Name
            </label>
            <input
              type="text"
              data-testid="skill-name-input"
              value={newSkill.skillName}
              onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
              placeholder="e.g., JavaScript, Design, Management"
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
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Level: {newSkill.level}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              data-testid="skill-level-slider"
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
              <span>1 (Beginner)</span>
              <span>5 (Expert)</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              data-testid="confirm-add-skill-btn"
              onClick={handleAddSkill}
              style={{
                padding: '6px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Add
            </button>
            <button
              data-testid="cancel-add-skill-btn"
              onClick={() => {
                setShowAddForm(false);
                setNewSkill({ skillName: '', level: 3 });
                setError('');
              }}
              style={{
                padding: '6px 12px',
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
          </div>
        </div>
      )}

      {/* Skills List */}
      {skills.length === 0 ? (
        <div data-testid="no-skills" style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
          No skills added yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {skills.map((skill) => (
            <div
              key={skill.skillName}
              data-testid={`skill-item-${skill.skillName}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{skill.skillName}</div>
                {editingSkill === skill.skillName ? (
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      data-testid={`edit-level-slider-${skill.skillName}`}
                      value={editLevel}
                      onChange={(e) => setEditLevel(parseInt(e.target.value))}
                      style={{ width: '200px' }}
                    />
                    <span style={{ marginLeft: '8px' }}>{editLevel}/5</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div
                      style={{
                        width: '100px',
                        height: '6px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${(skill.level / 5) * 100}%`,
                          height: '100%',
                          backgroundColor: getLevelColor(skill.level),
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{skill.level}/5</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {editingSkill === skill.skillName ? (
                  <>
                    <button
                      data-testid={`save-skill-btn-${skill.skillName}`}
                      onClick={() => handleUpdateSkill(skill.skillName)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Save
                    </button>
                    <button
                      data-testid={`cancel-edit-skill-btn-${skill.skillName}`}
                      onClick={() => setEditingSkill(null)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      data-testid={`edit-skill-btn-${skill.skillName}`}
                      onClick={() => startEditing(skill)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      data-testid={`delete-skill-btn-${skill.skillName}`}
                      onClick={() => handleDeleteSkill(skill.skillName)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
