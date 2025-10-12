export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    console.log('Loaded API key:', OPENROUTER_API_KEY?.slice(0, 6) + '...');

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'Missing server-side API key' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('OpenRouter response status:', response.status);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse OpenRouter JSON:', e);
      data = { error: 'Invalid JSON response from OpenRouter' };
    }

    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    console.error('Server proxy error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
