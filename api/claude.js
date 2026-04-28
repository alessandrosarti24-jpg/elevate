export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  }

  try {
    // Vercel sometimes needs manual body parsing
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { messages } = body || {};

    if (!messages) {
      return res.status(400).json({ error: 'No messages in request body' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages,
      }),
    });

    const data = await response.json();

    // Log Anthropic's error clearly
    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data));
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error', detail: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
