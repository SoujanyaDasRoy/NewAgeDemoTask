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
      // Default to Master Admin if no session set
      let defaultUser = await prisma.user.findUnique({
        where: { email: "admin@newage.com" },
      });
      if (!defaultUser) {
        defaultUser = await prisma.user.findFirst();
      }
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

export async function signup(formData: {
  name: string;
  email: string;
  password?: string;
  department: string;
  role?: "EMPLOYEE" | "ADMIN";
}) {
  try {
    const name = formData.name?.trim();
    const email = formData.email?.trim().toLowerCase();
    const password = formData.password?.trim() || "password123";
    const department = formData.department?.trim() || "Product Team";
    const role = formData.role || "EMPLOYEE";

    if (!name || !email) {
      return { success: false, error: "Name and email are required." };
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const tones = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#4F46E5"];
    const avatarTone = tones[Math.floor(Math.random() * tones.length)];

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        department,
        role,
        initials,
        avatarTone,
      },
    });

    const sessionData: SessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as "EMPLOYEE" | "ADMIN",
      department: newUser.department,
      initials: newUser.initials,
      avatarTone: newUser.avatarTone,
    };

    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    } catch {}

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "User signed up",
        userName: newUser.name,
        detail: `New ${newUser.role.toLowerCase()} account created for ${newUser.department}`,
      },
    });

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, user: sessionData };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { success: false, error: error.message || "Failed to create account" };
  }
}
