// src/lib/visitor.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";

const COOKIE_NAME = "visitor_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Returns a stable anonymous id for the calling browser. Reads the
 * `visitor_id` cookie if present; otherwise mints a UUID and sets it as an
 * HttpOnly cookie on the response. No personal data — a functional cookie.
 */
export function getVisitorId(
  req: NextApiRequest,
  res: NextApiResponse,
): string {
  const existing = req.cookies[COOKIE_NAME];
  if (existing) return existing;

  const id = randomUUID();
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_SECONDS}`,
  );
  return id;
}
