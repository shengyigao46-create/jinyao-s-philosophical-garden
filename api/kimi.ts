export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing KIMI_API_KEY' });
  }

  const rawBody = req.body ?? {};
  const body =
    typeof rawBody === 'string'
      ? JSON.parse(rawBody || '{}')
      : rawBody;

  const { model = 'moonshot-v1-8k', messages, temperature = 0.7 } = body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing messages array' });
  }

  try {
    const upstream = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, temperature })
    });

    const text = await upstream.text();
    const isJson = (upstream.headers.get('content-type') || '').includes('application/json');

    if (!isJson) {
      return res.status(upstream.status).send(text);
    }

    const data = JSON.parse(text);
    return res.status(upstream.status).json(data);
  } catch (err: any) {
    console.error('Kimi proxy error', err);
    return res.status(500).json({ error: err?.message || 'Kimi proxy failed' });
  }
}
