import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/actions/magic-link";

/**
 * Magic-link landing endpoint. Validates the token via the server action and
 * redirects on success or returns a friendly error page on failure.
 *
 * Mounted at /auth/magic so URLs don't collide with the rest of the app.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }
  const result = await consumeMagicLink(token);
  if (result && result.success === false) {
    const html = `<!doctype html><html><body style="font-family:system-ui;padding:48px;text-align:center;color:#0f172a"><h1>Magic link error</h1><p>${result.error ?? "Invalid or expired link"}</p><p><a href="/login">Back to sign in</a></p></body></html>`;
    return new NextResponse(html, { status: 400, headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return NextResponse.redirect(new URL("/", req.url));
}