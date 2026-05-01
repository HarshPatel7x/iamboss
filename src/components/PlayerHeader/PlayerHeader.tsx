import { useState, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useComputedStats } from '../../store/useComputedStats';
import './PlayerHeader.css';

const TARGETS: Record<string, number> = { str: 7, int: 10, per: 7 };

export default function PlayerHeader() {
  const { playerName, level, xp, xpToNext, title, streak, rituals, resetToCanonical, openEveningRitual } = useGameStore();
  const computed = useComputedStats();
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const xpPct  = Math.min(100, Math.round((xp / xpToNext) * 100));

  const today = new Date().toISOString().split('T')[0];
  const todayLogged = rituals.some(r => r.date === today);

  function handleResetClick() {
    if (!confirmReset) {
      setConfirmReset(true);
      resetTimerRef.current = setTimeout(() => setConfirmReset(false), 4000);
    } else {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      setConfirmReset(false);
      resetToCanonical();
    }
  }

  function renderActivityStat(key: 'str' | 'int' | 'per', color: string) {
    const score = computed[key];
    const raw = computed.raw[key];
    const has = computed.hasData[key];
    return (
      <div key={key} className="ph-stat">
        <div className="ph-stat-label" style={{ color }}>{key.toUpperCase()}</div>
        <div className="ph-stat-val">{has ? score : '--'}</div>
        <div className="ph-stat-sub">{has ? `${raw}/${TARGETS[key]}` : '0/7d'}</div>
      </div>
    );
  }

  function renderVitalStat(key: 'hp' | 'mp', label: string, color: string) {
    const value = computed[key];
    const has = computed.hasData[key];
    return (
      <div key={key} className="ph-stat ph-stat-vital">
        <div className="ph-stat-label" style={{ color }}>{label}</div>
        <div className="ph-stat-val">{has ? value : '--'}</div>
        <div className="ph-stat-sub">{has ? '7d avg' : 'no data'}</div>
      </div>
    );
  }

  return (
    <div className="player-header panel">

      {/* Identity */}
      <div className="ph-identity">
        <div className="ph-avatar"><span>{(playerName || 'H')[0].toUpperCase()}</span></div>
        <div className="ph-info">
          <div className="ph-name">{(playerName || 'HUNTER').toUpperCase()}</div>
          <div className="ph-class-title">
            <span className="ph-title-text">{title}</span>
            {streak > 0 && <><span className="ph-dot">·</span><span className="ph-streak">🔥 {streak}</span></>}
          </div>
        </div>

        <button
          className={`ph-ritual-btn ${todayLogged ? 'logged' : ''}`}
          onClick={openEveningRitual}
          title={todayLogged ? 'Edit today\u2019s ritual' : 'Open evening ritual'}
        >
          {todayLogged ? '✓ RITUAL LOGGED' : 'RITUAL ▸'}
        </button>

        <div className="ph-level-block">
          <div className="ph-lvl-label">LVL</div>
          <div className="ph-lvl-num" data-testid="player-level">{level}</div>
        </div>
        <button
          className={`ph-reset-btn ${confirmReset ? 'confirming' : ''}`}
          onClick={handleResetClick}
          title="Reset system"
        >
          {confirmReset ? '⚠ CONFIRM?' : '⟲'}
        </button>
      </div>

      {/* Bars */}
      <div className="ph-bars">
        <div className="ph-bar-row">
          <span className="ph-bar-label ph-bar-label--xp">EXP</span>
          <div className="ph-bar-track">
            <div className="ph-bar-fill ph-bar-xp" data-testid="xp-bar" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="ph-bar-val">{xp}/{xpToNext}</span>
        </div>
      </div>

      {/* Stats — STR/INT/PER (activity) + HP/MP (vitals) */}
      <div className="ph-stats-row">
        {renderActivityStat('str', '#e8623a')}
        {renderActivityStat('int', '#3b8fe8')}
        {renderActivityStat('per', '#9b5de5')}
        <div className="ph-stat-sep" />
        {renderVitalStat('hp', 'HP', '#00d4ff')}
        {renderVitalStat('mp', 'MP', '#c084fc')}
      </div>
    </div>
  );
}
