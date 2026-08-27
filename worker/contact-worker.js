/**
 * gregdallas.com contact form — Cloudflare Worker.
 *
 * The site itself is static and lives on GitHub Pages. This Worker exists for
 * the one thing a static host can't do: send mail without exposing an API key.
 * Same split as the Practice Lab tools.
 *
 * Deploy at dash.cloudflare.com → Workers & Pages → Create → paste this in.
 * Then set, under the Worker's Settings → Variables:
 *
 *   RESEND_API_KEY   secret — from resend.com
 *   CONTACT_TO       gregdallasmusic@gmail.com
 *   CONTACT_FROM     optional, defaults to site@gregdallas.com
 *                    (its domain must be verified with Resend)
 */

const ALLOWED_ORIGINS = [
  "https://gregdallas.com",
  "https://www.gregdallas.com",
  "https://grdallas.github.io"
];

const MAX = { name: 200, email: 320, topic: 60, message: 5000 };

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin"
});

const json = (status, body, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
  });

const clean = (v, limit) => (typeof v === "string" ? v.trim().slice(0, limit) : "");

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

async function handlePost(request, env, origin) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: "Invalid request." }, origin);
  }

  // Honeypot — bots fill this in, humans never see it. Return 200 so the bot
  // believes it succeeded and doesn't retry.
  if (clean(data.company, 100)) return json(200, { ok: true }, origin);

  const name = clean(data.name, MAX.name);
  const email = clean(data.email, MAX.email);
  const topic = clean(data.topic, MAX.topic) || "General";
  const message = clean(data.message, MAX.message);

  if (!name || !email || !message) {
    return json(400, { error: "Name, email, and message are all required." }, origin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: "That email address doesn't look right." }, origin);
  }

  // Reports which variable is absent, and what bindings the Worker can
  // actually see, so a misnamed or undeployed variable is obvious. Names
  // only — never values.
  const missing = ["RESEND_API_KEY", "CONTACT_TO"].filter((k) => !env[k]);
  if (missing.length) {
    const seen = Object.keys(env).sort();
    console.error("Contact form not configured. Missing:", missing.join(", "), "| Bindings seen:", seen.join(", ") || "(none)");
    return json(500, {
      error: "The form isn't configured yet.",
      missing,
      seen
    }, origin);
  }

  const body = [
    `Name:  ${name}`,
    `Email: ${email}`,
    `Topic: ${topic}`,
    "",
    message
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `gregdallas.com <${env.CONTACT_FROM || "site@gregdallas.com"}>`,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `[${topic}] ${name} via gregdallas.com`,
      text: body,
      html: `<pre style="font:14px/1.6 ui-monospace,monospace;white-space:pre-wrap">${escapeHtml(body)}</pre>`
    })
  });

  if (!res.ok) {
    console.error("Resend rejected the message:", res.status, await res.text());
    return json(502, { error: "Couldn't send that right now." }, origin);
  }

  return json(200, { ok: true }, origin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "POST, OPTIONS", ...corsHeaders(origin) }
      });
    }
    return handlePost(request, env, origin);
  }
};
