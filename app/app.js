// Leonida Legend — GTA VI trophy guide & tracker.
// Plain ES module, no libraries, no network beyond the app's own data file:
// loads data/trophies.json from beside this file, keeps progress in
// localStorage, and renders the checklist, the filters, the spoiler shield
// and the platinum roadmap.

const EARNED_KEY = 'gta6-trophy-checklist';
const SETTINGS_KEY = 'gta6-trophy-guide-settings';
const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

const listEl = document.getElementById('trophy-list');
const roadmapEl = document.getElementById('roadmap-stages');
const missableEl = document.getElementById('missable-list');
const sourceListEl = document.getElementById('source-list');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const hideEarnedEl = document.getElementById('hide-earned');
const spoilerEl = document.getElementById('spoiler-shield');
const emptyEl = document.getElementById('empty-state');
const onlineNoteEl = document.getElementById('online-note');
const visibleCountEl = document.getElementById('visible-count');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byName = new Map(trophies.map((t) => [t.name, t]));

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
let settings = { spoiler: true };
try { settings = { ...settings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') }; } catch { /* keep defaults */ }
spoilerEl.checked = settings.spoiler !== false;

let activeKind = 'all';
const openGuides = new Set();

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spoiler: spoilerEl.checked }));
}

function isSpoilerMasked(t) {
  return spoilerEl.checked && t.hidden && t.kinds.includes('story') && !earned.has(t.name);
}

function kindMatches(t) {
  if (activeKind === 'all') return true;
  if (activeKind === 'missable') return t.missable === true;
  return t.kinds.includes(activeKind);
}

function trophyMatches(t) {
  if (!kindMatches(t)) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.name)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !`${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(q)) return false;
  return true;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sourceLink(key) {
  const s = doc.sources[key];
  if (!s) return null;
  if (s.url) {
    const a = el('a', null, s.name);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noreferrer';
    return a;
  }
  return el('span', null, s.name);
}

function renderCard(t) {
  const card = el('article', `trophy-card grade-${t.grade}${earned.has(t.name) ? ' earned' : ''}`);
  const head = el('div', 'card-head');
  const box = el('input', 'earn-box');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveEarned();
    render();
  });
  head.append(box);

  const main = el('div', 'card-main');
  const masked = isSpoilerMasked(t);
  const title = el('h3', 'trophy-name', masked ? 'Hidden story trophy' : t.name);
  if (masked) title.classList.add('spoiler-name');
  main.append(title);
  main.append(el('span', `badge grade-${t.grade}`, t.grade));
  if (t.hidden) main.append(el('span', 'badge hidden-badge', 'Hidden'));
  if (t.missable) main.append(el('span', 'badge missable-badge', 'Missable'));
  main.append(el('p', 'trophy-desc', masked ? 'Its name and description stay hidden until you earn it — or switch the spoiler shield off above.' : t.description));

  const meta = el('p', 'meta');
  for (const kind of t.kinds) {
    const tag = el('span', 'kind-tag', KIND_LABELS[kind] ?? kind);
    meta.append(tag);
  }
  const bits = [];
  if (t.count) bits.push(`tracks ${t.count.toLocaleString('en-US')}`);
  if (typeof t.rarity === 'number') bits.push(`Exophase launch-day earn rate ${t.rarity}%`);
  bits.push(`roadmap stage ${t.stage}`);
  meta.append(document.createTextNode(bits.join(' · ')));
  main.append(meta);

  const toggle = el('button', 'guide-toggle', openGuides.has(t.name) ? 'Hide guide ▴' : 'Guide & sources ▾');
  toggle.type = 'button';
  toggle.addEventListener('click', () => {
    if (openGuides.has(t.name)) openGuides.delete(t.name);
    else openGuides.add(t.name);
    render();
  });
  main.append(toggle);

  if (openGuides.has(t.name)) {
    const body = el('div', 'guide-body');
    if (masked) {
      body.append(el('p', 'guide-text', 'Spoiler shield is on: this guide appears once you earn the trophy, or when you switch the shield off.'));
    } else {
      body.append(el('p', 'guide-text', t.guide));
      if (t.missableNote) body.append(el('p', 'missable-note', `⚠ Missable: ${t.missableNote}`));
      const sources = el('p', 'sources', 'Sources: ');
      t.sources.forEach((key, i) => {
        if (i > 0) sources.append(document.createTextNode(' · '));
        const link = sourceLink(key);
        if (link) sources.append(link);
      });
      body.append(sources);
    }
    main.append(body);
  }

  head.append(main);
  card.append(head);
  return card;
}

function renderProgress() {
  const total = trophies.length;
  document.getElementById('progress-fill').style.width = `${(earned.size / total) * 100}%`;
  document.getElementById('progress-text').textContent = `${earned.size} of ${total} earned — ${Math.round((earned.size / total) * 100)}% of the way to Vice Got a Price!`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => earned.has(t.name)).length;
    return `${g}: ${got}/${all.length}`;
  });
  document.getElementById('grade-counts').textContent = parts.join(' · ');
}

function renderChecklist() {
  const visible = trophies.filter(trophyMatches);
  listEl.replaceChildren(...visible.map(renderCard));
  onlineNoteEl.hidden = activeKind !== 'online';
  if (activeKind === 'online') onlineNoteEl.textContent = doc.onlineNote;
  emptyEl.hidden = visible.length > 0 || activeKind === 'online';
  visibleCountEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
}

function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const stage of doc.roadmap) {
    const inStage = trophies.filter((t) => t.stage === stage.stage);
    const done = inStage.filter((t) => earned.has(t.name)).length;
    const box = el('section', 'stage');
    box.append(el('h3', null, `Stage ${stage.stage} — ${stage.title}`));
    box.append(el('p', 'stage-progress', `${done} of ${inStage.length} earned`));
    box.append(el('p', 'advice', stage.advice));
    const ul = el('ul');
    for (const t of inStage) {
      const li = el('li', earned.has(t.name) ? 'done' : null, `${t.name} (${t.grade})${t.missable ? ' — MISSABLE' : ''}`);
      ul.append(li);
    }
    box.append(ul);
    roadmapEl.append(box);
  }
  missableEl.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const box = el('section', 'stage');
    box.append(el('h3', null, `${t.name} (${t.grade})`));
    if (t.missableNote) box.append(el('p', 'missable-note', `⚠ ${t.missableNote}`));
    box.append(el('p', 'advice', t.guide));
    missableEl.append(box);
  }
}

function renderSources() {
  sourceListEl.replaceChildren();
  for (const key of Object.keys(doc.sources)) {
    const li = el('li');
    const link = sourceLink(key);
    if (link) li.append(link);
    sourceListEl.append(li);
  }
}

function render() {
  renderProgress();
  renderChecklist();
  renderRoadmap();
}

document.getElementById('kind-filters').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  activeKind = chip.dataset.kind;
  for (const c of document.querySelectorAll('.chip')) c.classList.toggle('active', c === chip);
  render();
});
searchEl.addEventListener('input', render);
gradeEl.addEventListener('change', render);
hideEarnedEl.addEventListener('change', render);
spoilerEl.addEventListener('change', () => { saveSettings(); render(); });

document.getElementById('tab-checklist').addEventListener('click', () => switchView('checklist'));
document.getElementById('tab-roadmap').addEventListener('click', () => switchView('roadmap'));
function switchView(view) {
  document.getElementById('checklist-view').hidden = view !== 'checklist';
  document.getElementById('roadmap-view').hidden = view !== 'roadmap';
  document.getElementById('toolbar').hidden = view !== 'checklist';
  document.getElementById('tab-checklist').classList.toggle('active', view === 'checklist');
  document.getElementById('tab-roadmap').classList.toggle('active', view === 'roadmap');
}

document.getElementById('export-progress').addEventListener('click', () => {
  const payload = JSON.stringify({ app: 'leonida-legend', version: 1, earned: [...earned] }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import-progress').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    earned = new Set(names.filter((n) => byName.has(n)));
    saveEarned();
    render();
  } catch {
    visibleCountEl.textContent = 'That file could not be read as a progress export.';
  }
  e.target.value = '';
});
document.getElementById('reset-progress').addEventListener('click', () => {
  if (!confirm('Clear every tick and start the checklist again?')) return;
  earned = new Set();
  saveEarned();
  render();
});

renderSources();
render();
