# BoardBridge - CBSE Class XII Study App

BoardBridge is a static browser app for CBSE Class XII board preparation for:

- Legal Studies
- Psychology
- Economics
- Political Science
- English Core
- Applied Art - Commercial Art

It includes official syllabus-aligned subject data, concept coaching, fresh pop quizzes, test paper generation by chapter and marks category, answer reveal, print-to-PDF output, and a bounded assistant that only responds from the local knowledge base or the generated paper.

The study section uses click-to-expand topic lessons. The assistant and answer reveal attempt live source fetching from official CBSE references through readable-source endpoints, then fall back to source links if the browser or host blocks fetching.

## Run Locally

Open `index.html` directly in a browser, or serve the folder for the installable PWA experience:

```powershell
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Free Hosting

This app has no build step and no server dependency, so it can be hosted on:

- GitHub Pages
- Google Firebase Hosting free tier
- Cloudflare Pages free tier
- Netlify free tier

For GitHub Pages, upload these files to a repository and enable Pages from the repository settings.

See `GITHUB_SETUP.md` for the exact first-push and GitHub Pages steps.

## Source Boundary

The app uses official CBSE references for the 2026-27 curriculum and the latest public sample-paper structures. It does not copy full textbook chapters. To include full textbook-level explanations, use licensed or user-provided material and add it through a future content-ingestion pipeline.

For live web grounding, the static app tries readable web fetches from the browser. For production reliability, connect a small source proxy using `window.BOARDBRIDGE_SOURCE_PROXY` as described in `GITHUB_SETUP.md`.

Primary official references:

- CBSE Curriculum 2026-27: https://cbseacademic.nic.in/curriculum_2027.html
- CBSE release circular Acad-14/2026: https://cbseacademic.nic.in/web_material/Circulars/2026/14_Circular_2026.pdf
- CBSE Class XII sample papers 2025-26: https://cbseacademic.nic.in/SQP_CLASSXII_2025-26.html
- CBSE previous years question papers: https://www.cbse.gov.in/cbsenew/question-paper.html

## Next Build Steps

- Add a PDF ingestion workflow for licensed textbooks and official past papers.
- Store extracted chunks with source page references.
- Replace the local bounded assistant with a retrieval-first AI backend.
- Add a teacher/parent dashboard for progress and weak-topic tracking.
