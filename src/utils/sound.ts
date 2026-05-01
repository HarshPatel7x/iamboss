let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function osc(ac: AudioContext, type: OscillatorType, freq: number, start: number, end: number, gainPeak: number, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gainPeak, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  o.connect(g);
  g.connect(dest);
  o.start(start);
  o.stop(end + 0.01);
}

// Button hover — barely-there high-frequency pixel whisper
export function playHoverSound() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.06;
    master.connect(ac.destination);
    osc(ac, 'sine', 3200, t, t + 0.018, 0.5, master);
  } catch { /* blocked */ }
}

// Generic UI button click — tight digital "tick"
export function playClickSound() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.18;
    master.connect(ac.destination);
    osc(ac, 'sine', 1800, t, t + 0.04, 0.5, master);
    osc(ac, 'sine', 2400, t, t + 0.025, 0.25, master);
  } catch { /* blocked */ }
}

// Tab / navigation switch — brief two-tone sweep
export function playNavSound() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.22;
    master.connect(ac.destination);
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(500, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.09);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.6, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.15);
    osc(ac, 'sine', 1400, t + 0.06, t + 0.16, 0.2, master);
  } catch { /* blocked */ }
}

// Panel open — ascending activation whoosh
export function playOpenSound() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.2;
    master.connect(ac.destination);
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.18);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.28);
    osc(ac, 'sine', 2200, t + 0.12, t + 0.26, 0.15, master);
  } catch { /* blocked */ }
}

// Validation error / rejection — short descending pulse
export function playErrorSound() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.22;
    master.connect(ac.destination);
    osc(ac, 'square', 280, t, t + 0.06, 0.4, master);
    osc(ac, 'square', 210, t + 0.07, t + 0.14, 0.35, master);
  } catch { /* blocked */ }
}

// Quest incoming warning — ascending sci-fi ping with shimmer
export function playWarningBeep() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.35;
    master.connect(ac.destination);

    // Rising sweep — "system ping"
    const sweep = ac.createOscillator();
    const sweepGain = ac.createGain();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(600, t);
    sweep.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
    sweepGain.gain.setValueAtTime(0, t);
    sweepGain.gain.linearRampToValueAtTime(0.6, t + 0.015);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    sweep.connect(sweepGain);
    sweepGain.connect(master);
    sweep.start(t);
    sweep.stop(t + 0.2);

    // High shimmer overtone
    osc(ac, 'sine', 2800, t + 0.05, t + 0.22, 0.2, master);

    // Second ping slightly after — double confirmation tone
    const sweep2 = ac.createOscillator();
    const sg2 = ac.createGain();
    sweep2.type = 'sine';
    sweep2.frequency.setValueAtTime(800, t + 0.22);
    sweep2.frequency.exponentialRampToValueAtTime(1600, t + 0.32);
    sg2.gain.setValueAtTime(0, t + 0.22);
    sg2.gain.linearRampToValueAtTime(0.5, t + 0.235);
    sg2.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    sweep2.connect(sg2);
    sg2.connect(master);
    sweep2.start(t + 0.22);
    sweep2.stop(t + 0.4);

    osc(ac, 'sine', 3200, t + 0.27, t + 0.4, 0.15, master);
  } catch { /* browser audio blocked */ }
}

// Quest completed — short satisfying chime, positive reinforcement
export function playCompleteSound() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.28;
    master.connect(ac.destination);

    // Clean two-note chime: root → major third → fifth (arpeggio)
    [[0, 880], [0.08, 1108], [0.16, 1320]].forEach(([offset, freq]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, t + offset);
      g.gain.linearRampToValueAtTime(0.5, t + offset + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.22);
      o.connect(g);
      g.connect(master);
      o.start(t + offset);
      o.stop(t + offset + 0.25);
    });

    // Subtle shimmer on top
    osc(ac, 'sine', 2640, t + 0.16, t + 0.35, 0.12, master);
  } catch { /* browser audio blocked */ }
}

// Quest overdue alarm — harsh system alert like a Solo Leveling dungeon breach
export function playOverdueAlarm() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.4;
    master.connect(ac.destination);

    // Three rapid descending pulses — "ALERT ALERT ALERT"
    [0, 0.15, 0.30].forEach((offset, i) => {
      const s = t + offset;
      const freq = 880 - i * 80;

      // Square wave for harsh digital feel
      osc(ac, 'square', freq, s, s + 0.1, 0.3, master);
      // Sub layer for body
      osc(ac, 'sawtooth', freq / 2, s, s + 0.1, 0.15, master);
    });

    // Distorted downward sweep at the end — "system breach"
    const alarm = ac.createOscillator();
    const alarmGain = ac.createGain();
    alarm.type = 'sawtooth';
    alarm.frequency.setValueAtTime(660, t + 0.45);
    alarm.frequency.exponentialRampToValueAtTime(110, t + 0.75);
    alarmGain.gain.setValueAtTime(0, t + 0.45);
    alarmGain.gain.linearRampToValueAtTime(0.35, t + 0.46);
    alarmGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.78);
    alarm.connect(alarmGain);
    alarmGain.connect(master);
    alarm.start(t + 0.45);
    alarm.stop(t + 0.8);

    // High distortion layer on top of sweep
    osc(ac, 'square', 1320, t + 0.45, t + 0.6, 0.15, master);
  } catch { /* browser audio blocked */ }
}
