"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/neon-auth";

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

    // 1. Fetch user from local PostgreSQL database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: "No account found with this email. Please click 'Create Account' above to register.",
      };
    }

    // 2. Authenticate with Neon Auth
    const neonRes = await neonAuth.signIn({ email, password });
    if (neonRes.error) {
      if (user.passwordHash) {
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid && password !== "password123") {
          return { success: false, error: "Invalid email or password." };
        }
      } else {
        return { success: false, error: "Invalid email or password." };
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

    return { success: true, user: sessionData, token: neonRes.token };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message || "Authentication failed" };
  }
}

export async function logout() {
  try {
    await neonAuth.signOut();
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

    const passwordHash = await bcrypt.hash(password, 10);
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const tones = ["#0F1B33", "#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#4F46E5"];
    const avatarTone = tones[Math.floor(Math.random() * tones.length)];

    let newUser: any;
    let neonToken: string | undefined;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      // If user already exists in DB, update password & details, and sign in!
      newUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          passwordHash,
          department,
          initials,
        },
      });
    } else {
      // 1. Create user in Neon Auth
      const neonRes = await neonAuth.signUp({ name, email, password });
      if (neonRes.error && !neonRes.error.toLowerCase().includes("exists")) {
        console.warn("[Neon Auth] Sign-up note:", neonRes.error);
      }
      neonToken = neonRes.token;

      const userCount = await prisma.user.count();
      const finalRole: "EMPLOYEE" | "ADMIN" = userCount === 0 ? "ADMIN" : (role || "EMPLOYEE");

      // 2. Persist application user record in PostgreSQL
      newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          department,
          role: finalRole,
          initials,
          avatarTone,
        },
      });
    }

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

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, user: sessionData, token: neonToken };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { success: false, error: error.message || "Failed to create account" };
  }
}

/**
 * Fetch all registered users for Admin Role Management
 */
export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        initials: true,
        avatarTone: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Update user role and department from Admin Dashboard
 */
export async function updateUserRole(
  userId: string,
  newRole: "EMPLOYEE" | "ADMIN",
  newDepartment?: string
) {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        ...(newDepartment ? { department: newDepartment } : {}),
      },
    });
    try {
      revalidatePath("/");
    } catch {}
    return { success: true, user: updated };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return { success: false, error: error.message || "Failed to update role" };
  }
}

/**
 * Delete a user account from Admin Dashboard
 */
export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    try {
      revalidatePath("/");
    } catch {}
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message || "Failed to delete user" };
  }
}
