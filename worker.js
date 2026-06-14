/**
 * Cloudflare Worker — прокси для Telegram Bot API.
 * Нужен потому что api.telegram.org заблокирован у части российских провайдеров.
 *
 * Деплой:
 *   1. Зайдите на https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Вставьте содержимое этого файла и нажмите Deploy
 *   3. В настройках Worker → Settings → Variables → Secrets добавьте:
 *        TG_BOT = <токен вашего бота>
 *   4. Скопируйте URL воркера (вида https://xxx.workers.dev)
 *      и вставьте его в переменную PROXY_URL в index.html
 */

const TG_BOT = '8920739648:AAHsMbgMFuJ5VekS8-GIpbRO-u2KK19smfE';
const TG_API = 'https://api.telegram.org/bot';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const tgRes = await fetch(`${TG_API}${TG_BOT}/sendMessage`, {
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
  },
};
