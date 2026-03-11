import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReservationEmail({
  to,
  customerName,
  serviceName,
  employeeName,
  startTime,
}: {
  to: string;
  customerName: string;
  serviceName: string;
  employeeName: string;
  startTime: string;
}) {
  if (!to) return; // email je volitelný

  const formatted = new Date(startTime).toLocaleString("cs-CZ");

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Potvrzení rezervace",
    html: `
      <h2>Potvrzení rezervace</h2>
      <p>Dobrý den, ${customerName},</p>
      <p>Vaše rezervace byla úspěšně vytvořena.</p>

      <p><strong>Služba:</strong> ${serviceName}</p>
      <p><strong>Zaměstnanec:</strong> ${employeeName}</p>
      <p><strong>Termín:</strong> ${formatted}</p>

      <p>Těšíme se na vás!</p>
    `,
  });
}
