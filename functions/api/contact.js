/**
 * POST /api/contact — contact form handler.
 *
 * Deployed automatically by Cloudflare Pages from this file's path.
 * Requires two environment variables set in the Pages project settings:
 *
 *   RESEND_API_KEY   secret — from resend.com
 *   CONTACT_TO       the address that should receive the messages
 *
 * Optional:
 *   CONTACT_FROM     defaults to "site@gregdallas.com" — must be on a
 *                    domain verified with Resend.
 */

const MAX = { name: 200, email: 320, topic: 60, message: 5000 };

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

const clean = (v, limit) =>
  typeof v === "string" ? v.trim().slice(0, limit) : "";

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

async function handlePost(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: "Invalid request." });
  }

  // Honeypot — bots fill this in, humans never see it. Return 200 so the
  // bot believes it succeeded and doesn't retry.
  if (clean(data.company, 100)) return json(200, { ok: true });

  const name = clean(data.name, MAX.name);
  const email = clean(data.email, MAX.email);
  const topic = clean(data.topic, MAX.topic) || "General";
  const message = clean(data.message, MAX.message);

  if (!name || !email || !message) {
    return json(400, { error: "Name, email, and message are all required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: "That email address doesn't look right." });
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    console.error("Contact form is not configured: missing RESEND_API_KEY or CONTACT_TO.");
    return json(500, { error: "The form isn't configured yet." });
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
    return json(502, { error: "Couldn't send that right now." });
  }

  return json(200, { ok: true });
}

// Single entry point so there's no ambiguity about which handler Pages picks.
export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "POST" }
    });
  }
  return handlePost(context.request, context.env);
}
