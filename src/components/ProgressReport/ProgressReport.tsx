import { useGameStore } from '../../store/useGameStore';
import { selectXpEarnedToday } from '../../types';
import './ProgressReport.css';

export default function ProgressReport() {
  const { quests, skills, level, xp, xpToNext, streak, setShowReport } = useGameStore();

  const todaysQuests = quests;
  const total = todaysQuests.length;
  const done = todaysQuests.filter(q => q.completedToday).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const xpToday = selectXpEarnedToday(todaysQuests);
  const xpPct = Math.round((xp / xpToNext) * 100);
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="report-backdrop" onClick={() => setShowReport(false)}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <div className="report-header">
          <span className="report-title">◈ DAILY REPORT</span>
          <button className="btn btn-danger" onClick={() => setShowReport(false)}>✕</button>
        </div>
        <div className="report-body">
          <div className="report-top">
            <div className="ring-wrap">
              <svg className="ring-svg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" className="ring-bg" />
                <circle cx="60" cy="60" r="52" className="ring-fill"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  transform="rotate(-90 60 60)"
                  style={{ stroke: pct === 100 ? '#00d4ff' : '#9b5de5' }} />
              </svg>
              <div className="ring-label">
                <div className="ring-pct">{pct}%</div>
                <div className="ring-sub">DONE</div>
              </div>
            </div>
            <div className="report-stats">
              <div className="stat-card">
                <div className="stat-value">{done}<span className="stat-denom">/{total}</span></div>
                <div className="stat-label">Quests</div>
              </div>
              <div className="stat-card stat-card--xp">
                <div className="stat-value">+{xpToday}</div>
                <div className="stat-label">XP Today</div>
              </div>
              <div className="stat-card stat-card--streak">
                <div className="stat-value">{streak}<span className="stat-denom"> days</span></div>
                <div className="stat-label">Streak</div>
              </div>
              <div className="stat-card stat-card--level">
                <div className="stat-value">Lv.{level}</div>
                <div className="stat-label">{xpPct}% to next</div>
              </div>
            </div>
          </div>

          {skills.length > 0 && (
            <>
              <div className="report-section-title">SKILL STATUS</div>
              <div className="skill-grid">
                {skills.map(s => (
                  <div key={s.id} className="skill-stat-card">
                    <div className="skill-stat-name">{s.name}</div>
                    <div className="skill-stat-level">Lv.{s.level}</div>
                    <div className="skill-stat-xp">{s.xp}/{s.xpToNext} XP</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
