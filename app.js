const DATA = window.CBSE_STUDY_DATA;
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CLAUDE_ENDPOINT = "https://api.anthropic.com/v1/messages";

const CLAUDE_SYSTEM = `You are a study assistant for a CBSE Class XII student in New Delhi, India, preparing for board exams in Feb-Mar 2027.
You ONLY answer questions about these six subjects and their prescribed textbooks:
- Legal Studies (code 074) - CBSE Legal Studies Class XII textbook
- Psychology (code 037) - NCERT Psychology Class XII
- Economics (code 030) - NCERT Introductory Macroeconomics + Indian Economic Development
- Political Science (code 028) - NCERT Contemporary World Politics + Politics in India Since Independence
- English Core (code 301) - NCERT Flamingo + Vistas + Reading and Writing Skills
- Applied Art - Commercial Art (code 052) - CBSE Fine Arts syllabus, History of Indian Art

If asked about anything outside this scope, respond with: "I can only help with CBSE Class XII subjects for the 2026-27 curriculum."

For every answer:
1. Give a clear definition or explanation anchored to the syllabus
2. Mention how CBSE typically frames this in board exams (question type, marks)
3. Give the expected answer structure: define → explain → example → conclusion
4. Use precise syllabus terminology
Keep answers under 300 words unless more is genuinely needed for a long-answer topic.`;

const els = {
  subjectList: document.querySelector("#subject-list"),
  globalSearch: document.querySelector("#global-search"),
  pageTitle: document.querySelector("#page-title"),
  metrics: {
    subjects: document.querySelector("#metric-subjects"),
    chapters: document.querySelector("#metric-chapters"),
    sources: document.querySelector("#metric-sources")
  },
  panels: {
    study: document.querySelector("#study"),
    quiz: document.querySelector("#quiz"),
    paper: document.querySelector("#paper"),
    assistant: document.querySelector("#assistant"),
    sources: document.querySelector("#sources")
  },
  installButton: document.querySelector("#install-app"),
  printButton: document.querySelector("#print-current"),
  settingsOverlay: document.querySelector("#settings-overlay"),
  openSettings: document.querySelector("#open-settings"),
  closeSettings: document.querySelector("#close-settings"),
  apiKeyInput: document.querySelector("#api-key-input"),
  saveApiKey: document.querySelector("#save-api-key"),
  clearApiKey: document.querySelector("#clear-api-key"),
  keyStatus: document.querySelector("#key-status"),
  mobileNavToggle: document.querySelector("#mobile-nav-toggle"),
  rail: document.querySelector(".rail")
};

const state = {
  selectedSubjectId: DATA.subjects[0].id,
  selectedChapterId: null,
  activeTab: "study",
  query: "",
  quiz: [],
  paper: null,
  sourceCache: new Map(),
  deferredInstall: null
};

const marksLabels = {
  1: "1 marker",
  2: "2 marker",
  3: "3 marker",
  4: "4 marker",
  5: "5 marker",
  6: "6 marker"
};

const targetByDuration = {
  60: 30,
  120: 55,
  180: 80
};

const SOURCE_CONFIG = {
  readerBase: "https://r.jina.ai/",
  searchBase: "https://s.jina.ai/",
  proxyUrl: window.BOARDBRIDGE_SOURCE_PROXY || "",
  publicSearch: Boolean(window.BOARDBRIDGE_ENABLE_PUBLIC_SEARCH)
};

function init() {
  els.metrics.subjects.textContent = DATA.subjects.length;
  els.metrics.chapters.textContent = allChapters().length;
  els.metrics.sources.textContent = DATA.sources.length;
  renderSubjectList();
  renderAll();
  attachEvents();
  registerServiceWorker();
}

function attachEvents() {
  els.globalSearch.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderAll();
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeTab = tab.dataset.tab;
      document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("is-active", item === tab));
      Object.entries(els.panels).forEach(([key, panel]) => panel.classList.toggle("is-active", key === state.activeTab));
      renderAll();
    });
  });

  els.printButton.addEventListener("click", () => {
    if (state.paper) downloadPdf();
    else window.print();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstall = event;
    els.installButton.hidden = false;
  });

  els.installButton.addEventListener("click", async () => {
    if (!state.deferredInstall) return;
    state.deferredInstall.prompt();
    await state.deferredInstall.userChoice;
    state.deferredInstall = null;
  });

  els.openSettings.addEventListener("click", () => {
    els.settingsOverlay.hidden = false;
    const stored = localStorage.getItem("boardbridge_api_key");
    els.apiKeyInput.value = stored ? "sk-ant-•••••••••••" : "";
    els.keyStatus.textContent = stored ? "Key is saved." : "";
    els.keyStatus.className = stored ? "key-status ok" : "key-status";
  });

  els.closeSettings.addEventListener("click", () => { els.settingsOverlay.hidden = true; });
  els.settingsOverlay.addEventListener("click", (e) => { if (e.target === els.settingsOverlay) els.settingsOverlay.hidden = true; });

  els.saveApiKey.addEventListener("click", () => {
    const val = els.apiKeyInput.value.trim();
    if (!val || val.startsWith("sk-ant-•")) {
      els.keyStatus.textContent = "Enter a real key first.";
      els.keyStatus.className = "key-status err";
      return;
    }
    localStorage.setItem("boardbridge_api_key", val);
    els.keyStatus.textContent = "Key saved. AI assistant is now active.";
    els.keyStatus.className = "key-status ok";
    els.apiKeyInput.value = "sk-ant-•••••••••••";
  });

  els.clearApiKey.addEventListener("click", () => {
    localStorage.removeItem("boardbridge_api_key");
    els.apiKeyInput.value = "";
    els.keyStatus.textContent = "Key cleared. Using built-in syllabus logic.";
    els.keyStatus.className = "key-status";
  });

  els.mobileNavToggle.addEventListener("click", () => {
    const collapsed = els.rail.classList.toggle("rail-collapsed");
    els.mobileNavToggle.setAttribute("aria-expanded", String(!collapsed));
    els.mobileNavToggle.textContent = collapsed ? "☰" : "✕";
  });
}

function renderAll() {
  const subject = selectedSubject();
  els.pageTitle.textContent = `${subject.name} study desk`;
  renderSubjectList();
  renderStudy();
  renderQuiz();
  renderPaper();
  renderAssistant();
  renderSources();
}

function renderSubjectList() {
  els.subjectList.innerHTML = DATA.subjects
    .map((subject) => {
      const count = subject.books.reduce((sum, book) => sum + book.chapters.length, 0);
      return `
        <button class="subject-button ${subject.id === state.selectedSubjectId ? "is-active" : ""}" data-subject="${subject.id}">
          <span class="subject-icon" aria-hidden="true">${escapeHtml(subject.icon)}</span>
          <span>
            <strong>${escapeHtml(subject.name)}</strong>
            <span>Code ${escapeHtml(subject.code)} - ${count} units</span>
          </span>
        </button>
      `;
    })
    .join("");

  els.subjectList.querySelectorAll("[data-subject]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSubjectId = button.dataset.subject;
      state.selectedChapterId = null;
      state.quiz = [];
      renderAll();
    });
  });
}

function renderStudy() {
  const subject = selectedSubject();
  const chapters = filteredChapters(subject);
  if (!chapters.length) {
    els.panels.study.innerHTML = emptyState();
    return;
  }

  const selected = chapters.find((item) => item.chapter.id === state.selectedChapterId) || chapters[0];
  state.selectedChapterId = selected.chapter.id;
  const chapter = selected.chapter;
  const book = selected.book;

  els.panels.study.innerHTML = `
    <div class="study-layout">
      <div class="chapter-list" aria-label="Chapters">
        ${chapters
          .map(({ chapter: item, book: itemBook }) => `
            <button class="chapter-button ${item.id === chapter.id ? "is-active" : ""}" data-chapter="${item.id}">
              <strong>${escapeHtml(item.title)}</strong>
              <span class="chapter-meta">${escapeHtml(item.unit)} - ${escapeHtml(itemBook.title)} - ${item.marks || "Flexible"} marks</span>
            </button>
          `)
          .join("")}
      </div>

      <div>
        <article class="tool-card">
          <p class="eyebrow">${escapeHtml(subject.name)} - ${escapeHtml(book.title)}</p>
          <h3>${escapeHtml(chapter.title)}</h3>
          <p>${escapeHtml(chapter.hook)}</p>
          <div class="summary-grid">
            <div class="summary-item"><span>Subject code</span><strong>${escapeHtml(subject.code)}</strong></div>
            <div class="summary-item"><span>Theory marks</span><strong>${subject.theoryMarks}</strong></div>
            <div class="summary-item"><span>Internal/practical</span><strong>${subject.practicalMarks}</strong></div>
            <div class="summary-item"><span>Exam duration</span><strong>${subject.durationMinutes / 60} hr</strong></div>
          </div>
          <div class="tag-row">${chapter.boardMoves.map((move) => `<span class="chip">${escapeHtml(move)}</span>`).join("")}</div>
        </article>

        <article class="tool-card">
          <h3>Topic Explainers</h3>
          <p class="small-note">Open any topic to get a teacher-style explanation, exam angle, example, and common mistake to avoid.</p>
          <div class="concept-stack">
            ${chapter.topics.map((topic) => conceptRow(subject, chapter, topic)).join("")}
          </div>
        </article>

        <article class="tool-card">
          <h3>Chapter Topics</h3>
          <ul class="topic-list">
            ${chapter.topics.map((topic) => `<li>${escapeHtml(topic)}</li>`).join("")}
          </ul>
        </article>
      </div>
    </div>
  `;

  els.panels.study.querySelectorAll("[data-chapter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedChapterId = button.dataset.chapter;
      renderStudy();
    });
  });
}

function conceptRow(subject, chapter, topic) {
  const lesson = teacherExplanation(subject, chapter, topic);
  return `
    <details class="concept-row">
      <summary>
        <span>
          <strong>${escapeHtml(topic)}</strong>
          <small>${escapeHtml(lesson.oneLine)}</small>
        </span>
      </summary>
      <div class="topic-lesson">
        <div>
          <h4>Understand It</h4>
          <p>${escapeHtml(lesson.explain)}</p>
        </div>
        <div>
          <h4>Why It Matters</h4>
          <p>${escapeHtml(lesson.why)}</p>
        </div>
        <div>
          <h4>Exam Answer Frame</h4>
          <ol class="answer-list">
            ${lesson.answerFrame.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
          </ol>
        </div>
        <div class="example-strip">
          <strong>Example</strong>
          <p>${escapeHtml(lesson.example)}</p>
        </div>
        <div class="mistake-strip">
          <strong>Do not write</strong>
          <p>${escapeHtml(lesson.mistake)}</p>
        </div>
      </div>
    </details>
  `;
}

function conceptExplanation(subject, chapter, topic) {
  const subjectLens = {
    "legal-studies": "define the legal idea, name the forum or rule when relevant, then apply it to a short fact situation",
    psychology: "state the concept, connect it to behaviour, and add one everyday example without turning it into medical advice",
    economics: "start with the definition, show the mechanism or formula, and end with the effect on households, firms, or government",
    "political-science": "place the idea in its historical or institutional context, then explain the consequence for power, democracy, or policy",
    "english-core": "move from literal meaning to theme, tone, device, and a clean evidence-based inference",
    "commercial-art": "identify the visual feature, link it to style or composition, and explain the effect on the viewer"
  };
  return `For ${topic}, ${subjectLens[subject.id]}. In ${chapter.title}, treat it as a board-answer building block: one clear meaning, one connection to the chapter, and one example or consequence.`;
}

function teacherExplanation(subject, chapter, topic) {
  const lenses = {
    "legal-studies": {
      oneLine: "Law concept, rule, forum, remedy, and application.",
      explain: `${topic} should be understood as part of the legal machinery in "${chapter.title}". First ask what legal problem it solves, who uses it, and what result it produces. Then connect it to the relevant institution, statute, right, duty, or remedy from the chapter.`,
      why: `CBSE Legal Studies often tests whether a student can move from a fact situation to the correct legal idea. This topic can become a direct definition, a case-based application, or a short comparison question.`,
      example: `If the question gives a dispute, identify the parties, the legal issue, the forum or rule, and the likely legal consequence. For ${topic}, keep the answer tied to ${chapter.title}.`,
      mistake: "Do not write a general moral answer. Legal Studies answers must use legal terms and apply them to the facts."
    },
    psychology: {
      oneLine: "Meaning, behaviour link, example, and careful terminology.",
      explain: `${topic} is best learnt by connecting the term to observable behaviour. Define the concept, explain the process or feature, and show how it affects thinking, emotion, personality, stress, therapy, or social behaviour in "${chapter.title}".`,
      why: "Psychology papers reward precise concepts and examples. A strong answer names the process, shows understanding, and avoids casual or diagnostic language unless the syllabus uses it.",
      example: `For a behaviour-based question, describe what the person is doing, match it to ${topic}, and explain why that match is correct.`,
      mistake: "Do not turn every answer into personal advice or diagnosis. Use syllabus language and write academically."
    },
    economics: {
      oneLine: "Definition, mechanism, formula/data link, and effect.",
      explain: `${topic} should be studied as an economic relationship. Define it, identify the variables or components, and explain the direction of effect in "${chapter.title}". If a formula, graph, account, or policy tool is involved, name it clearly.`,
      why: "Economics questions often test whether you can classify, calculate, compare, and explain cause-effect. Marks come from clean steps, not long paragraphs.",
      example: `If ${topic} appears in a numerical or policy question, write the formula or mechanism first, substitute the given data if any, and end with the economic meaning.`,
      mistake: "Do not mix similar terms such as stock/flow, final/intermediate, revenue/capital, or fixed/flexible without a clear distinction."
    },
    "political-science": {
      oneLine: "Context, actors, timeline, consequence, and evaluation.",
      explain: `${topic} belongs to a political process in "${chapter.title}". Start with the historical or institutional context, identify the main actors, and explain how it changed power, democracy, policy, identity, or international relations.`,
      why: "Political Science answers score when they are structured: context first, then explanation, then consequence. CBSE also asks passage, cartoon, and map-based application.",
      example: `For ${topic}, connect the event or concept to a named institution, leader, region, country, policy, or movement from the chapter.`,
      mistake: "Do not write opinion alone. Support each point with syllabus-based facts and political consequences."
    },
    "english-core": {
      oneLine: "Literal meaning, theme, device, evidence, and inference.",
      explain: `${topic} should be understood through the text, not as a memorised paragraph. Begin with what happens or what the phrase suggests, then connect it to theme, character, tone, imagery, or narrative purpose.`,
      why: "English Core marking rewards inference and textual understanding. Strong answers are concise, evidence-based, and sensitive to tone.",
      example: `If asked about ${topic}, write the direct meaning, mention the relevant moment or speaker, and explain the larger theme it reveals.`,
      mistake: "Do not retell the whole chapter. Answer the exact question and include a short textual reference."
    },
    "commercial-art": {
      oneLine: "Visual feature, school/style, artist-work link, and effect.",
      explain: `${topic} should be read visually. Identify the school, artwork, technique, design principle, or practical requirement, then explain how line, colour, composition, subject, lettering, or style creates meaning.`,
      why: "Applied Art questions often ask identification and explanation. In practical work, marks depend on composition, clarity, colour use, and overall impression.",
      example: `For ${topic}, mention the visible feature first, then link it to the school, period, artist, design purpose, or practical marking criterion.`,
      mistake: "Do not give vague appreciation only. Use visual vocabulary such as composition, emphasis, colour scheme, proportion, and typography."
    }
  };
  const lens = lenses[subject.id];
  return {
    ...lens,
    answerFrame: [
      `Define ${topic} in one clean sentence.`,
      `Connect it directly to ${chapter.title}.`,
      `Add one syllabus point: ${chapter.boardMoves[0] || chapter.topics[0]}.`,
      "End with an example, effect, or conclusion matching the marks."
    ]
  };
}

function renderQuiz() {
  const subject = selectedSubject();
  const chapters = flattenSubject(subject);
  const selectedChapter = chapters.find((item) => item.chapter.id === state.selectedChapterId) || chapters[0];

  els.panels.quiz.innerHTML = `
    <div class="paper-layout">
      <div class="tool-card">
        <h3>Fresh Pop Quiz</h3>
        <div class="control-grid">
          <div class="field">
            <label for="quiz-chapter">Chapter</label>
            <select id="quiz-chapter">
              ${chapters.map(({ chapter, book }) => `<option value="${chapter.id}" ${chapter.id === selectedChapter.chapter.id ? "selected" : ""}>${escapeHtml(chapter.title)} - ${escapeHtml(book.title)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="quiz-count">Questions</label>
            <select id="quiz-count">
              <option value="5">5</option>
              <option value="8">8</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>
        <div class="button-row">
          <button class="primary-button" id="make-quiz">New attempt</button>
        </div>
      </div>
      <div class="tool-card">
        <h3>Quiz Questions</h3>
        <div class="quiz-stack" id="quiz-stack">
          ${state.quiz.length ? renderQuizQuestions(state.quiz) : `<p class="small-note">Pick a chapter and start a fresh attempt.</p>`}
        </div>
      </div>
    </div>
  `;

  els.panels.quiz.querySelector("#quiz-chapter").addEventListener("change", (event) => {
    state.selectedChapterId = event.target.value;
  });

  els.panels.quiz.querySelector("#make-quiz").addEventListener("click", () => {
    const chapterId = els.panels.quiz.querySelector("#quiz-chapter").value;
    const count = Number(els.panels.quiz.querySelector("#quiz-count").value);
    const item = chapters.find(({ chapter }) => chapter.id === chapterId);
    state.selectedChapterId = chapterId;
    state.quiz = generateQuiz(subject, item.book, item.chapter, count);
    renderQuiz();
  });

  wireAnswerToggles(els.panels.quiz);
}

function renderQuizQuestions(questions) {
  return questions
    .map((question, index) => `
      <article class="question-card">
        <div class="question-meta">Question ${index + 1} - ${escapeHtml(question.type)}</div>
        <h4>${escapeHtml(question.prompt)}</h4>
        ${question.options ? `<div class="options-grid">${question.options.map((option, optionIndex) => `<div class="option"><strong>${String.fromCharCode(65 + optionIndex)}</strong><span>${escapeHtml(option)}</span></div>`).join("")}</div>` : ""}
        <button class="answer-toggle" data-answer="${index}">Show answer</button>
        <div class="answer-box" id="answer-${index}">${escapeHtml(question.answer)}</div>
      </article>
    `)
    .join("");
}

function generateQuiz(subject, book, chapter, count) {
  const all = flattenSubject(subject);
  const otherTopics = all
    .filter((item) => item.chapter.id !== chapter.id)
    .flatMap((item) => item.chapter.topics)
    .filter(Boolean);
  const topics = shuffle(chapter.topics);
  const moves = shuffle(chapter.boardMoves);

  return Array.from({ length: count }, (_, index) => {
    const topic = topics[index % topics.length];
    const move = moves[index % moves.length] || "core concept";
    const type = index % 3 === 0 ? "MCQ" : index % 3 === 1 ? "Quick explain" : "Exam move";

    if (type === "MCQ") {
      const options = shuffle([topic, ...shuffle(otherTopics).slice(0, 3)]);
      return {
        type,
        prompt: `Which option belongs most directly to "${chapter.title}"?`,
        options,
        answer: `${topic} is part of ${chapter.title} in ${book.title}.`
      };
    }

    if (type === "Quick explain") {
      return {
        type,
        prompt: `Explain "${topic}" in a two-line board-answer style.`,
        answer: `${topic}: give a direct meaning, connect it to ${chapter.title}, and add one example or consequence. Keep the answer specific and avoid storytelling.`
      };
    }

    return {
      type,
      prompt: `A teacher says this chapter often tests "${move}". What should the answer include?`,
      answer: `Write the definition or context first, add the relevant syllabus point from ${chapter.title}, and finish with why ${move} matters in an exam situation.`
    };
  });
}

function renderPaper() {
  const subject = selectedSubject();
  const chapters = flattenSubject(subject);
  const selectedChapterIds = new Set(chapters.slice(0, Math.min(4, chapters.length)).map((item) => item.chapter.id));

  els.panels.paper.innerHTML = `
    <div class="paper-layout">
      <div class="tool-card">
        <h3>Test Paper Builder</h3>
        <div class="control-grid">
          <div class="field">
            <label for="paper-duration">Duration</label>
            <select id="paper-duration">
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="180" selected>3 hours</option>
            </select>
          </div>
          <div class="field">
            <label for="paper-book">Book</label>
            <select id="paper-book">
              <option value="all">All books</option>
              ${subject.books.map((book) => `<option value="${book.id}">${escapeHtml(book.title)}</option>`).join("")}
            </select>
          </div>
        </div>
        <fieldset class="check-group">
          <legend>Marks Categories</legend>
          <div class="check-list">
            ${[1, 2, 3, 4, 5, 6].map((mark) => `<label><input type="checkbox" name="marks" value="${mark}" ${subject.pattern.requestedMarksSupported.includes(mark) ? "checked" : ""}> ${marksLabels[mark]}</label>`).join("")}
          </div>
        </fieldset>
        <fieldset class="check-group">
          <legend>Chapters</legend>
          <div class="chapter-checks" id="chapter-checks">
            ${chapters.map(({ chapter, book }) => `
              <label data-book="${book.id}">
                <input type="checkbox" name="paper-chapter" value="${chapter.id}" ${selectedChapterIds.has(chapter.id) ? "checked" : ""}>
                <span>${escapeHtml(chapter.title)} <span class="chapter-meta">${escapeHtml(book.title)}</span></span>
              </label>
            `).join("")}
          </div>
        </fieldset>
        <div class="button-row">
          <button class="primary-button" id="generate-paper">Prepare paper</button>
          <button class="secondary-button" id="show-answers" ${state.paper && state.paper.answerStatus !== "loading" ? "" : "disabled"}>${answerButtonLabel()}</button>
          <button class="secondary-button" id="download-pdf" ${state.paper ? "" : "disabled"}>Download PDF</button>
        </div>
        <p class="small-note">The paper follows public CBSE pattern references. Answer reveal prepares exam-style answers and cites the sources it could fetch.</p>
      </div>
      <div class="paper-preview" id="paper-preview">
        ${state.paper ? renderPaperPreview(state.paper) : `<div class="empty-state"><h3>No paper yet</h3><p>Select chapters, marks, and duration to generate a test.</p></div>`}
      </div>
    </div>
  `;

  const bookSelect = els.panels.paper.querySelector("#paper-book");
  bookSelect.addEventListener("change", () => filterPaperBook(bookSelect.value));

  els.panels.paper.querySelector("#generate-paper").addEventListener("click", () => {
    const selectedMarks = Array.from(els.panels.paper.querySelectorAll("input[name='marks']:checked")).map((input) => Number(input.value));
    const selectedIds = Array.from(els.panels.paper.querySelectorAll("input[name='paper-chapter']:checked")).map((input) => input.value);
    const duration = Number(els.panels.paper.querySelector("#paper-duration").value);
    const selected = chapters.filter(({ chapter }) => selectedIds.includes(chapter.id));
    state.paper = generatePaper(subject, selected, selectedMarks.length ? selectedMarks : [1, 2, 3, 4, 5, 6], duration);
    renderPaper();
  });

  els.panels.paper.querySelector("#show-answers").addEventListener("click", async () => {
    if (!state.paper) return;
    if (!state.paper.answersReady) {
      state.paper.answerStatus = "loading";
      renderPaper();
      await enrichPaperAnswers(state.paper);
      state.paper.answersReady = true;
      state.paper.answerStatus = "ready";
      state.paper.showAnswers = true;
    } else {
      state.paper.showAnswers = !state.paper.showAnswers;
    }
    renderPaper();
  });

  els.panels.paper.querySelector("#download-pdf").addEventListener("click", () => window.print());
}

function answerButtonLabel() {
  if (!state.paper) return "Show answers";
  if (state.paper.answerStatus === "loading") return "Preparing answers...";
  if (!state.paper.answersReady) return "Fetch answers";
  return state.paper.showAnswers ? "Hide answers" : "Show answers";
}

function filterPaperBook(bookId) {
  els.panels.paper.querySelectorAll("#chapter-checks label").forEach((label) => {
    const visible = bookId === "all" || label.dataset.book === bookId;
    label.style.display = visible ? "grid" : "none";
    if (!visible) label.querySelector("input").checked = false;
  });
}

function generatePaper(subject, selectedItems, selectedMarks, duration) {
  const items = selectedItems.length ? selectedItems : flattenSubject(subject).slice(0, 4);
  const maxMarks = subject.theoryMarks;
  const target = Math.min(maxMarks, targetByDuration[duration] || maxMarks, subject.durationMinutes === 120 ? 30 : maxMarks);
  const questions = [];
  let total = 0;
  let cursor = 0;
  const sortedMarks = selectedMarks.sort((a, b) => a - b);

  while (total < target && questions.length < 42) {
    const mark = sortedMarks[cursor % sortedMarks.length];
    if (total + mark > target + 4) {
      cursor += 1;
      continue;
    }
    const item = items[cursor % items.length];
    const topic = item.chapter.topics[cursor % item.chapter.topics.length];
    questions.push(buildQuestion(subject, item.book, item.chapter, topic, mark, questions.length + 1));
    total += mark;
    cursor += 1;
  }

  return {
    id: `paper-${Date.now()}`,
    subject,
    items,
    duration,
    total,
    target,
    showAnswers: false,
    answersReady: false,
    answerStatus: "idle",
    generatedAt: new Date().toLocaleString(),
    questions
  };
}

function buildQuestion(subject, book, chapter, topic, mark, number) {
  const verbs = {
    1: ["Identify", "Name", "Choose the correct idea about"],
    2: ["State two points on", "Briefly explain", "Differentiate in brief"],
    3: ["Explain with an example", "Describe the role of", "Write a short note on"],
    4: ["Analyse", "Compare and explain", "Apply the concept of"],
    5: ["Evaluate", "Discuss with suitable arguments", "Explain the significance of"],
    6: ["Critically examine", "Discuss in detail", "Assess with examples"]
  };
  const verb = verbs[mark][number % verbs[mark].length];
  const typeNote = subject.pattern.questionMarks.includes(mark)
    ? "officially aligned marker"
    : "adapted practice marker";

  return {
    number,
    mark,
    typeNote,
    prompt: `${verb} "${topic}" with reference to ${chapter.title}.`,
    meta: `${book.title} - ${chapter.unit}`,
    subject,
    book,
    chapter,
    topic,
    answer: answerGuide(subject, chapter, topic, mark)
  };
}

function answerGuide(subject, chapter, topic, mark) {
  const lengthGuide = {
    1: "one precise line",
    2: "two points with one example if useful",
    3: "definition, explanation, and example",
    4: "four clear points with a link back to the chapter",
    5: "introduction, three developed points, and a short conclusion",
    6: "structured answer with context, analysis, examples, and conclusion"
  };
  return `Expected answer: cover ${topic} in ${lengthGuide[mark]}. Keep it within ${chapter.title}; use the syllabus terms and avoid adding material outside ${subject.name}.`;
}

async function enrichPaperAnswers(paper) {
  const hasKey = Boolean(localStorage.getItem("boardbridge_api_key"));

  if (hasKey) {
    await Promise.all(paper.questions.map(async (q) => {
      const context = `Subject: ${q.subject.name}\nBook: ${q.book.title}\nChapter: ${q.chapter.title}\nTopic: ${q.topic}\nMarks: ${q.mark}\nExam angle: ${q.chapter.boardMoves.join(", ")}`;
      const prompt = `Write a model board-exam answer for this CBSE Class XII question (${q.mark} mark${q.mark > 1 ? "s" : ""}): "${q.prompt}"\n\nStructure the answer to score full marks. Use precise syllabus terms.`;
      const aiText = await callClaude(prompt, context);
      if (aiText) {
        const paragraphs = aiText.split(/\n\n+/).filter(Boolean);
        const body = paragraphs.map((para) => {
          if (para.match(/^[-•]\s/) || para.match(/^\d+\.\s/)) {
            const items = para.split(/\n/).filter(Boolean);
            return `<ol class="answer-list">${items.map((i) => `<li>${escapeHtml(i.replace(/^[-•\d.]+\s*/, ""))}</li>`).join("")}</ol>`;
          }
          return `<p>${escapeHtml(para)}</p>`;
        }).join("");
        q.answerHtml = `<div class="score-answer"><h4>Model Answer (AI)</h4>${body}</div>`;
      } else {
        q.answerHtml = buildScoreAnswerHtml(q, null);
      }
    }));
    return;
  }

  const chapterGroups = new Map();
  paper.questions.forEach((q) => { if (!chapterGroups.has(q.chapter.id)) chapterGroups.set(q.chapter.id, q); });
  const samples = [...chapterGroups.values()].slice(0, 5);
  const fetched = await Promise.all(samples.map((q) =>
    fetchSourceBundle({ subject: paper.subject, chapter: q.chapter, topic: q.topic, question: q.prompt })
      .then((bundle) => [q.chapter.id, bundle])
  ));
  const bundles = new Map(fetched);
  const fallback = fetched[0]?.[1] || null;
  paper.questions.forEach((q) => {
    q.answerHtml = buildScoreAnswerHtml(q, bundles.get(q.chapter.id) || fallback);
  });
}

function buildScoreAnswerHtml(question, bundle) {
  const direct = directAnswerLine(question);
  const points = examPoints(question, bundle);
  const conclusion = conclusionLine(question);
  return `
    <div class="score-answer">
      <h4>Write This In The Exam</h4>
      <p><strong>Direct answer:</strong> ${escapeHtml(direct)}</p>
      <ol class="answer-list">
        ${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
      </ol>
      ${question.mark >= 4 ? `<p><strong>Conclusion:</strong> ${escapeHtml(conclusion)}</p>` : ""}
      ${bundle?.snippets?.length ? `
        <div>
          <h4>Source-backed hints</h4>
          <ul class="topic-list">${bundle.snippets.slice(0, 2).map((snippet) => `<li>${escapeHtml(snippet)}</li>`).join("")}</ul>
        </div>
      ` : ""}
      ${sourcesHtml(bundle)}
    </div>
  `;
}

function directAnswerLine(question) {
  const subjectId = question.subject?.id || selectedSubject().id;
  const starters = {
    "legal-studies": `${question.topic} is a legal concept or process under ${question.chapter.title} that must be defined and applied to the given facts.`,
    psychology: `${question.topic} refers to a psychological concept in ${question.chapter.title} that explains behaviour, mental process, assessment, or adjustment.`,
    economics: `${question.topic} is an economic concept in ${question.chapter.title} used to explain a variable, relationship, policy effect, or calculation.`,
    "political-science": `${question.topic} is part of the political development or institution studied in ${question.chapter.title}.`,
    "english-core": `${question.topic} should be answered through the text, its theme, tone, character situation, and relevant inference.`,
    "commercial-art": `${question.topic} should be explained through visual features, style, composition, or practical design requirements.`
  };
  return starters[subjectId] || `${question.topic} belongs to ${question.chapter.title} and should be explained with syllabus-specific terms.`;
}

function examPoints(question, bundle) {
  const base = [
    `Begin by defining "${question.topic}" in relation to "${question.chapter.title}".`,
    `Use the key syllabus connection: ${question.chapter.boardMoves[0] || question.chapter.topics[0]}.`,
    `Add one example, effect, comparison, or application from the chapter.`,
    `Use exact terms from the question and avoid unrelated outside material.`,
    `For higher marks, organise the answer into short paragraphs or numbered points.`,
    `End by showing why the concept matters in the chapter or exam situation.`
  ];

  if (bundle?.snippets?.length) {
    base.splice(2, 0, `Include this source-backed clue if relevant: ${bundle.snippets[0]}`);
  }

  const pointTarget = Math.max(1, Math.min(6, question.mark));
  return base.slice(0, pointTarget);
}

function conclusionLine(question) {
  return `Thus, ${question.topic} should not be written as an isolated term; it should be connected to ${question.chapter.title} and used to answer the exact demand of the question.`;
}

function renderPaperPreview(paper) {
  return `
    <article class="printable">
      <div class="paper-header">
        <h3>${escapeHtml(paper.subject.name)} Practice Paper</h3>
        <p>Class XII CBSE ${escapeHtml(DATA.examWindow)} - Time: ${paper.duration / 60} hour${paper.duration > 60 ? "s" : ""} - Marks: ${paper.total}</p>
        <p class="small-note">Generated ${escapeHtml(paper.generatedAt)}. Pattern basis: ${escapeHtml(paper.subject.pattern.basis)}</p>
      </div>
      <ol class="paper-questions">
        ${paper.questions.map((question) => `
          <li class="question-card">
            <div class="question-meta">${escapeHtml(question.meta)} - ${question.mark} mark${question.mark > 1 ? "s" : ""} - ${escapeHtml(question.typeNote)}</div>
            <strong>${escapeHtml(question.prompt)}</strong>
            ${paper.showAnswers ? `<div class="answer-box is-visible">${question.answerHtml || escapeHtml(question.answer)}</div>` : ""}
          </li>
        `).join("")}
      </ol>
    </article>
  `;
}

function renderAssistant() {
  const hasKey = Boolean(localStorage.getItem("boardbridge_api_key"));
  const badgeHtml = hasKey
    ? `<span class="ai-badge">AI ON</span>`
    : `<span class="ai-badge ai-off">AI OFF</span>`;

  els.panels.assistant.innerHTML = `
    <div class="assistant-layout">
      <div class="tool-card">
        <h3>Study Assistant ${badgeHtml}</h3>
        <div class="assistant-input">
          <textarea id="assistant-question" placeholder="Ask anything from the syllabus, books, or exam pattern…"></textarea>
          <button class="primary-button" id="ask-assistant">Ask</button>
        </div>
        <p class="small-note">${hasKey
          ? "AI is active — answers use Claude with CBSE syllabus context and web sources."
          : "Using built-in syllabus logic. Add your Anthropic API key in ⚙ Settings for live AI answers."}</p>
      </div>
      <div class="assistant-results" id="assistant-results">
        <div class="guardrail">
          <strong>Knowledge boundary</strong>
          <p>Questions outside CBSE Class XII subjects, official syllabus, exam patterns, or generated papers are refused — not guessed.</p>
        </div>
      </div>
    </div>
  `;

  const textarea = els.panels.assistant.querySelector("#assistant-question");
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      els.panels.assistant.querySelector("#ask-assistant").click();
    }
  });

  els.panels.assistant.querySelector("#ask-assistant").addEventListener("click", async () => {
    const question = textarea.value.trim();
    if (!question) return;
    const results = els.panels.assistant.querySelector("#assistant-results");
    results.innerHTML = `<div class="empty-state"><h3>Thinking…</h3><p>Checking syllabus and sources for this topic.</p></div>`;
    const result = await answerFromKnowledgeBase(question);
    results.innerHTML = result;
  });
}

async function answerFromKnowledgeBase(question) {
  if (!question) {
    return `<div class="empty-state"><h3>Ask a syllabus question</h3><p>Try a chapter, concept, or paper question number.</p></div>`;
  }

  const paperAnswer = await answerFromCurrentPaper(question);
  if (paperAnswer) return paperAnswer;

  const tokens = tokenize(question);
  const matches = allChapters()
    .map((item) => ({ ...item, score: scoreChapter(item, tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const hasKey = Boolean(localStorage.getItem("boardbridge_api_key"));

  if (!matches.length && !hasKey) {
    return `
      <div class="guardrail">
        <strong>Topic not found in syllabus map.</strong>
        <p>Try naming a chapter or topic such as "Money and Banking", "ADR", "Aunt Jennifer's Tigers", or "attitude formation". Add an Anthropic API key in ⚙ Settings for broader answers.</p>
      </div>
    `;
  }

  const best = matches[0] || null;
  const topicHits = best
    ? best.chapter.topics.filter((t) => tokens.some((tok) => t.toLowerCase().includes(tok))).slice(0, 4)
    : [];
  const topics = topicHits.length && best ? topicHits : (best ? best.chapter.topics.slice(0, 4) : []);

  if (hasKey) {
    const context = best
      ? `Subject: ${best.subject.name}\nBook: ${best.book.title}\nChapter: ${best.chapter.title}\nKey topics: ${best.chapter.topics.join(", ")}\nExam angle: ${best.chapter.boardMoves.join(", ")}`
      : "General CBSE Class XII query.";
    const aiText = await callClaude(question, context);
    if (aiText) {
      const paragraphs = aiText.split(/\n\n+/).filter(Boolean);
      const bodyHtml = paragraphs.map((para) => {
        if (para.startsWith("- ") || para.match(/^\d+\./)) {
          const items = para.split(/\n/).filter(Boolean);
          return `<ul class="topic-list">${items.map((item) => `<li>${escapeHtml(item.replace(/^[-\d.]+\s*/, ""))}</li>`).join("")}</ul>`;
        }
        return `<p>${escapeHtml(para)}</p>`;
      }).join("");
      return `
        <div class="assistant-answer">
          ${best ? `<div><p class="eyebrow">${escapeHtml(best.subject.name)} · ${escapeHtml(best.book.title)}</p><h3>${escapeHtml(best.chapter.title)}</h3></div>` : ""}
          <div class="tool-card" style="margin:0">${bodyHtml}</div>
          ${best ? `<div><h4>Exam angle</h4><p>${escapeHtml(best.chapter.boardMoves.join(" · "))}</p></div>` : ""}
        </div>
      `;
    }
  }

  if (!best) {
    return `<div class="guardrail"><strong>Topic not found in syllabus map.</strong><p>Try a chapter name, concept, or topic from your books.</p></div>`;
  }

  const bundle = await fetchSourceBundle({ subject: best.subject, chapter: best.chapter, topic: topics[0], question });
  return `
    <div class="assistant-answer">
      <div>
        <p class="eyebrow">${escapeHtml(best.subject.name)} - ${escapeHtml(best.book.title)}</p>
        <h3>${escapeHtml(best.chapter.title)}</h3>
        <p>${escapeHtml(best.chapter.hook)}</p>
      </div>
      <div>
        <h4>Study-safe answer</h4>
        <p>${escapeHtml(buildAssistantExplanation(best.subject, best.chapter, topics))}</p>
      </div>
      ${bundle.snippets.length ? `<div><h4>Source Notes</h4><ul class="topic-list">${bundle.snippets.slice(0, 3).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></div>` : ""}
      <div><h4>Key syllabus points</h4><ul class="topic-list">${topics.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>
      <div><h4>Exam angle</h4><p>${escapeHtml(best.chapter.boardMoves.join(", "))}</p></div>
      ${sourcesHtml(bundle)}
    </div>
  `;
}

async function answerFromCurrentPaper(question) {
  if (!state.paper) return null;
  const match = question.match(/(?:q|question)\s*\.?\s*(\d+)/i);
  if (!match) return null;
  const number = Number(match[1]);
  const found = state.paper.questions.find((item) => item.number === number);
  if (!found) return null;
  if (!found.answerHtml) {
    const bundle = await fetchSourceBundle({
      subject: state.paper.subject,
      chapter: found.chapter,
      topic: found.topic,
      question: found.prompt
    });
    found.answerHtml = buildScoreAnswerHtml(found, bundle);
  }
  return `
    <div class="assistant-answer">
      <h3>Answer for Question ${found.number}</h3>
      <p><strong>${escapeHtml(found.prompt)}</strong></p>
      ${found.answerHtml}
    </div>
  `;
}

function buildAssistantExplanation(subject, chapter, topics) {
  const opener = `Within the loaded syllabus, ${chapter.title} should be answered through ${topics.join(", ")}.`;
  const method = conceptExplanation(subject, chapter, topics[0]);
  return `${opener} ${method} For a board-style response, keep the answer anchored to these terms and add a concise example only when it comes from the chapter context.`;
}

async function fetchSourceBundle({ subject, chapter, topic, question, mode = "topic" }) {
  const query = [
    "CBSE Class XII",
    subject.name,
    chapter?.title,
    topic,
    mode === "pattern" ? "exam pattern sample paper marking scheme" : "NCERT textbook explanation"
  ]
    .filter(Boolean)
    .join(" ");
  const cacheKey = `${mode}:${subject.id}:${chapter?.id || "pattern"}:${topic || question || ""}`.toLowerCase();
  if (state.sourceCache.has(cacheKey)) return state.sourceCache.get(cacheKey);

  const targets = sourceTargets(subject);
  const bundle = {
    status: "ready",
    query,
    sources: [],
    snippets: [],
    warnings: []
  };

  if (SOURCE_CONFIG.proxyUrl) {
    try {
      const proxied = await fetchViaProxy({ subject, chapter, topic, question, query, targets });
      state.sourceCache.set(cacheKey, proxied);
      return proxied;
    } catch (error) {
      bundle.warnings.push(`Configured source proxy failed: ${error.message}`);
    }
  }

  const readAttempts = await Promise.allSettled(targets.slice(0, 3).map((target) => fetchReadableTarget(target, query)));
  readAttempts.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      bundle.sources.push(result.value.source);
      bundle.snippets.push(...result.value.snippets);
    }
  });

  if (SOURCE_CONFIG.publicSearch) {
    try {
      const webResults = await fetchSearchResults(query);
      bundle.sources.push(...webResults.sources);
      bundle.snippets.push(...webResults.snippets);
    } catch (error) {
      bundle.warnings.push(`Live web search was not available from this browser: ${error.message}`);
    }
  }

  if (!bundle.sources.length) {
    bundle.status = "limited";
    bundle.sources = targets;
    bundle.warnings.push("Live source text could not be fetched. Showing official source links instead.");
  }

  bundle.sources = uniqueSources(bundle.sources).slice(0, 6);
  bundle.snippets = uniqueSnippets(bundle.snippets).slice(0, 5);
  state.sourceCache.set(cacheKey, bundle);
  return bundle;
}

async function fetchViaProxy(payload) {
  const response = await fetchWithTimeout(SOURCE_CONFIG.proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }, 14000);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return {
    status: "ready",
    query: payload.query,
    sources: uniqueSources(data.sources || []),
    snippets: uniqueSnippets(data.snippets || []),
    warnings: data.warnings || []
  };
}

async function fetchReadableTarget(target, query) {
  const response = await fetchWithTimeout(`${SOURCE_CONFIG.readerBase}${target.url}`, {
    headers: { Accept: "text/plain" }
  }, 14000);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  const snippets = extractRelevantSnippets(text, query);
  return {
    source: {
      title: target.title,
      type: target.type,
      url: target.url,
      readerUrl: `${SOURCE_CONFIG.readerBase}${target.url}`
    },
    snippets
  };
}

async function fetchSearchResults(query) {
  const response = await fetchWithTimeout(`${SOURCE_CONFIG.searchBase}${encodeURIComponent(query)}`, {
    headers: { Accept: "text/plain" }
  }, 10000);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  return {
    sources: parseSearchSources(text),
    snippets: extractRelevantSnippets(text, query)
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function sourceTargets(subject) {
  return [
    {
      title: `${subject.name} CBSE 2026-27 curriculum`,
      type: "Official CBSE curriculum",
      url: subject.officialUrl
    },
    {
      title: `${subject.name} latest CBSE sample paper`,
      type: "Official CBSE sample paper",
      url: subject.samplePaperUrl
    },
    ...DATA.sources.map((source) => ({
      title: source.title,
      type: source.type,
      url: source.url
    }))
  ];
}

function extractRelevantSnippets(text, query) {
  const tokens = tokenize(query).filter((token) => token.length > 3);
  const lines = text
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 55 && line.length < 320);
  const scored = lines
    .map((line) => ({
      text: line,
      score: tokens.reduce((sum, token) => sum + (line.toLowerCase().includes(token) ? 1 : 0), 0)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.text);
  return scored.length ? scored : lines.slice(0, 3);
}

function parseSearchSources(text) {
  const matches = [...text.matchAll(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g)];
  return matches.slice(0, 5).map((match) => ({
    title: match[1].replace(/\s+/g, " ").trim(),
    type: "Live web result",
    url: match[2]
  }));
}

function uniqueSources(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    if (!source?.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function uniqueSnippets(snippets) {
  const seen = new Set();
  return snippets.filter((snippet) => {
    const key = snippet.toLowerCase().slice(0, 90);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sourcesHtml(bundle) {
  if (!bundle) return "";
  return `
    <div class="source-strip">
      <strong>Sources checked</strong>
      <ul class="source-list">
        ${bundle.sources.slice(0, 4).map((source) => `<li><a href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a> <span class="chapter-meta">${escapeHtml(source.type || "Source")}</span></li>`).join("")}
      </ul>
      ${bundle.warnings.length ? `<p class="small-note">${escapeHtml(bundle.warnings.join(" "))}</p>` : ""}
    </div>
  `;
}

function renderSources() {
  els.panels.sources.innerHTML = `
    <div class="source-grid">
      ${DATA.sources.map(sourceCard).join("")}
      ${DATA.subjects.map((subject) => sourceCard({
        title: `${subject.name} curriculum PDF`,
        type: `Subject code ${subject.code}`,
        url: subject.officialUrl,
        note: `${subject.theoryMarks} theory marks and ${subject.practicalMarks} internal/practical marks.`
      })).join("")}
      ${DATA.subjects.map((subject) => sourceCard({
        title: `${subject.name} sample paper`,
        type: "Latest public CBSE SQP reference",
        url: subject.samplePaperUrl,
        note: subject.pattern.basis
      })).join("")}
    </div>
  `;
}

function sourceCard(source) {
  return `
    <article class="source-card">
      <p class="eyebrow">${escapeHtml(source.type)}</p>
      <h3>${escapeHtml(source.title)}</h3>
      <p>${escapeHtml(source.note)}</p>
      <a href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer">Open source</a>
    </article>
  `;
}

function selectedSubject() {
  return DATA.subjects.find((subject) => subject.id === state.selectedSubjectId) || DATA.subjects[0];
}

function filteredChapters(subject) {
  const chapters = flattenSubject(subject);
  if (!state.query) return chapters;
  return chapters.filter(({ subject: itemSubject, book, chapter }) => {
    const haystack = [
      itemSubject.name,
      book.title,
      chapter.title,
      chapter.unit,
      chapter.hook,
      ...chapter.topics,
      ...chapter.boardMoves
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(state.query);
  });
}

function flattenSubject(subject) {
  return subject.books.flatMap((book) => book.chapters.map((chapter) => ({ subject, book, chapter })));
}

function allChapters() {
  return DATA.subjects.flatMap((subject) => flattenSubject(subject));
}

function tokenize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .filter((token) => !["what", "why", "how", "the", "and", "from", "chapter", "topic", "tell", "about"].includes(token));
}

function scoreChapter(item, tokens) {
  const text = [
    item.subject.name,
    item.book.title,
    item.chapter.title,
    item.chapter.unit,
    ...item.chapter.topics,
    ...item.chapter.boardMoves
  ]
    .join(" ")
    .toLowerCase();
  return tokens.reduce((score, token) => score + (text.includes(token) ? 1 : 0), 0);
}

function wireAnswerToggles(root) {
  root.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const box = root.querySelector(`#answer-${button.dataset.answer}`);
      box.classList.toggle("is-visible");
      button.textContent = box.classList.contains("is-visible") ? "Hide answer" : "Show answer";
    });
  });
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function emptyState() {
  const template = document.querySelector("#empty-state-template");
  return template.innerHTML;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

async function callClaude(userMessage, context = "") {
  const key = localStorage.getItem("boardbridge_api_key");
  if (!key) return null;
  const system = context ? `${CLAUDE_SYSTEM}\n\nCurrent context:\n${context}` : CLAUDE_SYSTEM;
  try {
    const response = await fetchWithTimeout(CLAUDE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: userMessage }]
      })
    }, 30000);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    return null;
  }
}

function downloadPdf() {
  if (!state.paper || !window.jspdf) { window.print(); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 18;
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;
  let y = margin;

  function addText(text, { size = 11, bold = false, rgb = [23, 33, 31], indent = 0, gap = 3 } = {}) {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...rgb);
    const lines = doc.splitTextToSize(String(text), maxW - indent);
    lines.forEach((line) => {
      if (y > 272) { doc.addPage(); y = margin; }
      doc.text(line, margin + indent, y);
      y += size * 0.42;
    });
    y += gap;
  }

  const p = state.paper;
  addText("BOARDBRIDGE  ·  CBSE CLASS XII", { size: 8, rgb: [102, 113, 109] });
  y += 2;
  addText(`${p.subject.name} Practice Paper`, { size: 16, bold: true, gap: 4 });
  addText(`Time: ${p.duration / 60} hr${p.duration > 60 ? "s" : ""}   ·   Max Marks: ${p.total}   ·   ${DATA.examWindow}`, { size: 10, rgb: [102, 113, 109] });
  addText(`Pattern: ${p.subject.pattern.basis}`, { size: 8, rgb: [150, 160, 155] });
  y += 2;
  doc.setDrawColor(210, 220, 215);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  p.questions.forEach((q) => {
    addText(`Q${q.number}.  [${q.mark} mark${q.mark > 1 ? "s" : ""}]  ${q.meta}`, { size: 8, rgb: [102, 113, 109], gap: 1 });
    addText(q.prompt, { size: 11, bold: true, gap: 5 });
    if (p.showAnswers) {
      const raw = q.answerHtml
        ? q.answerHtml.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim()
        : q.answer;
      addText(raw, { size: 9, indent: 5, rgb: [32, 81, 75], gap: 5 });
    }
    y += 2;
  });

  doc.save(`BoardBridge_${p.subject.name.replace(/\s+/g, "_")}_Paper.pdf`);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}

init();
