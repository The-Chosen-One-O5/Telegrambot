/**
 * Cloudflare Pages Functions endpoint for Telegram webhook.
 * - Expects POST requests from Telegram with JSON body.
 * - Responds 200 quickly so Telegram stops retrying.
 * - You can expand logic later (validate secret token, call Telegram API, proxy to external service, etc.).
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // Optional: simple secret token check using a query param or header
  // Set TELEGRAM_WEBHOOK_SECRET in Pages project environment variables if you want to enable this
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret") || request.headers.get("x-telegram-secret");
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    if (!providedSecret || providedSecret !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid json" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  // Minimal acknowledgment response
  // You can add logic here: e.g., basic command handling or queuing
  // Example: log only in development (Pages preview)
  try {
    const isPreview = env?.CF_PAGES?.url || env?.CF_PAGES_URL;
    if (isPreview) {
      console.log("Telegram update:", JSON.stringify(update));
    }
  } catch {
    // ignore console issues
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// Optional: return 405 for non-POST
export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
}