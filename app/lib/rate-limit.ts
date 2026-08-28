import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimitWindows } from "@/db/schema";
import { sha256 } from "./api";

export async function consumeRateLimit(request: Request, route: string, limit: number, windowSeconds = 60) {
  const salt = process.env.RATE_LIMIT_HASH_SALT;
  if (!salt) return { allowed: process.env.NODE_ENV !== "production", retryAfter: windowSeconds, reason: "RATE_LIMIT_NOT_CONFIGURED" };
  const address = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const keyHash = await sha256(`${salt}:${address}`);
  const windowStart = Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds;
  const db = await getDb();
  const [existing] = await db.select().from(rateLimitWindows).where(and(eq(rateLimitWindows.keyHash, keyHash), eq(rateLimitWindows.route, route), eq(rateLimitWindows.windowStart, windowStart))).limit(1);
  if (existing && existing.requests >= limit) return { allowed: false, retryAfter: windowSeconds - (Math.floor(Date.now() / 1000) - windowStart), reason: "RATE_LIMITED" };
  if (existing) await db.update(rateLimitWindows).set({ requests: existing.requests + 1 }).where(and(eq(rateLimitWindows.keyHash, keyHash), eq(rateLimitWindows.route, route), eq(rateLimitWindows.windowStart, windowStart)));
  else await db.insert(rateLimitWindows).values({ keyHash, route, windowStart, requests: 1 });
  return { allowed: true, retryAfter: 0, reason: "OK" };
}
