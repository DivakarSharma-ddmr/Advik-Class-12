/* ============================================================
   BoardBridge — app.js  (v4 — complete rewrite)
   CBSE Class XII · 2026-27 · DivakarSharma-ddmr
   ============================================================ */

'use strict';

/* ── Constants ──────────────────────────────────────────── */
const DATA           = window.CBSE_STUDY_DATA;
const CLAUDE_MODEL   = "claude-haiku-4-5-20251001";
const CLAUDE_ENDPOINT= "https://api.anthropic.com/v1/messages";
const EXAM_DATE      = new Date("2027-02-15T06:00:00");   // approx board exam start

/**
 * CLOUDFLARE WORKER PROXY
 * Set this to your Worker URL once you have deployed worker.js to Cloudflare.
 * Example: "https://boardbridge-proxy.yourname.workers.dev"
 * When set, no API key is needed in any browser — the Worker holds the key.
 * Leave as "" to fall back to the manual localStorage API key.
 */
const WORKER_URL = "https://boardbridge-proxy.divakar-sharma.workers.dev";

const CLAUDE_SYSTEM = `You are a dedicated CBSE Class XII study assistant for a student in New Delhi preparing for board exams in Feb–Mar 2027.

You ONLY help with these six subjects and their prescribed books:
• Legal Studies (074) — CBSE Legal Studies XII
• Psychology (037) — NCERT Psychology XII
• Economics (030) — NCERT Introductory Macroeconomics + Indian Economic Development
• Political Science (028) — NCERT Contemporary World Politics + Politics in India Since Independence
• English Core (301) — NCERT Flamingo, Vistas + Reading/Writing Skills
• Applied Art – Commercial Art (052) — CBSE Fine Arts / History of Indian Art

If asked about anything outside this scope, say: "I can only help with CBSE Class XII subjects for the 2026-27 curriculum."

For every answer:
1. Open with a clear, precise definition anchored to the NCERT/CBSE syllabus.
2. Elaborate with explanation, mechanism, or significance — 3-5 bullet points or short paragraphs.
3. Give a concrete real-world or textbook example.
4. End with the board-exam angle: how CBSE frames this topic (marks, typical question type, what the marking scheme rewards).
Use precise syllabus terminology. Keep answers thorough but focused — quality over length.`;

/* ── State ─────────────────────────────────────────────── */
const state = {
  subjectId   : DATA.subjects[0].id,
  chapterId   : null,
  tab         : "study",       // "study" | "quiz" | "test"
  quiz        : [],            // current quiz items
  paper       : null,          // generated test paper
  search      : "",
  chat        : [],            // [{role, text}]
  deferredInstall: null,
  sourceCache : new Map()
};

/* ── Helpers ────────────────────────────────────────────── */
function getApiKey()  { return localStorage.getItem("boardbridge_api_key") || ""; }
function hasApiKey()  { return Boolean(WORKER_URL) || Boolean(getApiKey()); }
function usingWorker(){ return Boolean(WORKER_URL); }

function allChapters() {
  return DATA.subjects.flatMap(s => s.books.flatMap(b => b.chapters).map(c => ({...c, _subject: s})));
}
function getSubject(id) { return DATA.subjects.find(s => s.id === id); }
function getChapter(subj, chId) {
  return subj?.books.flatMap(b => b.chapters).find(c => c.id === chId);
}
function currentSubject() { return getSubject(state.subjectId); }
function currentChapter() { return getChapter(currentSubject(), state.chapterId); }

function daysUntilExam() {
  const diff = EXAM_DATE - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function nl2p(str) {
  return str.split(/\n\n+/).map(p => `<p>${escHtml(p).replace(/\n/g,"<br>")}</p>`).join("");
}

/* ── Claude API ─────────────────────────────────────────── */
/**
 * Call Claude via:
 *   1. Cloudflare Worker (WORKER_URL set) — no browser key needed
 *   2. Direct Anthropic API (localStorage key) — fallback / dev mode
 */
async function callClaude(userMessage, context = "") {
  const messages = context
    ? [{ role: "user", content: `Context:\n${context}\n\nQuestion: ${userMessage}` }]
    : [{ role: "user", content: userMessage }];

  const payload = { model: CLAUDE_MODEL, max_tokens: 1024, system: CLAUDE_SYSTEM, messages };

  /* ── Route 1: Cloudflare Worker proxy (preferred) ── */
  if (WORKER_URL) {
    const res = await fetch(WORKER_URL, {
      method : "POST",
      headers: { "content-type": "application/json" },
      body   : JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Worker error ${res.status}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "(No response)";
  }

  /* ── Route 2: Direct browser → Anthropic (requires saved API key) ── */
  const key = getApiKey();
  if (!key) throw new Error("NO_KEY");

  const res = await fetch(CLAUDE_ENDPOINT, {
    method : "POST",
    headers: {
      "content-type"                             : "application/json",
      "x-api-key"                                : key,
      "anthropic-version"                        : "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "(No response)";
}

/* ── Web source fetching (Jina.ai) ─────────────────────── */
async function fetchSourceBundle(query) {
  if (state.sourceCache.has(query)) return state.sourceCache.get(query);
  const urls = buildSourceUrls(query);
  const fetches = urls.slice(0, 3).map(u =>
    fetch(`https://r.jina.ai/${u}`)
      .then(r => r.ok ? r.text() : "")
      .catch(() => "")
  );
  const results  = await Promise.all(fetches);
  const combined = results.map((t, i) => t ? `[Source ${i+1}: ${urls[i]}]\n${t.slice(0, 1200)}` : "").filter(Boolean).join("\n\n");
  state.sourceCache.set(query, combined);
  return combined;
}

function buildSourceUrls(query) {
  const q = encodeURIComponent(query + " CBSE Class 12 NCERT");
  return [
    `https://ncert.nic.in/textbook.php`,
    `https://cbseacademic.nic.in/curriculum_2027.html`,
    `https://www.google.com/search?q=${q}`
  ];
}

/* ================================================================
   RENDER ENGINE
   ================================================================ */

/* ── Sidebar ────────────────────────────────────────────── */
function renderSidebar() {
  const nav = document.getElementById("subject-nav");
  if (!nav) return;
  nav.innerHTML = DATA.subjects.map(s => `
    <button class="nav-subject ${s.id === state.subjectId ? "active" : ""}"
            data-subject="${s.id}"
            style="--sc:${s.color};--scs:${s.colorSoft}">
      <span class="nav-icon">${s.icon}</span>
      <span class="nav-label">${s.name}</span>
    </button>`).join("");

  nav.querySelectorAll(".nav-subject").forEach(btn => {
    btn.addEventListener("click", () => {
      state.subjectId = btn.dataset.subject;
      state.chapterId = null;
      state.tab = "study";
      state.paper = null;
      state.quiz  = [];
      renderSidebar();
      renderPage();
      closeSidebar();
    });
  });
}

/* ── Countdown ──────────────────────────────────────────── */
function renderCountdown() {
  const el = document.getElementById("exam-countdown");
  if (!el) return;
  const d = daysUntilExam();
  el.textContent = d > 0 ? `${d} days to boards` : "Board exams ongoing!";
}

/* ── Page router ────────────────────────────────────────── */
function renderPage() {
  const pc = document.getElementById("page-content");
  if (!pc) return;
  if (state.search.length >= 2) {
    pc.innerHTML = renderSearch();
    attachSearchEvents();
    return;
  }
  if (!state.chapterId) {
    pc.innerHTML = renderSubjectHome();
    attachSubjectHomeEvents();
    return;
  }
  pc.innerHTML = renderChapterView();
  attachChapterEvents();
}

/* ── Subject home (chapter cards) ──────────────────────── */
function renderSubjectHome() {
  const s = currentSubject();
  const totalChapters = s.books.flatMap(b => b.chapters).length;
  return `
  <div class="subject-hero" style="--sc:${s.color};--scs:${s.colorSoft}">
    <div class="hero-icon">${s.icon}</div>
    <div class="hero-body">
      <div class="hero-code">Code ${s.code} · Theory ${s.theoryMarks}M + Practical ${s.practicalMarks}M</div>
      <h1 class="hero-title">${s.name}</h1>
      <p class="hero-sub">${totalChapters} chapters · Exam: Feb–Mar 2027</p>
    </div>
  </div>

  <div class="chapter-grid">
    ${s.books.flatMap(b => b.chapters).map(ch => `
      <button class="chapter-card" data-chapter="${ch.id}" style="--sc:${s.color}">
        <div class="chapter-card-unit">${ch.unit || ""}</div>
        <div class="chapter-card-title">${ch.title}</div>
        <div class="chapter-card-hook">${ch.hook || ""}</div>
        <div class="chapter-card-meta">
          <span>${ch.topics?.length || 0} topics</span>
          <span>${ch.pastYearQs?.length || 0} board Qs</span>
          <span>${ch.marks || "—"}M</span>
        </div>
      </button>`).join("")}
  </div>`;
}

function attachSubjectHomeEvents() {
  document.querySelectorAll(".chapter-card").forEach(btn => {
    btn.addEventListener("click", () => {
      state.chapterId = btn.dataset.chapter;
      state.tab = "study";
      state.quiz  = [];
      state.paper = null;
      renderPage();
    });
  });
}

/* ── Chapter view ───────────────────────────────────────── */
function renderChapterView() {
  const s = currentSubject();
  const ch = currentChapter();
  if (!ch) return `<p class="empty-state">Chapter not found.</p>`;
  return `
  <div class="chapter-hero" style="--sc:${s.color}">
    <button class="back-btn" id="back-to-subject">← ${s.name}</button>
    <div class="chapter-hero-body">
      <div class="chapter-unit-badge">${ch.unit || ""}</div>
      <h2 class="chapter-hero-title">${ch.title}</h2>
      <p class="chapter-hero-hook">${ch.hook || ""}</p>
    </div>
  </div>

  <div class="tab-bar">
    <button class="tab-btn ${state.tab==="study"?"active":""}" data-tab="study">📖 Study</button>
    <button class="tab-btn ${state.tab==="quiz" ?"active":""}" data-tab="quiz" >✏️ Pop Quiz</button>
    <button class="tab-btn ${state.tab==="test" ?"active":""}" data-tab="test" >📄 Test Paper</button>
  </div>

  <div class="tab-content" id="tab-content">
    ${renderTab()}
  </div>`;
}

function renderTab() {
  switch (state.tab) {
    case "study": return renderStudyTab();
    case "quiz":  return renderQuizTab();
    case "test":  return renderTestTab();
    default:      return "";
  }
}

function attachChapterEvents() {
  document.getElementById("back-to-subject")?.addEventListener("click", () => {
    state.chapterId = null;
    renderPage();
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.tab = btn.dataset.tab;
      if (state.tab === "quiz" && state.quiz.length === 0) buildQuiz();
      renderPage();
    });
  });

  attachTabSpecificEvents();
}

function attachTabSpecificEvents() {
  switch (state.tab) {
    case "study": attachStudyEvents(); break;
    case "quiz":  attachQuizEvents();  break;
    case "test":  attachTestEvents();  break;
  }
}

/* ================================================================
   STUDY TAB
   ================================================================ */
function renderStudyTab() {
  const ch = currentChapter();
  const s  = currentSubject();
  const topics = ch.topics || [];
  const moves  = ch.boardMoves || [];

  return `
  <div class="study-wrap">
    <div class="study-sidebar-box" style="--sc:${s.color}">
      <h3>Key Topics</h3>
      <ul class="topic-list">
        ${topics.map(t => `<li>${escHtml(t)}</li>`).join("")}
      </ul>
      ${moves.length ? `
      <h3 style="margin-top:1.2rem">Board Moves 🎯</h3>
      <ul class="topic-list board-moves">
        ${moves.map(m => `<li>${escHtml(m)}</li>`).join("")}
      </ul>` : ""}
    </div>

    <div class="concept-list">
      ${topics.map((topic, i) => `
        <details class="concept-item" id="concept-${i}">
          <summary class="concept-summary" style="--sc:${s.color}">
            <span class="concept-num">${i+1}</span>
            <span class="concept-title">${escHtml(topic)}</span>
            <span class="concept-arrow">›</span>
          </summary>
          <div class="concept-body" id="concept-body-${i}">
            <div class="concept-placeholder">
              <p>Click "Explain with AI" to get a thorough board-focused explanation of <strong>${escHtml(topic)}</strong>.</p>
              <button class="btn-explain-ai" data-topic="${escHtml(topic)}" data-idx="${i}" style="--sc:${s.color}">
                ✦ Explain with AI
              </button>
            </div>
          </div>
        </details>`).join("")}
    </div>
  </div>`;
}

function attachStudyEvents() {
  document.querySelectorAll(".btn-explain-ai").forEach(btn => {
    btn.addEventListener("click", async () => {
      const topic = btn.dataset.topic;
      const idx   = btn.dataset.idx;
      const body  = document.getElementById(`concept-body-${idx}`);
      if (!body) return;

      body.innerHTML = `<div class="ai-loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span> Generating explanation…</div>`;

      try {
        if (!hasApiKey()) throw new Error("NO_KEY");
        const ch = currentChapter();
        const s  = currentSubject();
        const prompt = `Explain "${topic}" from the chapter "${ch.title}" in ${s.name} (CBSE Class XII).
Cover: definition, key concepts, mechanism/significance, real-world or textbook example, and how CBSE frames this in board exams.
Format your response clearly with headings and bullet points where appropriate.`;
        const answer = await callClaude(prompt);
        body.innerHTML = formatAiText(answer);
      } catch (e) {
        if (e.message === "NO_KEY") {
          body.innerHTML = `<div class="no-key-msg">
            <p>Add your Anthropic API key in <strong>Settings ⚙</strong> to get AI explanations.</p>
            <p class="topic-static-note">Meanwhile, refer to your NCERT textbook for: <em>${escHtml(topic)}</em></p>
          </div>`;
        } else {
          body.innerHTML = `<p class="error-msg">Error: ${escHtml(e.message)}</p>`;
        }
      }
    });
  });
}

/* ================================================================
   QUIZ TAB
   ================================================================ */
function buildQuiz() {
  const ch = currentChapter();
  const pyqs = ch.pastYearQs || [];
  state.quiz = shuffle(pyqs).map(q => ({ ...q, revealed: false, _aiGen: false }));
}

function renderQuizTab() {
  const ch = currentChapter();
  if (!state.quiz.length && ch.pastYearQs?.length) buildQuiz();
  const items = state.quiz;
  const s = currentSubject();

  if (!items.length) return `
    <div class="empty-state">
      <p>No questions yet for this chapter.</p>
      ${hasApiKey() ? `<button class="btn-explain-ai" id="quiz-ai-gen" style="--sc:${s.color};margin-top:14px">
        ✦ Generate AI Questions
      </button>` : ""}
    </div>`;

  return `
  <div class="quiz-wrap">
    <div class="quiz-header">
      <span class="quiz-count">${items.length} question${items.length>1?"s":""}${items[0]?._aiGen?" · AI-generated":" · past board papers"}</span>
      <div class="quiz-btns">
        <button class="btn-ghost-sm" id="quiz-refresh" title="Shuffle existing questions">🔀 Shuffle</button>
        <button class="btn-ghost-sm quiz-ai-btn" id="quiz-ai-gen" title="${hasApiKey()?"Generate fresh questions via AI":"Add API key to generate AI questions"}" ${hasApiKey()?"":"disabled"}>
          ✦ New AI Questions
        </button>
      </div>
    </div>
    ${items.map((item, i) => `
      <div class="q-card" id="qcard-${i}">
        <div class="q-meta">
          ${item.year ? `<span class="q-year">${item.year}</span>` : ""}
          ${item._aiGen ? `<span class="q-year" style="background:#ede9fe;color:#7c3aed">AI</span>` : ""}
          <span class="q-marks">${item.marks} mark${item.marks>1?"s":""}</span>
        </div>
        <div class="q-text">${escHtml(item.q)}</div>
        <div class="answer-reveal ${item.revealed ? "open" : ""}" id="ans-${i}">
          <div class="answer-inner">
            <div class="answer-label">✔ Model Answer</div>
            <div class="answer-body">${nl2p(item.a)}</div>
          </div>
        </div>
        <button class="btn-reveal ${item.revealed ? "active" : ""}" data-idx="${i}" style="--sc:${s.color}">
          ${item.revealed ? "Hide Answer ↑" : "Show Answer ↓"}
        </button>
      </div>`).join("")}
  </div>`;
}

async function generateAiQuizQuestions() {
  const ch  = currentChapter();
  const s   = currentSubject();
  const btn = document.getElementById("quiz-ai-gen");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Generating…"; }

  const tc  = document.getElementById("tab-content");
  if (tc) {
    tc.insertAdjacentHTML("afterbegin",
      `<div class="ai-loading" id="quiz-gen-indicator" style="padding:14px 0">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        &nbsp;Asking Claude to write fresh board-style questions…
      </div>`);
  }

  try {
    const marks = s.pattern?.questionMarks || [1, 3, 5];
    const mixDesc = marks.map(m => `one ${m}-mark question`).join(", ");
    const prompt =
`Generate ${marks.length + 2} CBSE Class 12 board-exam-style questions for the chapter "${ch.title}" in ${s.name}.
Include a variety: ${mixDesc}, plus one more of any type.
These must be ORIGINAL — not the same as past papers. They should test conceptual understanding and application.

Respond ONLY with a JSON array in this exact format (no markdown, no explanation):
[
  {"marks": 1, "q": "Question text", "a": "Complete model answer"},
  {"marks": 3, "q": "Question text", "a": "Complete model answer"},
  ...
]`;

    const response = await callClaude(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI response as questions.");
    const newQs = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(newQs) || !newQs.length) throw new Error("Empty question list.");
    state.quiz = newQs.map(q => ({ ...q, revealed: false, _aiGen: true }));
    renderPage();
  } catch (e) {
    document.getElementById("quiz-gen-indicator")?.remove();
    if (btn) { btn.disabled = false; btn.textContent = "✦ New AI Questions"; }
    const msg = e.message === "NO_KEY"
      ? "Add your Anthropic API key in ⚙ Settings to generate AI questions."
      : `Error: ${e.message}`;
    alert(msg);
  }
}

function attachQuizEvents() {
  document.getElementById("quiz-refresh")?.addEventListener("click", () => {
    buildQuiz();
    renderPage();
  });
  document.getElementById("quiz-ai-gen")?.addEventListener("click", generateAiQuizQuestions);

  document.querySelectorAll(".btn-reveal").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.idx);
      state.quiz[i].revealed = !state.quiz[i].revealed;
      const ans = document.getElementById(`ans-${i}`);
      if (!ans) return;
      ans.classList.toggle("open", state.quiz[i].revealed);
      btn.textContent = state.quiz[i].revealed ? "Hide Answer ↑" : "Show Answer ↓";
      btn.classList.toggle("active", state.quiz[i].revealed);
    });
  });
}

/* ================================================================
   TEST PAPER TAB
   ================================================================ */

/* CBSE-approximate mark-weight fractions (sum doesn't need to be 1) */
const CBSE_MARK_WEIGHT = { 1:0.20, 2:0.15, 3:0.25, 4:0.20, 5:0.25, 6:0.20 };

/* Preset marks for each duration (CBSE standard) */
const DURATION_MARKS = { 60: 30, 120: 60, 180: 80 };

function renderTestTab() {
  const s        = currentSubject();
  const allChaps = s.books.flatMap(b => b.chapters);
  const validMarks = (s.pattern?.questionMarks || [1,2,3,5]);

  if (!state.paper) {
    return `
    <div class="test-config">
      <h3 class="config-title">Build Your Test Paper</h3>

      <div class="config-section">
        <label class="config-label">Duration</label>
        <div class="radio-group" id="duration-group">
          ${Object.entries(DURATION_MARKS).map(([d, m]) => `
            <label class="radio-pill">
              <input type="radio" name="duration" value="${d}" data-marks="${m}" ${d==="180"?"checked":""}>
              ${d==="60"?"1 Hour":d==="120"?"2 Hours":"3 Hours"}
            </label>`).join("")}
        </div>
      </div>

      <div class="config-section">
        <label class="config-label">Total Marks</label>
        <div class="marks-preset-row">
          <span class="marks-preset-note">Board standard for selected duration:</span>
          <strong class="marks-preset-val" id="marks-preset-val">80 marks</strong>
        </div>
        <div class="custom-marks-row">
          <label class="custom-marks-label">Override (leave blank to use standard):</label>
          <input type="number" id="custom-marks" min="10" max="200"
                 placeholder="e.g. 40" class="custom-marks-input">
          <span class="custom-marks-hint">marks</span>
        </div>
      </div>

      <div class="config-section">
        <label class="config-label">Question Types to Include</label>
        <div class="check-group">
          ${validMarks.map(m => `
            <label class="check-pill">
              <input type="checkbox" name="marks" value="${m}" checked>
              ${m}-mark
            </label>`).join("")}
        </div>
        <p class="config-hint">Questions will be distributed proportionally across selected types following CBSE pattern.</p>
      </div>

      <div class="config-section">
        <label class="config-label">Chapters to Include</label>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <button class="btn-ghost-sm" id="select-all-chaps">Select all</button>
          <button class="btn-ghost-sm" id="deselect-all-chaps">Deselect all</button>
        </div>
        <div class="check-group chapter-checks">
          ${allChaps.map(ch => `
            <label class="check-pill ${ch.id === state.chapterId ? "current" : ""}">
              <input type="checkbox" name="chapters" value="${ch.id}" checked>
              ${escHtml(ch.title)}
            </label>`).join("")}
        </div>
      </div>

      <button class="btn-primary generate-btn" id="generate-paper" style="--sc:${s.color}">
        Generate Test Paper →
      </button>
    </div>`;
  }

  return renderPaperView();
}

function attachTestEvents() {
  if (!state.paper) {
    /* Update "Board standard" display when duration radio changes */
    document.querySelectorAll('input[name="duration"]').forEach(radio => {
      radio.addEventListener("change", () => {
        const presetEl = document.getElementById("marks-preset-val");
        if (presetEl) presetEl.textContent = `${radio.dataset.marks} marks`;
      });
    });

    /* Select All / Deselect All chapters */
    document.getElementById("select-all-chaps")?.addEventListener("click", () => {
      document.querySelectorAll('input[name="chapters"]').forEach(cb => { cb.checked = true; });
    });
    document.getElementById("deselect-all-chaps")?.addEventListener("click", () => {
      document.querySelectorAll('input[name="chapters"]').forEach(cb => { cb.checked = false; });
    });

    document.getElementById("generate-paper")?.addEventListener("click", generatePaper);
    return;
  }
  attachPaperEvents();
}

function generatePaper() {
  const s        = currentSubject();
  const allChaps = s.books.flatMap(b => b.chapters);
  const duration = parseInt(document.querySelector('input[name="duration"]:checked')?.value || "180");
  const markVals = [...document.querySelectorAll('input[name="marks"]:checked')].map(i => parseInt(i.value));
  const chapIds  = [...document.querySelectorAll('input[name="chapters"]:checked')].map(i => i.value);

  /* Determine target marks — use custom override if valid, else CBSE standard */
  const customVal  = parseInt(document.getElementById("custom-marks")?.value || "");
  const targetMarks = (customVal >= 10 && customVal <= 200)
    ? customVal
    : (DURATION_MARKS[duration] || 80);

  const selectedChaps = allChaps.filter(c => chapIds.includes(c.id));
  if (!selectedChaps.length) { alert("Please select at least one chapter."); return; }
  if (!markVals.length)      { alert("Please select at least one question type."); return; }

  /* ── Build shuffled question pools per mark type ── */
  const pools = {};
  markVals.forEach(m => {
    pools[m] = shuffle(
      selectedChaps.flatMap(ch =>
        (ch.pastYearQs || []).filter(q => q.marks === m).map(q => ({...q, _chapter: ch.title}))
      )
    );
  });

  /* ── Proportional allocation using CBSE_MARK_WEIGHT ── */
  const totalWeight = markVals.reduce((sum, m) => sum + (CBSE_MARK_WEIGHT[m] || 0.20), 0);
  const targetPerType = {};
  markVals.forEach(m => {
    const normWeight = (CBSE_MARK_WEIGHT[m] || 0.20) / totalWeight;
    const raw        = (targetMarks * normWeight) / m;
    targetPerType[m] = Math.max(1, Math.round(raw));
  });

  /* ── Cap at available pool size ── */
  markVals.forEach(m => {
    targetPerType[m] = Math.min(targetPerType[m], pools[m].length || 0);
  });

  /* ── Pick questions ── */
  const picked = {};
  markVals.forEach(m => { picked[m] = pools[m].slice(0, targetPerType[m]); });

  let total = markVals.reduce((sum, m) => sum + picked[m].length * m, 0);

  /* ── Fine-tune: add questions to approach target ── */
  const byMarkDesc = [...markVals].sort((a, b) => b - a);
  for (let iter = 0; iter < 30 && total < targetMarks - 1; iter++) {
    let added = false;
    for (const m of byMarkDesc) {
      if (total + m <= targetMarks && picked[m].length < pools[m].length) {
        picked[m].push(pools[m][picked[m].length]);
        total += m;
        added = true;
        break;
      }
    }
    if (!added) break;
  }

  /* ── Fine-tune: remove to not exceed target too much ── */
  const byMarkAsc = [...markVals].sort((a, b) => a - b);
  for (let iter = 0; iter < 30 && total > targetMarks + 1; iter++) {
    let removed = false;
    for (const m of byMarkAsc) {
      if (picked[m].length > 1) {
        picked[m].pop();
        total -= m;
        removed = true;
        break;
      }
    }
    if (!removed) break;
  }

  /* ── Flatten in ascending mark order ── */
  const questions = [...markVals].sort((a, b) => a - b).flatMap(m => picked[m]);

  if (!questions.length) {
    alert("No questions found for the selected chapters and question types. Try selecting more chapters.");
    return;
  }

  state.paper = { duration, targetMarks, markVals, chapIds, questions, total, subject: s.name };
  renderPage();
}

function renderPaperView() {
  const p = state.paper;
  const s = currentSubject();
  const sectionsByMarks = {};
  p.questions.forEach(q => {
    if (!sectionsByMarks[q.marks]) sectionsByMarks[q.marks] = [];
    sectionsByMarks[q.marks].push(q);
  });
  const sectionLetters = "ABCDEFGH";
  let secIdx = 0;

  const sections = Object.keys(sectionsByMarks).sort((a,b)=>a-b).map(marks => {
    const qs = sectionsByMarks[marks];
    const letter = sectionLetters[secIdx++];
    return { letter, marks: parseInt(marks), qs };
  });

  return `
  <div class="paper-wrap" id="paper-wrap">
    <div class="paper-sheet" id="paper-sheet">
      <div class="paper-header">
        <div class="paper-school">BOARDBRIDGE PRACTICE TEST</div>
        <div class="paper-subject">${escHtml(p.subject)} — Class XII</div>
        <div class="paper-meta-row">
          <span>Time: ${p.duration===60?"1 Hour":p.duration===120?"2 Hours":"3 Hours"}</span>
          <span>Total Marks: ${p.total}</span>
          <span>Date: ${new Date().toLocaleDateString("en-IN")}</span>
        </div>
        <div class="paper-instructions">
          <strong>General Instructions:</strong> All questions are compulsory unless otherwise stated. Follow CBSE marking scheme. Write in neat, legible handwriting. Marks are indicated against each question.
        </div>
      </div>

      ${sections.map(sec => `
        <div class="paper-section">
          <div class="paper-section-head">Section ${sec.letter} — ${sec.marks} Mark${sec.marks>1?"s":""} Each</div>
          ${sec.qs.map((q, i) => `
            <div class="paper-q" id="pq-${sec.letter}-${i}">
              <div class="paper-q-num">Q${i+1}.</div>
              <div class="paper-q-body">
                <div class="paper-q-text">${escHtml(q.q)}</div>
                <div class="paper-q-meta">
                  ${q._chapter ? `<span class="chapter-tag">${escHtml(q._chapter)}</span>` : ""}
                  ${q.year ? `<span class="year-tag">${q.year}</span>` : ""}
                  <span class="marks-tag">[${q.marks} mark${q.marks>1?"s":""}]</span>
                </div>
                <div class="answer-reveal" id="pa-${sec.letter}-${i}">
                  <div class="answer-inner">
                    <div class="answer-label">✔ Model Answer</div>
                    <div class="answer-body" id="pa-body-${sec.letter}-${i}">${nl2p(q.a)}</div>
                  </div>
                </div>
              </div>
            </div>`).join("")}
        </div>`).join("")}
    </div>

    <div class="paper-actions">
      <button class="btn-primary" id="show-all-answers" style="--sc:${s.color}">Show All Answers</button>
      <button class="btn-ghost"   id="hide-all-answers">Hide Answers</button>
      <button class="btn-ghost"   id="download-pdf">⬇ Download PDF</button>
      <button class="btn-ghost"   id="new-paper">↺ New Paper</button>
    </div>
  </div>`;
}

function attachPaperEvents() {
  document.getElementById("show-all-answers")?.addEventListener("click", () => {
    document.querySelectorAll(".paper-wrap .answer-reveal").forEach(el => el.classList.add("open"));
  });
  document.getElementById("hide-all-answers")?.addEventListener("click", () => {
    document.querySelectorAll(".paper-wrap .answer-reveal").forEach(el => el.classList.remove("open"));
  });
  document.getElementById("new-paper")?.addEventListener("click", () => {
    state.paper = null;
    renderPage();
  });
  document.getElementById("download-pdf")?.addEventListener("click", downloadPdf);
}

/* ================================================================
   PDF DOWNLOAD
   ================================================================ */
function downloadPdf() {
  const p = state.paper;
  if (!p || !window.jspdf) { alert("PDF library not loaded yet. Please try again."); return; }
  const { jsPDF } = window.jspdf;
  const doc  = new jsPDF({ unit: "mm", format: "a4" });
  const W    = 210, H = 297;
  const ML   = 15, MR = 15, MT = 20;
  let y      = MT;
  const lw   = W - ML - MR;

  function addText(text, opts = {}) {
    const { size=11, bold=false, color=[30,30,30], indent=0, center=false } = opts;
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const x = center ? W/2 : ML + indent;
    const align = center ? "center" : "left";
    const lines = doc.splitTextToSize(String(text), lw - indent);
    lines.forEach(line => {
      if (y > H - 20) { doc.addPage(); y = MT; }
      doc.text(line, x, y, { align });
      y += size * 0.45;
    });
    y += 2;
  }

  addText("BOARDBRIDGE PRACTICE TEST", { size:14, bold:true, center:true, color:[30,30,110] });
  addText(`${p.subject} — Class XII`, { size:12, center:true });
  addText(`Time: ${p.duration===60?"1 Hr":p.duration===120?"2 Hrs":"3 Hrs"}   |   Total Marks: ${p.total}   |   Date: ${new Date().toLocaleDateString("en-IN")}`, { size:9, center:true, color:[100,100,100] });
  y += 4;
  doc.setDrawColor(180,180,180);
  doc.line(ML, y, W-MR, y); y += 6;

  const sectionsByMarks = {};
  p.questions.forEach(q => {
    if (!sectionsByMarks[q.marks]) sectionsByMarks[q.marks] = [];
    sectionsByMarks[q.marks].push(q);
  });
  const letters = "ABCDEFGH";
  let si = 0;

  Object.keys(sectionsByMarks).sort((a,b)=>a-b).forEach(marks => {
    const qs = sectionsByMarks[marks];
    const letter = letters[si++];
    addText(`Section ${letter} — ${marks} Mark${marks>1?"s":""} Each`, { size:11, bold:true, color:[60,60,140] });
    y += 1;
    qs.forEach((q, i) => {
      addText(`Q${i+1}. ${q.q}`, { size:10, indent:2 });
      addText(`[${q.marks} mark${q.marks>1?"s":""}]${q.year ? " · "+q.year : ""}`, { size:8, indent:4, color:[120,120,120] });
      y += 3;
      addText("Model Answer:", { size:9, bold:true, indent:4, color:[0,100,0] });
      addText(q.a, { size:9, indent:4, color:[30,70,30] });
      y += 4;
      doc.setDrawColor(220,220,220);
      doc.line(ML+4, y, W-MR-4, y); y += 5;
    });
    y += 3;
  });

  doc.save(`BoardBridge_${p.subject.replace(/\s+/g,"-")}_${Date.now()}.pdf`);
}

/* ================================================================
   SEARCH
   ================================================================ */
function renderSearch() {
  const q = state.search.toLowerCase();
  const results = allChapters().filter(ch =>
    ch.title.toLowerCase().includes(q) ||
    (ch.topics||[]).some(t => t.toLowerCase().includes(q)) ||
    (ch.hook||"").toLowerCase().includes(q)
  );

  return `
  <div class="search-results">
    <h2 class="search-heading">Results for "${escHtml(state.search)}"</h2>
    ${results.length ? results.map(ch => `
      <button class="search-result-card" data-subject="${ch._subject.id}" data-chapter="${ch.id}">
        <div class="src-meta">${escHtml(ch._subject.name)} · ${ch.unit||""}</div>
        <div class="src-title">${escHtml(ch.title)}</div>
        <div class="src-hook">${escHtml(ch.hook||"")}</div>
      </button>`).join("")
    : `<p class="empty-state">No chapters match "<em>${escHtml(state.search)}</em>". Try a broader term.</p>`}
  </div>`;
}

function attachSearchEvents() {
  document.querySelectorAll(".search-result-card").forEach(btn => {
    btn.addEventListener("click", () => {
      state.subjectId  = btn.dataset.subject;
      state.chapterId  = btn.dataset.chapter;
      state.tab        = "study";
      state.search     = "";
      document.getElementById("global-search").value = "";
      renderSidebar();
      renderPage();
    });
  });
}

/* ================================================================
   FLOATING AI CHAT
   ================================================================ */
function initChat() {
  const trigger = document.getElementById("ai-trigger");
  const panel   = document.getElementById("ai-panel");
  const closeBtn= document.getElementById("ai-close");
  const input   = document.getElementById("ai-input");
  const sendBtn = document.getElementById("ai-send");

  if (!trigger || !panel) return;

  trigger.addEventListener("click", () => {
    const open = panel.getAttribute("aria-hidden") === "false";
    panel.setAttribute("aria-hidden", open ? "true" : "false");
    panel.classList.toggle("open", !open);
    trigger.classList.toggle("active", !open);
    if (!open) input?.focus();
  });

  closeBtn?.addEventListener("click", () => {
    panel.setAttribute("aria-hidden", "true");
    panel.classList.remove("open");
    trigger.classList.remove("active");
  });

  sendBtn?.addEventListener("click", sendChatMessage);
  input?.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });
}

async function sendChatMessage() {
  const input = document.getElementById("ai-input");
  const msgs  = document.getElementById("ai-messages");
  if (!input || !msgs) return;

  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  /* Append user message */
  appendChatMsg("user", text);

  /* Typing indicator */
  const typingId = "typing-" + Date.now();
  msgs.insertAdjacentHTML("beforeend", `
    <div class="ai-msg bot-msg typing-indicator" id="${typingId}">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>`);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    if (!hasApiKey()) throw new Error("NO_KEY");

    /* Fetch web sources for context */
    const subLabel = currentSubject()?.name || "CBSE XII";
    const context  = await fetchSourceBundle(`${text} ${subLabel}`).catch(() => "");
    const answer   = await callClaude(text, context);

    document.getElementById(typingId)?.remove();
    appendChatMsg("bot", answer);
  } catch (e) {
    document.getElementById(typingId)?.remove();
    if (e.message === "NO_KEY") {
      appendChatMsg("bot", "I need an Anthropic API key to answer. Tap ⚙ Settings (sidebar) and add your key from console.anthropic.com.");
    } else {
      appendChatMsg("bot", `Sorry, I ran into an error: ${e.message}`);
    }
  }
  msgs.scrollTop = msgs.scrollHeight;
}

function appendChatMsg(role, text) {
  const msgs = document.getElementById("ai-messages");
  if (!msgs) return;
  const cls  = role === "user" ? "user-msg" : "bot-msg";
  const body = role === "bot" ? formatAiText(text) : `<p>${escHtml(text)}</p>`;
  msgs.insertAdjacentHTML("beforeend", `<div class="ai-msg ${cls}">${body}</div>`);
  msgs.scrollTop = msgs.scrollHeight;
}

function formatAiText(text) {
  /* Convert markdown-ish AI output to readable HTML */
  let html = escHtml(text);
  /* Bold: **text** */
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  /* Headers: lines starting with # */
  html = html.replace(/^###\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^##\s+(.+)$/gm,  "<h3>$1</h3>");
  html = html.replace(/^#\s+(.+)$/gm,   "<h3>$1</h3>");
  /* Bullet points */
  html = html.replace(/^[•\-\*]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  /* Numbered list */
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
  /* Paragraphs: double newline */
  html = html.replace(/\n\n+/g, "</p><p>");
  html = html.replace(/\n/g, "<br>");
  return `<p>${html}</p>`;
}

/* ================================================================
   SETTINGS PANEL
   ================================================================ */
function initSettings() {
  const overlay   = document.getElementById("settings-overlay");
  const openBtn   = document.getElementById("open-settings");
  const closeBtn  = document.getElementById("close-settings");
  const saveBtn   = document.getElementById("save-api-key");
  const clearBtn  = document.getElementById("clear-api-key");
  const keyInput  = document.getElementById("api-key-input");
  const keyStatus = document.getElementById("key-status");

  function openSettings() {
    overlay.removeAttribute("hidden");
    keyInput.value = getApiKey();
    updateKeyStatus();
  }
  function closeSettings() { overlay.setAttribute("hidden", ""); }

  function updateKeyStatus() {
    const sub = document.getElementById("ai-panel-sub");
    if (usingWorker()) {
      if (keyStatus) {
        keyStatus.innerHTML = `<span style="color:#10b981;font-size:.95rem">✔ Cloudflare proxy active — AI works on all devices automatically.</span>`;
      }
      /* Hide the key input fields when Worker is in use */
      const fieldEl = document.querySelector(".dialog-body .field");
      const btnRow  = document.querySelector(".dialog-body .btn-row");
      if (fieldEl) fieldEl.style.display = "none";
      if (btnRow)  btnRow.style.display  = "none";
      if (sub) sub.textContent = "CBSE Class XII · Proxy-powered ✔";
    } else {
      const has = Boolean(getApiKey());
      if (keyStatus) {
        keyStatus.textContent = has ? "✔ API key saved — AI features active" : "No key saved. AI features unavailable.";
        keyStatus.className   = "key-status " + (has ? "ok" : "");
      }
      if (sub) sub.textContent = has ? "CBSE Class XII · Claude-powered ✔" : "CBSE Class XII · Add API key to activate";
    }
  }

  openBtn?.addEventListener("click", openSettings);
  closeBtn?.addEventListener("click", closeSettings);
  overlay?.addEventListener("click", e => { if (e.target === overlay) closeSettings(); });

  saveBtn?.addEventListener("click", () => {
    const val = keyInput?.value.trim();
    if (!val || !val.startsWith("sk-ant-")) {
      alert("Invalid key. It should start with sk-ant-"); return;
    }
    localStorage.setItem("boardbridge_api_key", val);
    updateKeyStatus();
    closeSettings();
  });

  clearBtn?.addEventListener("click", () => {
    localStorage.removeItem("boardbridge_api_key");
    if (keyInput) keyInput.value = "";
    updateKeyStatus();
  });

  updateKeyStatus();
}

/* ================================================================
   GLOBAL EVENTS
   ================================================================ */
function attachGlobalEvents() {
  /* Search */
  document.getElementById("global-search")?.addEventListener("input", e => {
    state.search = e.target.value.trim();
    renderPage();
  });

  /* Mobile hamburger */
  document.getElementById("hamburger")?.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    const open    = sidebar?.classList.contains("open");
    sidebar?.classList.toggle("open", !open);
    document.getElementById("hamburger")?.setAttribute("aria-expanded", String(!open));
  });

  /* Sidebar backdrop click */
  document.addEventListener("click", e => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar?.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        !e.target.closest("#hamburger")) {
      closeSidebar();
    }
  });

  /* PWA install */
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    state.deferredInstall = e;
    const btn = document.getElementById("install-app");
    if (btn) btn.hidden = false;
  });
  document.getElementById("install-app")?.addEventListener("click", async () => {
    if (!state.deferredInstall) return;
    state.deferredInstall.prompt();
    const { outcome } = await state.deferredInstall.userChoice;
    if (outcome === "accepted") {
      state.deferredInstall = null;
      const btn = document.getElementById("install-app");
      if (btn) btn.hidden = true;
    }
  });
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar?.classList.remove("open");
  document.getElementById("hamburger")?.setAttribute("aria-expanded", "false");
}

/* ================================================================
   SERVICE WORKER
   ================================================================ */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

/* ================================================================
   INIT
   ================================================================ */
function init() {
  renderSidebar();
  renderCountdown();
  renderPage();
  initChat();
  initSettings();
  attachGlobalEvents();
  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", init);
