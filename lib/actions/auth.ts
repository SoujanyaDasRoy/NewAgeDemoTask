"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "ADMIN";
  department: string;
  initials: string;
  avatarTone: string;
}

const SESSION_COOKIE = "newage_session_user";

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie?.value) {
      // Default to Manvi Mehta if no session set
      const defaultUser = await prisma.user.findUnique({
        where: { email: "manvi@newage.com" },
      });
      if (defaultUser) {
        return {
          id: defaultUser.id,
          name: defaultUser.name,
          email: defaultUser.email,
          role: defaultUser.role as "EMPLOYEE" | "ADMIN",
          department: defaultUser.department,
          initials: defaultUser.initials,
          avatarTone: defaultUser.avatarTone,
        };
      }
      return null;
    }
    return JSON.parse(sessionCookie.value) as SessionUser;
  } catch (error) {
    console.error("Error reading session:", error);
    return null;
  }
}

export async function login(formData: { email: string; password?: string }) {
  try {
    const email = formData.email?.trim().toLowerCase();
    const password = formData.password || "password123";

    if (!email) {
      return { success: false, error: "Please enter your email address." };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "User not found. Check email or use demo accounts." };
    }

    // Verify bcrypt password if passwordHash exists
    if (user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid && password !== "password123") {
        return { success: false, error: "Invalid password. Default demo password is password123." };
      }
    }

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
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    } catch {}

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, user: sessionData };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message || "Authentication failed" };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
  } catch {}
  try {
    revalidatePath("/");
  } catch {}
  redirect("/login");
}

export async function switchSessionUser(email: string) {
  return await login({ email, password: "password123" });
}
