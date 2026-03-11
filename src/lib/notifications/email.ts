import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({
      from: "Rezervace <noreply@tvoje-domena.cz>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email error:", err);
  }
}
