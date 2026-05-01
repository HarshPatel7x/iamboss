import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { computeMaxSkills } from '../../types';
import { SKILL_POOL } from '../../data/canonicalData';
import { playErrorSound } from '../../utils/sound';
import './StatusPanel.css';

export default function StatusPanel() {
  const { skills, quests, level, addSkill, deleteSkill } = useGameStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const maxSkills = computeMaxSkills(level);
  const atLimit   = skills.length >= maxSkills;

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (atLimit) {
      playErrorSound();
      setError(`Skill limit reached (${maxSkills}). Level up to unlock more slots.`);
      return;
    }
    const ok = addSkill(trimmed);
    if (!ok) { playErrorSound(); setError(`"${trimmed}" already exists`); return; }
    setNewName(''); setError(''); setAdding(false);
  }

  function handleDelete(id: string, skillName: string) {
    const ok = deleteSkill(id);
    if (!ok) { playErrorSound(); setError(`"${skillName}" is used by quests — retag them first`); }
  }

  return (
    <div className="panel status-panel">
      <div className="panel-header">
        Status
        <span className="sp-skill-limit">{skills.length}/{maxSkills}</span>
        {!atLimit ? (
          <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => { setAdding(true); setError(''); }}>
            + Skill
          </button>
        ) : (
          <span className="sp-limit-tag" title={`Level ${(skills.length - 2) * 3} unlocks next slot`}>
            SLOT FULL
          </span>
        )}
      </div>

      {error && (
        <div className="skill-error-banner">
          {error}
          <button className="btn btn-danger" onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="skills-list">
        {skills.map(skill => {
          const pct = Math.round((skill.xp / skill.xpToNext) * 100);
          const linkedCount = quests.filter(q => q.skill === skill.name).length;
          const isLocked = linkedCount > 0;
          return (
            <div key={skill.id} data-testid={`skill-row-${skill.id}`} className="skill-row">
              <div className="skill-info">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-level">Lv.{skill.level}</span>
              </div>
              <div className="skill-xp-track">
                <div className="skill-xp-bar" style={{ width: `${pct}%` }} />
              </div>
              {isLocked ? (
                <span className="skill-locked" title={`${linkedCount} quest${linkedCount > 1 ? 's' : ''} linked`}>
                  🔒
                </span>
              ) : (
                <button className="btn btn-danger" onClick={() => handleDelete(skill.id, skill.name)}
                  title="Remove skill">✕</button>
              )}
            </div>
          );
        })}

        {skills.length === 0 && !adding && (
          <div className="skills-empty">No skills registered.</div>
        )}

        {adding && (() => {
          const availableSkills = SKILL_POOL.filter(s => !skills.some(sk => sk.name === s));
          return (
            <div className="skill-add-row">
              <div className="skill-add-inner">
                {availableSkills.length > 0 ? (
                  <select
                    autoFocus
                    className={`skill-input skill-select ${error ? 'skill-input--error' : ''}`}
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setError(''); }}
                  >
                    <option value="">— Select skill —</option>
                    {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <div className="skills-empty" style={{ padding: '6px 10px', fontSize: 12 }}>
                    All available skills added
                  </div>
                )}
              </div>
              {availableSkills.length > 0 && (
                <button className="btn" onClick={handleAdd}>Confirm</button>
              )}
              <button className="btn btn-danger" onClick={() => { setAdding(false); setNewName(''); setError(''); }}>✕</button>
            </div>
          );
        })()}

        {atLimit && (
          <div className="sp-next-slot">
            Next slot unlocks at Level {(skills.length - 2) * 3}
          </div>
        )}
      </div>
    </div>
  );
}
