import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { RitualQuestStatus, RitualEntry } from '../../types';
import './EveningRitual.css';

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function EveningRitual() {
  const quests = useGameStore(s => s.quests);
  const rituals = useGameStore(s => s.rituals);
  const submitRitual = useGameStore(s => s.submitRitual);
  const closeEveningRitual = useGameStore(s => s.closeEveningRitual);

  const today = todayString();
  const existing = useMemo(() => rituals.find(r => r.date === today), [rituals, today]);

  // Local form state — initialized from `existing` on mount. The modal unmounts on
  // close (`{showEveningRitual && <EveningRitual />}` in App.tsx), so a fresh open
  // re-runs these initializers.
  const [statusMap, setStatusMap] = useState<Record<string, RitualQuestStatus | null>>(() => {
    if (!existing) return {};
    const m: Record<string, RitualQuestStatus | null> = {};
    for (const e of existing.quests) m[e.questId] = e.status;
    return m;
  });
  const [mattered, setMattered] = useState(() => existing?.journal.mattered ?? '');
  const [obstacle, setObstacle] = useState(() => existing?.journal.obstacle ?? '');
  const [tomorrow, setTomorrow] = useState(() => existing?.journal.tomorrow ?? '');
  const [mood, setMood] = useState<number | null>(() => existing?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(() => existing?.energy ?? null);

  function setStatus(questId: string, status: RitualQuestStatus) {
    setStatusMap(prev => ({ ...prev, [questId]: prev[questId] === status ? null : status }));
  }

  function handleSubmit() {
    const entries: RitualEntry[] = quests
      .filter(q => statusMap[q.id] != null)
      .map(q => ({ questId: q.id, status: statusMap[q.id] as RitualQuestStatus }));

    submitRitual({
      quests: entries,
      journal: { mattered, obstacle, tomorrow },
      mood,
      energy,
    });
    closeEveningRitual();
  }

  return (
    <div className="er-overlay" onClick={closeEveningRitual}>
      <div className="er-modal" onClick={e => e.stopPropagation()}>
        <div className="er-header">
          <div>
            <div className="er-title">EVENING RITUAL</div>
            <div className="er-subtitle">{todayLabel()}</div>
          </div>
          <button className="er-close" onClick={closeEveningRitual} aria-label="Close">×</button>
        </div>

        <div className="er-body">
          {/* Section 1 — Quests */}
          <section className="er-section">
            <div className="er-section-title">◈ QUESTS · how did each go?</div>
            <div className="er-quest-list">
              {quests.map(q => {
                const status = statusMap[q.id] ?? null;
                return (
                  <div key={q.id} className="er-quest-row">
                    <div className="er-quest-label">{q.label}</div>
                    <div className="er-status-group">
                      <button
                        className={`er-status-btn er-done ${status === 'done' ? 'active' : ''}`}
                        onClick={() => setStatus(q.id, 'done')}
                        data-tooltip="Completed it. Full XP + streak credit."
                        aria-label="Done — Completed it. Full XP and streak credit."
                      >✓ Done</button>
                      <button
                        className={`er-status-btn er-honest ${status === 'honest' ? 'active' : ''}`}
                        onClick={() => setStatus(q.id, 'honest')}
                        data-tooltip="Tried but it didn't go like planned. Streak stays. No XP."
                        aria-label="Honest — Tried but it didn't go like planned. Streak stays. No XP."
                      >· Honest</button>
                      <button
                        className={`er-status-btn er-skipped ${status === 'skipped' ? 'active' : ''}`}
                        onClick={() => setStatus(q.id, 'skipped')}
                        data-tooltip="Consciously didn't do it. Streak stays. No XP."
                        aria-label="Skipped — Consciously didn't do it. Streak stays. No XP."
                      >× Skipped</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="er-hint">"Honest" = tried but it didn't go like planned. "Skipped" = consciously didn't do it. Both keep the streak.</div>
          </section>

          {/* Section 2 — Journal */}
          <section className="er-section">
            <div className="er-section-title">◈ JOURNAL · all optional</div>
            <textarea
              className="er-textarea"
              placeholder="What did you do today that mattered?"
              value={mattered}
              onChange={e => setMattered(e.target.value)}
              rows={2}
            />
            <textarea
              className="er-textarea"
              placeholder="What got in the way?"
              value={obstacle}
              onChange={e => setObstacle(e.target.value)}
              rows={2}
            />
            <textarea
              className="er-textarea"
              placeholder="One thing for tomorrow."
              value={tomorrow}
              onChange={e => setTomorrow(e.target.value)}
              rows={2}
            />
          </section>

          {/* Section 3 — Vitals */}
          <section className="er-section">
            <div className="er-section-title">◈ VITALS · how do you feel?</div>

            <div className="er-vital-row">
              <div className="er-vital-label">
                <span className="er-vital-stat">HP</span>
                <span className="er-vital-name">Mood</span>
                <span className="er-vital-val">{mood == null ? '--' : mood}</span>
              </div>
              <input
                type="range" min={0} max={100} step={5}
                value={mood ?? 50}
                onChange={e => setMood(parseInt(e.target.value))}
                className="er-slider er-slider-hp"
                disabled={mood == null}
              />
              <button
                className={`er-vital-toggle ${mood == null ? 'off' : 'on'}`}
                onClick={() => setMood(mood == null ? 50 : null)}
              >{mood == null ? '+ Add' : 'Clear'}</button>
            </div>

            <div className="er-vital-row">
              <div className="er-vital-label">
                <span className="er-vital-stat">MP</span>
                <span className="er-vital-name">Energy</span>
                <span className="er-vital-val">{energy == null ? '--' : energy}</span>
              </div>
              <input
                type="range" min={0} max={100} step={5}
                value={energy ?? 50}
                onChange={e => setEnergy(parseInt(e.target.value))}
                className="er-slider er-slider-mp"
                disabled={energy == null}
              />
              <button
                className={`er-vital-toggle ${energy == null ? 'off' : 'on'}`}
                onClick={() => setEnergy(energy == null ? 50 : null)}
              >{energy == null ? '+ Add' : 'Clear'}</button>
            </div>
          </section>
        </div>

        <div className="er-footer">
          <button className="er-cancel" onClick={closeEveningRitual}>CANCEL</button>
          <button className="er-submit" onClick={handleSubmit}>
            {existing ? 'UPDATE RITUAL ▸' : 'SUBMIT RITUAL ▸'}
          </button>
        </div>
      </div>
    </div>
  );
}
