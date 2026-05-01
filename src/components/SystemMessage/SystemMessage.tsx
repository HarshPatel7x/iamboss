import { useGameStore } from '../../store/useGameStore';
import { SKILL_MESSAGES, DEFAULT_MESSAGES } from '../../data/canonicalData';
import './SystemMessage.css';

function pickMessage(skill: string | null): { skill: string; msg: string } {
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getHours();
  if (skill && SKILL_MESSAGES[skill]) {
    const msgs = SKILL_MESSAGES[skill];
    const idx = (today.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + hour) % msgs.length;
    return { skill, msg: msgs[idx] };
  }
  const idx = (today.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + hour) % DEFAULT_MESSAGES.length;
  return { skill: 'SYSTEM', msg: DEFAULT_MESSAGES[idx] };
}

export default function SystemMessage() {
  const hoveredQuestId = useGameStore(s => s.hoveredQuestId);
  const quests = useGameStore(s => s.quests);

  const hovered = hoveredQuestId ? quests.find(q => q.id === hoveredQuestId) : null;
  const nextIncomplete = quests.find(q => !q.completedToday);
  const targetSkill = hovered?.skill ?? nextIncomplete?.skill ?? null;

  const { skill, msg } = pickMessage(targetSkill);

  return (
    <div className="panel system-msg-panel">
      <div className="sys-header">
        <span className="sys-icon">◈</span>
        <span className="sys-skill">{skill.toUpperCase()}</span>
        <span className="sys-tag">SYSTEM</span>
      </div>
      <div className="sys-body">{msg}</div>
    </div>
  );
}
