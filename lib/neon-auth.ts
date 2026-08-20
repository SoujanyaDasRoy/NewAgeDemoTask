/**
 * Official Neon Auth Client Integration
 * Connects directly to Neon's Managed Better-Auth endpoints:
 * Auth URL: https://ep-nameless-wave-azmj2evg.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth
 * JWKS URL: https://ep-nameless-wave-azmj2evg.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json
 */

const NEON_AUTH_BASE_URL =
  process.env.NEON_AUTH_URL ||
  "https://ep-nameless-wave-azmj2evg.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth";

export interface NeonAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NeonAuthSession {
  user: NeonAuthUser;
  token?: string;
  session?: {
    id: string;
    userId: string;
    expiresAt: string;
  };
}

export class NeonAuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = NEON_AUTH_BASE_URL.replace(/\/$/, "");
  }

  /**
   * Sign up a new user through Neon Auth
   */
  async signUp(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user?: NeonAuthUser; token?: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: params.email.trim().toLowerCase(),
          password: params.password,
          name: params.name.trim(),
          callbackURL: process.env.NEXT_PUBLIC_APP_URL || "https://new-age-portal.vercel.app",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data?.message || data?.error || "Neon Auth sign up failed" };
      }

      return {
        user: data?.user || {
          id: data?.id || `neon_${Date.now()}`,
          name: params.name,
          email: params.email,
        },
        token: data?.token || data?.session?.token,
      };
    } catch (err: any) {
      console.error("[Neon Auth] Sign-up error:", err);
      return { error: err.message || "Failed to reach Neon Auth server" };
    }
  }

  /**
   * Sign in an existing user through Neon Auth
   */
  async signIn(params: {
    email: string;
    password: string;
  }): Promise<{ user?: NeonAuthUser; token?: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: params.email.trim().toLowerCase(),
          password: params.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data?.message || data?.error || "Invalid email or password" };
      }

      return {
        user: data?.user || {
          id: data?.id || `neon_${Date.now()}`,
          name: data?.name || params.email.split("@")[0],
          email: params.email,
        },
        token: data?.token || data?.session?.token,
      };
    } catch (err: any) {
      console.error("[Neon Auth] Sign-in error:", err);
      return { error: err.message || "Failed to reach Neon Auth server" };
    }
  }

  /**
   * Sign out from Neon Auth
   */
  async signOut(token?: string): Promise<{ success: boolean }> {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${this.baseUrl}/sign-out`, {
        method: "POST",
        headers,
      });

      return { success: true };
    } catch (err) {
      console.error("[Neon Auth] Sign-out error:", err);
      return { success: true }; // Treat as signed out locally
    }
  }

  /**
   * Fetch JWKS public key set for token verification
   */
  async getJwks() {
    try {
      const res = await fetch(`${this.baseUrl}/.well-known/jwks.json`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("[Neon Auth] JWKS fetch error:", e);
    }
    return null;
  }
}

export const neonAuth = new NeonAuthService();
