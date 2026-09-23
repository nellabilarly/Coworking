import crypto from "node:crypto";

export type AuthTokenClaims = {
  id: number | string;
  username: string;
  role: "admin" | "member";
  [key: string]: unknown;
};

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "locazyy-development-secret";

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function createAuthToken(claims: AuthTokenClaims) {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ ...claims, iat: Math.floor(Date.now() / 1000) });
  const content = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(content).digest("base64url");
  return `${content}.${signature}`;
}

export function verifyAuthToken(token: string): AuthTokenClaims | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthTokenClaims;
  } catch {
    return null;
  }
}