type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type BrevoError = {
  message?: string;
};

export async function sendBrevoEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput) {
  const apiKey = process.env.BRAVO_API_KEY;
  const senderEmail = process.env.BRAVO_SENDER_EMAIL;
  const senderName = process.env.BRAVO_SENDER_NAME || "Support";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo email config missing");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as BrevoError | null;
    const message = err?.message || "Brevo email failed";
    throw new Error(message);
  }
}
