export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Huella <noreply@huella.local>';

  if (!apiKey) {
    console.log('[email:stub]', { to, subject, text: text?.slice?.(0, 120) });
    return { id: 'stub', provider: 'stub' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Email provider error: ${res.status} ${t}`);
  }
  return res.json();
}
