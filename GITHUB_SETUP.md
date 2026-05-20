# GitHub Setup

This project is ready for GitHub Pages because it is a static app with no build step.

## First Push

```powershell
git init
git add .
git commit -m "Build BoardBridge CBSE study app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/boardbridge.git
git push -u origin main
```

## Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to Settings.
3. Open Pages.
4. Choose "Deploy from a branch".
5. Select `main` and `/root`.
6. Save.

The app will be available at:

```text
https://YOUR-USERNAME.github.io/boardbridge/
```

## Optional Source Proxy

The app can fetch official source pages directly through a readable web endpoint. Broader web search should go through a proxy because search APIs usually require keys that should not be exposed in browser code. If you later add a Cloudflare Worker, Google Cloud Function, or Firebase Function, set this before `app.js` loads:

```html
<script>
  window.BOARDBRIDGE_SOURCE_PROXY = "https://your-worker.example.com/source";
</script>
```

The proxy should accept JSON:

```json
{
  "query": "CBSE Class XII Economics Money and Banking",
  "targets": [{ "title": "Economics curriculum", "url": "https://..." }]
}
```

And return:

```json
{
  "sources": [{ "title": "Source title", "type": "Official source", "url": "https://..." }],
  "snippets": ["Short source-backed point to use in the answer."],
  "warnings": []
}
```
