const TG_API = 'https://api.telegram.org/bot';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const token = env.TG_BOT;
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'Not configured' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const tgRes = await fetch(`${TG_API}${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: body.chat_id,
      text: body.text,
      disable_web_page_preview: true,
    }),
  });

  const data = await tgRes.json();
  return new Response(JSON.stringify(data), {
    status: tgRes.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
