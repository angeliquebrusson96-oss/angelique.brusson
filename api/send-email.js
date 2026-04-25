export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Bri'Blue <onboarding@resend.dev>";

    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'RESEND_API_KEY manquante dans Vercel Environment Variables' });
    }

    const { to, subject, html } = req.body || {};
    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, error: 'Champs manquants: to, subject, html' });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html })
    });

    const data = await resendResponse.json().catch(async () => ({ raw: await resendResponse.text() }));

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({ ok: false, error: data });
    }

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
}
