// PATH: src/lib/email/sendNotification.ts
const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function sendBookingNotification(to: string, subject: string, body: string) {
  if (!RESEND_API_KEY || !to) return null

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Clientoro <notifications@clientoro.pro>',
        to: [to],
        subject,
        html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1);padding:20px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:20px;">🌊 Clientoro</h1>
          </div>
          <div style="background:white;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
            <p style="color:#111;font-size:16px;font-weight:bold;margin:0 0 12px;">${subject}</p>
            <p style="color:#374151;font-size:14px;line-height:1.6;">${body}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
            <p style="color:#9ca3af;font-size:12px;text-align:center;">Powered by Clientoro</p>
          </div>
        </div>`,
      }),
    })
    return res.ok
  } catch (e) {
    console.error('[sendEmail]', e)
    return false
  }
}
