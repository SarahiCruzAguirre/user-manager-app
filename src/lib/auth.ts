// lib/auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// JWT helpers used by API routes.
//
// WHAT IS A JWT?
//   JSON Web Token — a compact, URL-safe string with three parts separated by dots:
//     header.payload.signature
//   The payload carries arbitrary claims (userId, role, email …).
//   The signature proves the token wasn't tampered with — you need the secret
//   key to produce or verify it.
//
// HOW THE AUTH FLOW WORKS END-TO-END:
//   1. POST /api/auth/login   →  validate credentials, sign a JWT, return it
//   2. Client stores the JWT in localStorage under the key "token"
//   3. Every protected API call sends Authorization: Bearer <token>
//   4. API route calls verifyToken() to decode and validate it
//   5. If valid → handle the request; if not → 401 Unauthorized
// ─────────────────────────────────────────────────────────────────────────────

import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

// The secret is loaded from the environment at module-init time.
// Using a non-null assertion (!) is fine here because we also guard against it
// being missing in lib/mongodb.ts (a startup check that fails loud and early).
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d"

// The shape of the data we embed inside the token payload.
export interface TokenPayload {
  userId: string
  email: string
  role: "user" | "admin"
  nombre: string
  cc: string
}

// signToken() creates a signed JWT string from a payload object.
// The token expires according to JWT_EXPIRES_IN (default 7 days).
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

// verifyToken() takes a raw string and returns the decoded payload,
// or null if the token is invalid, expired, or tampered with.
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    // jwt.verify throws for expired, malformed, or wrongly-signed tokens.
    return null
  }
}

// getTokenFromRequest() is a small helper that extracts the Bearer token from
// an incoming Next.js API request's Authorization header.
// Returns null if the header is missing or malformed.
export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return authHeader.slice(7)   // "Bearer " is 7 characters
}
