# Cloudflare Worker Setup — BoardBridge AI Proxy

This Worker holds your Anthropic API key as a server secret.  
Once deployed, **no device needs to enter an API key** — BoardBridge just works everywhere.

---

## What you need
- A free Cloudflare account (cloudflare.com — takes 2 minutes to sign up)
- Your Anthropic API key (from console.anthropic.com)

---

## Step-by-step

### 1 — Sign up / log in to Cloudflare
Go to **https://dash.cloudflare.com** and sign in (or create a free account).

---

### 2 — Create a new Worker

1. In the left sidebar click **Workers & Pages**
2. Click the **Create** button (top right)
3. Click **Create Worker**
4. Give it a name — e.g. `boardbridge-proxy`
5. Click **Deploy** (this deploys a placeholder — you will replace the code next)

---

### 3 — Paste the Worker code

1. After deploying, click **Edit code** (or **< > Code** tab)
2. Delete all the existing placeholder code in the editor
3. Open the file `worker.js` from your BoardBridge project folder  
   *(D:\Advik Class 12\Advik\worker.js)*  
   Copy its entire contents and paste into the Cloudflare editor
4. Click **Deploy** (top right of the editor)

---

### 4 — Add your Anthropic API key as a secret

This is the step that keeps your key safe — it is stored encrypted, never in code.

1. Go back to your Worker's overview page (click its name in the breadcrumb)
2. Click the **Settings** tab
3. Scroll to **Variables and Secrets**
4. Click **Add** → choose **Secret**
5. Name: `ANTHROPIC_API_KEY`  
   Value: your key starting with `sk-ant-…`
6. Click **Deploy** to save

---

### 5 — Note your Worker URL

Your Worker URL looks like:

```
https://boardbridge-proxy.YOUR-SUBDOMAIN.workers.dev
```

You can find it on the Worker overview page under **Preview URL** or at the top of the editor.

**Copy this URL** — you will need it for the next step.

---

### 6 — Tell the app to use your Worker

Send the Worker URL to your developer (or paste it in the chat here).  
The `app.js` file will be updated with your URL in one line:

```js
const WORKER_URL = "https://boardbridge-proxy.YOUR-SUBDOMAIN.workers.dev";
```

After that change is pushed to GitHub, the site will use the Worker automatically on every device — no API key entry needed anywhere.

---

## Free tier limits

Cloudflare Workers free tier includes **100,000 requests per day**.  
Each AI question = 1 request.  
This is more than enough for a single student.

---

## Security notes

- The Worker only accepts requests from `divakarSharma-ddmr.github.io` (your site).
- Anyone else's browser hitting your Worker URL directly gets a `403 Forbidden`.
- The Anthropic key is never in the browser, never in the repository, never in any URL.
