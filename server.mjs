import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execFile } from 'child_process';
import { lookup as dnsLookup } from 'dns';

const RITUAL_LOG = '/Users/harshpatel/memories/iamboss-ritual-log.md';
const HARSH_BRAIN = '/Users/harshpatel/harsh-brain';
const BACKUP_FILE = `${HARSH_BRAIN}/backups/iamboss-state.json`;
const PENDING_FLAG = `${HARSH_BRAIN}/backups/iamboss-pending-push`;
const GIT = '/usr/bin/git';

function writeRitualLog(rituals, quests = []) {
  if (rituals.length === 0) return;

  const appDates = new Set(rituals.map(r => r.date));
  const questLabel = {};
  for (const q of quests) questLabel[q.id] = q.label;

  // Preserve teacher-written entries for dates the app has no data for
  let preserved = '';
  if (existsSync(RITUAL_LOG)) {
    const existing = readFileSync(RITUAL_LOG, 'utf8');
    const sections = existing.split(/(?=^## \d{4}-\d{2}-\d{2})/m);
    for (const section of sections) {
      const match = section.match(/^## (\d{4}-\d{2}-\d{2})/);
      if (!match || appDates.has(match[1])) continue;
      preserved += section;
    }
  }

  const last14 = [...rituals].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  const lines = ['# IAMBOSS Ritual Log', '*Auto-synced after each ritual submit. Last 14 days.*', ''];

  for (const r of last14) {
    const done = r.quests.filter(q => q.status === 'done').length;
    const total = r.quests.length;
    const questDetail = r.quests.map(q => {
      const label = questLabel[q.questId] || q.questId;
      const mark = q.status === 'done' ? '✓' : q.status === 'honest' ? '~' : '✗';
      return `${mark} ${label}`;
    }).join(' | ');
    lines.push(`## ${r.date}`);
    lines.push(`- Mood: ${r.mood ?? '--'}/100 | Energy: ${r.energy ?? '--'}/100`);
    lines.push(`- Quests: ${done}/${total} done${questDetail ? ` — ${questDetail}` : ''}`);
    if (r.journal?.mattered?.trim()) lines.push(`- Mattered: ${r.journal.mattered.trim()}`);
    if (r.journal?.obstacle?.trim()) lines.push(`- Obstacle: ${r.journal.obstacle.trim()}`);
    if (r.journal?.tomorrow?.trim()) lines.push(`- Tomorrow: ${r.journal.tomorrow.trim()}`);
    lines.push('');
  }
  writeFileSync(RITUAL_LOG, lines.join('\n') + (preserved ? '\n' + preserved : ''));
}

function pushBackupToGitHub() {
  const date = new Date().toISOString().split('T')[0];
  execFile(GIT, ['-C', HARSH_BRAIN, 'add', 'backups/iamboss-state.json'], (addErr) => {
    if (addErr) { writeFileSync(PENDING_FLAG, ''); return; }
    execFile(GIT, ['-C', HARSH_BRAIN, 'commit', '-m', `iamboss backup ${date}`], () => {
      // ignore commit result — "nothing to commit" exits non-zero but is fine
      execFile(GIT, ['-C', HARSH_BRAIN, 'push', 'origin', 'main'], (pushErr) => {
        if (pushErr) {
          writeFileSync(PENDING_FLAG, '');
        } else if (existsSync(PENDING_FLAG)) {
          try { unlinkSync(PENDING_FLAG); } catch {}
        }
      });
    });
  });
}

// Retry pending push every 5 minutes when network is available
setInterval(() => {
  if (!existsSync(PENDING_FLAG)) return;
  dnsLookup('github.com', (err) => {
    if (err) return;
    pushBackupToGitHub();
  });
}, 5 * 60 * 1000);

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
};

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];

  // SPA fallback: any path without a file extension serves index.html
  if (!extname(urlPath)) urlPath = '/index.html';

  const filePath = join(DIST, urlPath);

  if (!existsSync(filePath)) {
    const indexPath = join(DIST, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(readFileSync(indexPath));
    return;
  }

  const ext = extname(filePath);
  // HTML: always revalidate. Hashed assets (JS/CSS): cache forever — safe because Vite changes the hash on every build.
  const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl,
  });
  res.end(readFileSync(filePath));
}

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && req.url === '/api/load-state') {
    if (existsSync(BACKUP_FILE)) {
      try {
        const state = JSON.parse(readFileSync(BACKUP_FILE, 'utf8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, state }));
      } catch {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false }));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false }));
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/save-state') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const state = JSON.parse(body);
        writeFileSync(BACKUP_FILE, JSON.stringify(state));
        pushBackupToGitHub();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/sync-ritual') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { rituals, quests } = JSON.parse(body);
        writeRitualLog(rituals, quests);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  try {
    serveStatic(req, res);
  } catch (err) {
    res.writeHead(500);
    res.end('Server error');
    console.error(err);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`IAMBOSS running at http://localhost:${PORT}`);
});
