import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSms(to: string, message: string) {
  if (!process.env.TWILIO_PHONE) {
    console.error("TWILIO_PHONE není nastaveno");
    return;
  }

  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to,
  });
}
