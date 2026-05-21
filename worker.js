/**
 * BoardBridge — Cloudflare Worker proxy
 *
 * Proxies requests from the BoardBridge site to the Anthropic API.
 * Your Anthropic API key is stored as a Worker Secret (ANTHROPIC_API_KEY)
 * and is NEVER exposed to browsers.
 *
 * Deploy steps: see CLOUDFLARE_SETUP.md
 */

/* Allow requests from these origins only (add your own domain if custom) */
const ALLOWED_ORIGINS = [
  "https://divakarSharma-ddmr.github.io",
  "https://divakarssharma-ddmr.github.io",  /* common capitalisation variants */
  "http://127.0.0.1",
  "http://localhost",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const originAllowed = ALLOWED_ORIGINS.some(o =>
      origin.toLowerCase().startsWith(o.toLowerCase())
    );

    /* CORS headers — only echo the origin back when it is whitelisted */
    const corsHeaders = {
      "Access-Control-Allow-Origin" : originAllowed ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age"      : "86400",
    };

    /* Pre-flight */
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    /* Block unexpected origins */
    if (!originAllowed) {
      return new Response(
        JSON.stringify({ error: { message: "Forbidden — origin not allowed." } }),
        { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    /* Check the API key secret is configured */
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: { message: "Worker misconfigured: ANTHROPIC_API_KEY secret not set." } }),
        { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }

    try {
      const body = await request.json();

      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method : "POST",
        headers: {
          "content-type"     : "application/json",
          "x-api-key"        : env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      const data = await anthropicRes.json();

      return new Response(JSON.stringify(data), {
        status : anthropicRes.status,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: { message: err.message || "Unknown proxy error." } }),
        { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }
  },
};
