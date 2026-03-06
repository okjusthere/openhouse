type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string | null;
};

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || null;
}

function getReplyToAddress(replyTo?: string | null) {
  return replyTo || process.env.RESEND_REPLY_TO_EMAIL || null;
}

function toHtml(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getFromAddress());
}

export async function sendTransactionalEmail({ to, subject, text, replyTo }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getFromAddress();

  if (!apiKey || !from) {
    throw new Error("Transactional email is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html: toHtml(text),
      reply_to: getReplyToAddress(replyTo) || undefined,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Email delivery failed: ${payload}`);
  }

  return response.json();
}
