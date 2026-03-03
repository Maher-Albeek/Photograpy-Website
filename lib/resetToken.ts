import crypto from "crypto";

const DEFAULT_TTL_MINUTES = 30;

type ResetTokenPayload = {
  email: string;
  exp: number;
  v: 1;
};

function getSecret() {
  const secret = process.env.RESET_PASSWORD_SECRET;
  if (!secret) {
    throw new Error("RESET_PASSWORD_SECRET is not set");
  }
  return secret;
}

function getTtlMinutes() {
  const raw = process.env.RESET_PASSWORD_TTL_MINUTES;
  if (!raw) return DEFAULT_TTL_MINUTES;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MINUTES;
}

export function createResetToken(email: string) {
  const exp = Date.now() + getTtlMinutes() * 60_000;
  const payload: ResetTokenPayload = { email, exp, v: 1 };
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payloadEncoded)
    .digest("base64url");

  return `${payloadEncoded}.${signature}`;
}

export function verifyResetToken(token: string) {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    throw new Error("Invalid token");
  }

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payloadEncoded)
    .digest();
  const actual = Buffer.from(signature, "base64url");

  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    throw new Error("Invalid token");
  }

  const payloadRaw = Buffer.from(payloadEncoded, "base64url").toString("utf8");
  const payload = JSON.parse(payloadRaw) as ResetTokenPayload;

  if (!payload || typeof payload.email !== "string" || typeof payload.exp !== "number") {
    throw new Error("Invalid token");
  }

  if (Date.now() > payload.exp) {
    throw new Error("Token expired");
  }

  return payload;
}
