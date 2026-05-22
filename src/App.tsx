import { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import Background from './components/Background/Background';
import PlayerHeader from './components/PlayerHeader/PlayerHeader';
import QuestLog from './components/QuestLog/QuestLog';
import StatusPanel from './components/StatusPanel/StatusPanel';
import SystemMessage from './components/SystemMessage/SystemMessage';
import ProgressReport from './components/ProgressReport/ProgressReport';
import DataPanel from './components/DataPanel/DataPanel';
import Onboarding from './components/Onboarding/Onboarding';
import EveningRitual from './components/EveningRitual/EveningRitual';
import { playOpenSound, playHoverSound, playClickSound } from './utils/sound';
import './styles/globals.css';
import './App.css';

export default function App() {
  const {
    level, xpFloats, showReport, showLevelUp, levelUpNumber,
    setupComplete, checkDailyReset, dismissLevelUp, setShowReport,
    showEveningRitual, applyData,
  } = useGameStore();
  const [showDataPanel, setShowDataPanel] = useState(false);
  // Lazy-init: if setupComplete is already true at mount, no restore check needed
  const [restoreChecked, setRestoreChecked] = useState(() => setupComplete);

  // Auto-restore from server backup if localStorage was wiped
  useEffect(() => {
    if (restoreChecked) return;
    fetch('/api/load-state')
      .then(r => r.json())
      .then((data: { ok: boolean; state?: Parameters<typeof applyData>[0] }) => {
        if (data.ok && data.state?.setupComplete) applyData(data.state);
      })
      .catch(() => {})
      .finally(() => setRestoreChecked(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { checkDailyReset(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.title = `LVL ${level} — IAMBOSS`; }, [level]);
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as { __gameStore: typeof useGameStore }).__gameStore = useGameStore;
    }
  }, []);

  // Global button sound delegation — hover + click on any interactive element
  useEffect(() => {
    const SELECTOR = [
      'button', '.ob-skill-chip', '.ob-quest-row',
      '.ob-btn-next', '.ob-btn-back', '.ob-link-btn',
    ].join(', ');

    const CUSTOM_CLICK_SELECTOR = '.quest-row';

    let lastHovered: Element | null = null;

    function onMouseOver(e: MouseEvent) {
      const btn = (e.target as Element).closest(SELECTOR);
      if (btn && btn !== lastHovered) {
        lastHovered = btn;
        playHoverSound();
      }
    }

    function onMouseOut(e: MouseEvent) {
      const btn = (e.target as Element).closest(SELECTOR);
      if (btn && btn === lastHovered) lastHovered = null;
    }

    function onGlobalClick(e: MouseEvent) {
      const btn = (e.target as Element).closest(SELECTOR);
      if (btn && !btn.closest(CUSTOM_CLICK_SELECTOR)) {
        playClickSound();
      }
    }

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('click', onGlobalClick);
    return () => {
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('click', onGlobalClick);
    };
  }, []);

  if (!setupComplete) {
    if (!restoreChecked) return <Background />;
    return (
      <>
        <Background />
        <Onboarding />
      </>
    );
  }

  return (
    <div className="app">
      <Background />

      {xpFloats.map(f => (
        <div key={f.id} className="xp-float" style={{ left: f.x, top: f.y }}>+{f.amount} XP</div>
      ))}

      {showLevelUp && (
        <div className="levelup-overlay" onClick={dismissLevelUp}>
          <div className="levelup-content">
            <div className="levelup-label">LEVEL UP</div>
            <div className="levelup-number">{levelUpNumber}</div>
            <div className="levelup-sub">You are becoming dangerous.</div>
          </div>
        </div>
      )}

      {showReport && <ProgressReport />}
      {showDataPanel && <DataPanel onClose={() => setShowDataPanel(false)} />}
      {showEveningRitual && <EveningRitual />}

      <div className="app-inner">
        <div className="hud-corner hud-tl" />
        <div className="hud-corner hud-tr" />
        <div className="hud-corner hud-bl" />
        <div className="hud-corner hud-br" />

        <div className="app-header">
          <div className="app-brand">◈ IAMBOSS SYSTEM</div>
          <div className="app-header-right">
            <button className="btn btn-report" onClick={() => { playOpenSound(); setShowReport(true); }} title="Progress Report">📊</button>
            <button className="btn btn-data" onClick={() => { playOpenSound(); setShowDataPanel(true); }} title="Data Panel">⚙</button>
          </div>
        </div>

        <PlayerHeader />

        <div className="two-col">
          <div className="col-main">
            <QuestLog />
          </div>
          <div className="col-side">
            <StatusPanel />
            <SystemMessage />
          </div>
        </div>
      </div>
    </div>
  );
}
