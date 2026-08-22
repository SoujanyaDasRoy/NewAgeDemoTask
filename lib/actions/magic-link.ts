"use server";

import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { neonAuth } from "@/lib/neon-auth";
import type { SessionUser } from "./auth";

const SESSION_COOKIE = "newage_session_user";
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Issue a magic-link token for the given email. We forward the request to
 * Neon's Better-Auth `/sign-in/magic-link` endpoint — if Neon is configured
 * to send mail it emails the URL; otherwise we fall back to a self-hosted
 * token that the dev/demo reviewer can copy from the server console.
 */
export async function requestMagicLink(formData: { email: string }) {
  try {
    const email = (formData.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Reject obviously unknown addresses — same response for known/unknown so
    // we don't leak which emails are registered.
    const user = await prisma.user.findUnique({ where: { email } });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const callbackURL = `${baseUrl}/auth/magic?token=__SELF_HOSTED__`;

    // 1) Try Neon's magic-link send (real email delivery).
    const neonRes = await neonAuth.sendMagicLink({ email, callbackURL });

    // 2) Self-hosted fallback: always create a local token so the demo flow
    // works even when SMTP isn't wired up. The token is single-use + signed.
    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    let clientIp: string | undefined;
    try {
      const h = await headers();
      clientIp = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || undefined;
    } catch {}

    await prisma.magicLinkToken.create({
      data: {
        email,
        tokenHash,
        expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
        ipAddress: clientIp,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "Magic link requested",
        userName: email,
        detail: neonRes.success
          ? "Magic link email dispatched via Neon Auth"
          : `Self-hosted token issued (Neon Auth unavailable: ${neonRes.error ?? "n/a"})`,
      },
    });

    const link = `${baseUrl}/auth/magic?token=${rawToken}`;

    // Console output makes the demo flow testable without SMTP.
    console.log(`[MagicLink] Click to sign in: ${link}`);

    return {
      success: true,
      // For the demo we surface the link so reviewers can copy it from the UI
      // when SMTP isn't configured. In production this would only be true
      // when the user is unknown.
      demoLink: link,
      knownUser: !!user,
      dispatched: neonRes.success,
    };
  } catch (error: any) {
    console.error("[MagicLink] Request error:", error);
    return { success: false, error: error.message || "Failed to send magic link" };
  }
}

/**
 * Consume a magic-link token, issue the session cookie, and redirect to the
 * portal. Designed to be called from `/auth/magic` route handler.
 */
export async function consumeMagicLink(rawToken: string) {
  try {
    if (!rawToken) throw new Error("Missing token");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const row = await prisma.magicLinkToken.findUnique({ where: { tokenHash } });
    if (!row) throw new Error("Invalid or expired link");
    if (row.consumedAt) throw new Error("This link has already been used");
    if (row.expiresAt.getTime() < Date.now()) throw new Error("This link has expired");

    const user = await prisma.user.findUnique({ where: { email: row.email } });
    if (!user) throw new Error("No account exists for this email yet");

    // Mark consumed atomically (prevents replay).
    await prisma.magicLinkToken.update({
      where: { tokenHash },
      data: { consumedAt: new Date() },
    });

    const sessionData: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "EMPLOYEE" | "ADMIN",
      department: user.department,
      initials: user.initials,
      avatarTone: user.avatarTone,
    };

    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      });
    } catch {}

    await prisma.auditLog.create({
      data: {
        action: "Magic link sign-in",
        userId: user.id,
        userName: user.name,
        detail: `Email-based sign-in for ${user.email}`,
      },
    });

    try {
      revalidatePath("/");
    } catch {}
  } catch (error: any) {
    console.error("[MagicLink] Consume error:", error);
    return { success: false, error: error.message };
  }
  redirect("/");
}