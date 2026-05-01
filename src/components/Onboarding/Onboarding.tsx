import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { playNavSound, playClickSound } from '../../utils/sound';
import { canonicalQuests, SKILL_POOL, SKILL_CATEGORY, categoryToStat } from '../../data/canonicalData';
import type { Quest } from '../../types';
import './Onboarding.css';

const SKILL_XP: Partial<Record<string, number>> = {
  'Strength Training': 30, 'Running': 25, 'Martial Arts': 30, 'Yoga': 15, 'Programming': 30,
  'Deep Work': 25, 'Public Speaking': 20, 'Writing': 20, 'Speed Reading': 15, 'Investing': 15,
  'Meditation': 15, 'Nutrition': 10, 'Cold Exposure': 10, 'Journaling': 10, 'Chess': 15,
  'Language Learning': 20, 'Drawing': 20, 'Music': 20, 'Sales': 20, 'Entrepreneurship': 25,
  'Data Analysis': 25, 'Negotiation': 20, 'Photography': 15, 'Sleep Mastery': 15, 'Consistency': 10,
};

function getQuestsForSkills(skills: string[]): Quest[] {
  const result: Quest[] = [];
  const usedIds = new Set<string>();
  for (const skill of skills) {
    const matching = canonicalQuests.filter(q => q.skill === skill);
    for (const q of matching) {
      if (!usedIds.has(q.id)) { result.push(q); usedIds.add(q.id); }
    }
    if (matching.length === 0) {
      const syntheticId = `gen_${skill.replace(/\s+/g, '_').toLowerCase()}`;
      const cat = SKILL_CATEGORY[skill] ?? 'skill';
      result.push({
        id: syntheticId,
        label: skill,
        category: cat,
        skill,
        xpReward: SKILL_XP[skill] ?? 20,
        completedToday: false,
        stat: categoryToStat(cat),
      });
    }
  }
  return result;
}

export default function Onboarding() {
  const completeSetup = useGameStore(s => s.completeSetup);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>([]);

  function toggleSkill(skill: string) {
    setSelectedSkills(s =>
      s.includes(skill)
        ? s.filter(x => x !== skill)
        : s.length < 3 ? [...s, skill] : s
    );
  }

  function toggleQuest(id: string) {
    setSelectedQuestIds(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  }

  function canAdvance(): boolean {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return selectedSkills.length === 3;
    return true;
  }

  function advance() {
    if (!canAdvance()) return;
    if (step === 1) {
      setSelectedQuestIds(canonicalQuests.map(q => q.id));
    }
    if (step < 2) { playNavSound(); setStep(s => s + 1); }
    else { playClickSound(); finish(); }
  }

  function matchMySkills() {
    const filtered = getQuestsForSkills(selectedSkills);
    setSelectedQuestIds(filtered.map(q => q.id));
  }

  function finish() {
    const syntheticOffered = getQuestsForSkills(selectedSkills).filter(q => q.id.startsWith('gen_'));
    const allOffered: Quest[] = [...canonicalQuests, ...syntheticOffered];
    const quests: Quest[] = allOffered.filter(q => selectedQuestIds.includes(q.id));
    completeSetup(name, selectedSkills, quests);
  }

  const STEPS = ['IDENTITY', 'SKILLS', 'QUESTS'];

  return (
    <div className="ob-backdrop">
      <div className="ob-window">

        {/* Header */}
        <div className="ob-header">
          <div className="ob-system-tag">◈ IAMBOSS SYSTEM</div>
          <div className="ob-step-indicator">
            {STEPS.map((label, i) => (
              <div key={i} className={`ob-step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <span className="ob-step-num">{i < step ? '✓' : i + 1}</span>
                <span className="ob-step-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 0: Name */}
        {step === 0 && (
          <div className="ob-content">
            <div className="ob-title">NEW PLAYER DETECTED</div>
            <div className="ob-subtitle">A new legend begins. What is your name, hunter?</div>
            <input
              className="ob-name-input"
              autoFocus
              placeholder="Enter your name..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && advance()}
              maxLength={24}
            />
            <div className="ob-name-hint">This is how the system will address you.</div>
          </div>
        )}

        {/* Step 1: Skills */}
        {step === 1 && (
          <div className="ob-content">
            <div className="ob-title">SKILL PROTOCOL</div>
            <div className="ob-subtitle">
              Select <span className="ob-highlight">3 skills</span> to track.
              {' '}<span className="ob-dim">More unlock as you level up.</span>
            </div>
            <div className="ob-skills-note">
              {selectedSkills.length}/3 selected
            </div>
            <div className="ob-skill-grid">
              {SKILL_POOL.map(skill => {
                const selected = selectedSkills.includes(skill);
                const disabled = !selected && selectedSkills.length >= 3;
                return (
                  <button
                    key={skill}
                    className={`ob-skill-chip ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => !disabled && toggleSkill(skill)}
                  >
                    {selected && <span className="ob-skill-check">✓</span>}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Quests */}
        {step === 2 && (
          <div className="ob-content">
            <div className="ob-title">QUEST SELECTION</div>
            <div className="ob-subtitle">
              Your full daily schedule, pre-selected.
              {' '}<span className="ob-dim">Uncheck anything you don't want. You can modify these later.</span>
            </div>
            <div className="ob-quest-controls">
              <button className="ob-link-btn" onClick={() => setSelectedQuestIds(canonicalQuests.map(q => q.id))}>Select All</button>
              <button className="ob-link-btn" onClick={() => setSelectedQuestIds([])}>Clear All</button>
              <button className="ob-link-btn" onClick={matchMySkills}>Match my skills</button>
              <span className="ob-quest-count">{selectedQuestIds.length} selected</span>
            </div>
            <div className="ob-quest-list">
              {canonicalQuests.map(q => {
                const checked = selectedQuestIds.includes(q.id);
                return (
                  <label key={q.id} className={`ob-quest-row ${checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      className="ob-quest-checkbox"
                      checked={checked}
                      onChange={() => toggleQuest(q.id)}
                    />
                    <span className="ob-quest-label">{q.label}</span>
                    <span className="ob-quest-skill-tag">{q.skill}</span>
                    <span className="ob-quest-xp">+{q.xpReward} XP</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="ob-footer">
          {step > 0 && (
            <button className="ob-btn-back" onClick={() => { playNavSound(); setStep(s => s - 1); }}>← Back</button>
          )}
          <div style={{ flex: 1 }} />
          <button
            className={`ob-btn-next ${!canAdvance() ? 'disabled' : ''}`}
            onClick={advance}
            disabled={!canAdvance()}
          >
            {step === 2 ? `BEGIN — ${name.trim() || 'HUNTER'}` : 'NEXT →'}
          </button>
        </div>
      </div>
    </div>
  );
}
