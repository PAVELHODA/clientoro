import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Clientoro <noreply@clientoro.pro>',
      to,
      subject,
      html,
    })
    if (error) { console.error('Email error:', error); return { success: false, error } }
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: err }
  }
}

export async function sendBookingConfirmation({ to, customerName, serviceName, staffName, date, time, price, orgName }: { to: string; customerName: string; serviceName: string; staffName?: string; date: string; time: string; price?: number; orgName: string }) {
  return sendEmail({
    to,
    subject: 'Potvrzeni rezervace - ' + orgName,
    html: '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><div style="background:linear-gradient(135deg,#0c4a6e,#0369a1);padding:24px;border-radius:12px 12px 0 0;text-align:center"><h1 style="color:white;margin:0;font-size:22px">Clientoro</h1></div><div style="background:white;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px"><h2 style="color:#111;margin:0 0 16px">Rezervace potvrzena</h2><p style="color:#6b7280">Dobry den ' + customerName + ', vase rezervace byla uspesne vytvorena.</p><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0"><p><strong>Sluzba:</strong> ' + serviceName + '</p><p><strong>Datum:</strong> ' + date + ' v ' + time + '</p>' + (staffName ? '<p><strong>Specialista:</strong> ' + staffName + '</p>' : '') + (price ? '<p><strong>Cena:</strong> ' + price + ' Kc</p>' : '') + '</div><p style="color:#6b7280;font-size:13px">Provozovatel: <strong>' + orgName + '</strong></p><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"><p style="color:#9ca3af;font-size:12px;text-align:center">Clientoro - Vasi klienti jsou zlato</p></div></div>',
  })
}

export async function sendOwnerNotification({ to, customerName, customerPhone, serviceName, staffName, date, time, orgName }: { to: string; customerName: string; customerPhone: string; serviceName: string; staffName?: string; date: string; time: string; orgName: string }) {
  return sendEmail({
    to,
    subject: 'Nova rezervace - ' + customerName,
    html: '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><div style="background:linear-gradient(135deg,#0c4a6e,#0369a1);padding:24px;border-radius:12px 12px 0 0;text-align:center"><h1 style="color:white;margin:0;font-size:22px">Clientoro</h1></div><div style="background:white;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px"><h2 style="color:#111;margin:0 0 16px">Nova rezervace!</h2><p style="color:#6b7280">Mate novou rezervaci v ' + orgName + '.</p><div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0"><p><strong>Klient:</strong> ' + customerName + '</p><p><strong>Telefon:</strong> ' + customerPhone + '</p><p><strong>Sluzba:</strong> ' + serviceName + '</p><p><strong>Datum:</strong> ' + date + ' v ' + time + '</p>' + (staffName ? '<p><strong>Specialista:</strong> ' + staffName + '</p>' : '') + '</div><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"><p style="color:#9ca3af;font-size:12px;text-align:center">Clientoro - Vasi klienti jsou zlato</p></div></div>',
  })
}