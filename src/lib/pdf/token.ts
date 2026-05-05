import crypto from "crypto";
import { env } from "@/env";

// Short-lived signed URL granting one-time access to /print/resume/[id].
// Playwright runs server-side in our own Node process, so it can't carry the
// user's session cookies. The URL itself becomes the auth — same pattern as
// S3 presigned URLs. Token format: `<base64url(payload)>.<base64url(sig)>`.

const TTL_SECONDS = 60;
const ALGO = "sha256";

type TokenPayload = {
  aid: string; // application id this token is scoped to
  uid: string; // user id who owns the application
  exp: number; // unix epoch SECONDS — must agree on units between sign + verify
};

export type VerifyResult =
  | { valid: true; userId: string }
  | {
      valid: false;
      reason: "malformed" | "bad_signature" | "expired" | "scope_mismatch";
    };

// URL-safe base64. URLs choke on +, /, = so we substitute - _ and strip padding.
function base64UrlEncode(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Buffer {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

// Symmetric HMAC — same secret signs and verifies. Server-only; never expose.
function hmac(data: string): string {
  const buffer = crypto.createHmac(ALGO, env.AUTH_SECRET).update(data).digest();
  return base64UrlEncode(buffer);
}

export function signPrintToken(applicationId: string, userId: string): string {
  const payload: TokenPayload = {
    aid: applicationId,
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = hmac(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyPrintToken(
  token: string,
  expectedApplicationId: string,
): VerifyResult {
  // Structural reject is the cheapest gate — do it first.
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false, reason: "malformed" };
  const [payloadEncoded, providedSig] = parts;

  // Recompute the signature server-side and constant-time compare. timingSafeEqual
  // throws on length mismatch, so guard first — otherwise the throw itself becomes
  // a timing oracle leaking signature length.
  const expectedSig = hmac(payloadEncoded);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: "bad_signature" };
  }

  // Signature is proven; only now do we spend cycles parsing the payload. Doing
  // this earlier would let an attacker time JSON parse errors over forged inputs.
  let payload: TokenPayload;
  try {
    payload = JSON.parse(
      base64UrlDecode(payloadEncoded).toString("utf8"),
    ) as TokenPayload;
  } catch {
    return { valid: false, reason: "malformed" };
  }

  // Scope check distinguishes "authentic" from "authorized for THIS resource".
  // Without it, one valid token would unlock every application the user owns.
  if (payload.aid !== expectedApplicationId) {
    return { valid: false, reason: "scope_mismatch" };
  }

  if (Math.floor(Date.now() / 1000) > payload.exp) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, userId: payload.uid };
}
