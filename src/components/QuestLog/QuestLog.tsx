import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { selectXpEarnedToday } from '../../types';
import type { Quest, NewQuestInput } from '../../types';
import { playClickSound, playErrorSound } from '../../utils/sound';
import './QuestLog.css';

const BLANK_FORM: NewQuestInput = { label: '', skill: '', xpReward: 20 };

export default function QuestLog() {
  const { quests, skills, completeQuest, uncompleteQuest, addQuest, deleteQuest, spawnXpFloat, setHoveredQuest } = useGameStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<NewQuestInput>(BLANK_FORM);
  const [flashing, setFlashing] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const completed = quests.filter(q => q.completedToday).length;
  const total = quests.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const xpToday = selectXpEarnedToday(quests);

  function handleToggle(quest: Quest, e: React.MouseEvent) {
    if (quest.completedToday) {
      uncompleteQuest(quest.id);
    } else {
      setFlashing(quest.id);
      setTimeout(() => setFlashing(null), 600);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      spawnXpFloat(quest.xpReward, rect.right - 60, rect.top + rect.height / 2);
      completeQuest(quest.id);
    }
  }

  function handleAdd() {
    if (!form.label.trim()) return;
    if (!form.skill) { playErrorSound(); setFormError('Select a skill'); return; }
    addQuest({ ...form, label: form.label.trim() });
    setForm(BLANK_FORM);
    setAdding(false);
    setFormError('');
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setAdding(false); setForm(BLANK_FORM); setFormError(''); }
  }

  return (
    <div className="panel quest-log">
      <div className="panel-header">
        Daily Quests
        <div className="quest-header-right">
          <span className="quest-xp-today">+{xpToday} XP</span>
          <span className="quest-pct" style={{ color: pct === 100 ? '#00d4ff' : undefined }}>{pct}%</span>
          <span className="quest-count">{completed}/{total}</span>
          <button className="btn" onClick={() => setAdding(v => !v)}>+ Quest</button>
        </div>
      </div>

      <div className="quest-progress-bar">
        <div className="quest-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {adding && (
        <div className="quest-add-form">
          <div className="form-row">
            <input autoFocus className="quest-input" placeholder="Quest name..." value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))} onKeyDown={handleKey} />
          </div>
          <div className="form-row">
            <select
              className={`quest-select quest-select--skill ${formError ? 'quest-select--error' : ''}`}
              value={form.skill}
              onChange={e => { setForm(f => ({ ...f, skill: e.target.value })); setFormError(''); }}>
              <option value="">— Select skill —</option>
              {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select className="quest-select quest-select--diff" value={form.xpReward}
              onChange={e => setForm(f => ({ ...f, xpReward: Number(e.target.value) }))}>
              <option value={10}>EASY — 10 XP</option>
              <option value={20}>NORMAL — 20 XP</option>
              <option value={35}>HARD — 35 XP</option>
              <option value={50}>EPIC — 50 XP</option>
            </select>
            <button className="btn" onClick={handleAdd}>Add</button>
            <button className="btn btn-danger" onClick={() => { setAdding(false); setForm(BLANK_FORM); setFormError(''); }}>✕</button>
          </div>
          {formError && <div className="form-error">{formError}</div>}
        </div>
      )}

      <div className="quest-list">
        {quests.map(quest => (
          <div key={quest.id}
            data-testid={`quest-row-${quest.id}`}
            className={`quest-row
              ${quest.completedToday ? 'quest-done' : ''}
              ${flashing === quest.id ? 'quest-flash' : ''}
            `}
            onMouseEnter={() => setHoveredQuest(quest.id)}
            onClick={e => handleToggle(quest, e)}>
            <div data-testid={`quest-complete-${quest.id}`} className={`quest-checkbox ${quest.completedToday ? 'checked' : ''}`}>
              {quest.completedToday && <span className="check-mark">✓</span>}
            </div>
            <div className="quest-body">
              <div className="quest-label">{quest.label}</div>
              <div className="quest-meta">
                <span className="quest-skill-tag">{quest.skill}</span>
              </div>
            </div>
            <div className="quest-right">
              <div className="quest-xp">+{quest.xpReward} XP</div>
              <button className="btn btn-danger quest-delete"
                onClick={e => { e.stopPropagation(); playClickSound(); setHoveredQuest(null); deleteQuest(quest.id); }}
                title="Delete quest">✕</button>
            </div>
          </div>
        ))}
        {quests.length === 0 && <div className="quests-empty">No quests. Add one to begin your journey.</div>}
      </div>
    </div>
  );
}
