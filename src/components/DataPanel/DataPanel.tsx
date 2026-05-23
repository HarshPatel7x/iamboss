import { useState, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { migrateAppData, CURRENT_SCHEMA_VERSION } from '../../store/migrations';
import type { AppData } from '../../types';
import { selectOrphanedQuests } from '../../types';
import './DataPanel.css';

interface Props {
  onClose: () => void;
}

export default function DataPanel({ onClose }: Props) {
  const {
    playerName, setupComplete, quests, skills,
    level, xp, xpToNext, title, streak, lastResetDate,
    logs, rituals,
    applyData, resetToCanonical,
  } = useGameStore();

  const state: AppData = {
    playerName, setupComplete, level, xp, xpToNext, title, streak, lastResetDate,
    quests, skills, logs, rituals,
  };

  const orphans = selectOrphanedQuests(quests, skills);

  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, data: state }, null, 2)
  );
  const [error, setError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleApply() {
    try {
      const parsed = JSON.parse(jsonText);
      let migrated: AppData;
      if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed && 'data' in parsed) {
        if (parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
          setError('Save is from a newer version. Update IAMBOSS first.');
          return;
        }
        migrated = migrateAppData(parsed.data, parsed.schemaVersion);
      } else {
        migrated = migrateAppData(parsed, 1);
      }
      applyData(migrated);
      setError('');
      onClose();
    } catch {
      setError('Invalid JSON — fix and try again.');
    }
  }

  function handleExport() {
    const envelope = JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, data: state }, null, 2);
    const date = new Date().toISOString().split('T')[0];
    const blob = new Blob([envelope], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iamboss-data-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setJsonText(ev.target?.result as string ?? '');
      setError('');
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return; }
    resetToCanonical();
    setConfirmReset(false);
    onClose();
  }

  return (
    <div className="dp-backdrop" onClick={onClose}>
      <div className="dp-panel" onClick={e => e.stopPropagation()}>
        <div className="dp-header">
          <span className="dp-title">⚙ DATA PANEL</span>
          <div className="dp-header-actions">
            <button className="btn dp-btn-export" onClick={handleExport} title="Download Save (portable across versions)">↓ Export</button>
            <button className="btn dp-btn-import" onClick={() => fileRef.current?.click()} title="Import Save (auto-migrates older versions)">↑ Import</button>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            <button className="btn btn-danger" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="dp-body">
          {orphans.length > 0 && (
            <div className="dp-orphan-warn">
              ⚠ {orphans.length} quest{orphans.length === 1 ? '' : 's'} point to a skill you no longer have:
              {' '}{orphans.map(q => `${q.label} → ${q.skill}`).join('; ')}.
              These leak skill-XP. Retag them in the JSON or via the relink.
            </div>
          )}
          <div className="dp-hint">Edit JSON directly or Import a file. Apply to save. Reset restores canonical defaults.</div>
          <textarea
            className={`dp-textarea ${error ? 'dp-textarea--error' : ''}`}
            value={jsonText}
            onChange={e => { setJsonText(e.target.value); setError(''); }}
            spellCheck={false}
          />
          {error && <div className="dp-error">{error}</div>}
        </div>

        <div className="dp-footer">
          <button
            className={`btn dp-btn-reset ${confirmReset ? 'dp-btn-reset--confirm' : ''}`}
            onClick={handleReset}
            onBlur={() => setConfirmReset(false)}
          >
            {confirmReset ? '⚠ Confirm Reset?' : '↩ Reset to Source'}
          </button>
          <button className="btn dp-btn-apply" onClick={handleApply}>Apply Changes</button>
        </div>
      </div>
    </div>
  );
}
