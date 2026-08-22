/**
 * Centralized notification dispatcher.
 *
 * Wraps every notification creation site so we can apply user-level
 * preferences (opt-out + quiet hours) without scattering policy checks.
 *
 * Usage:
 *   await notify({
 *     userId: requester.id,
 *     eventType: "REQUEST_SUBMITTED",
 *     text: `Request ${id} submitted`,
 *     channel: "portal",
 *     tx,  // optional Prisma transaction client
 *   });
 *
 * If `userId` is null we fall back to a role-broadcast notification (current
 * behavior preserved). Preferences only apply to per-user notifications.
 */
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

export type NotificationEvent =
  | "REQUEST_SUBMITTED"
  | "REQUEST_APPROVED"
  | "REQUEST_REJECTED"
  | "PROVISIONED"
  | "ACCESS_ID_REQUESTED"
  | "ACCESS_ID_ISSUED"
  | "REQUEST_EXTENSION"
  | "REQUEST_AUTO_EXPIRED";

export interface NotifyOpts {
  userId?: string | null;
  role?: "employee" | "admin";
  eventType: NotificationEvent;
  text: string;
  channel?: "portal" | "slack";
  tx?: Prisma.TransactionClient | PrismaClient;
}

function isInQuietHours(pref: { quietFrom: string | null; quietTo: string | null }): boolean {
  if (!pref.quietFrom || !pref.quietTo) return false;
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  // Window may wrap midnight (e.g. 22:00 → 07:00).
  if (pref.quietFrom <= pref.quietTo) {
    return hhmm >= pref.quietFrom && hhmm < pref.quietTo;
  }
  return hhmm >= pref.quietFrom || hhmm < pref.quietTo;
}

/**
 * Insert a notification respecting per-user preferences. Returns the created
 * row id or null if suppressed by prefs.
 */
export async function notify(opts: NotifyOpts): Promise<string | null> {
  const db = (opts.tx ?? prisma) as any;

  // Per-user notification: consult prefs.
  if (opts.userId) {
    const pref = await db.notificationPreference.findUnique({
      where: { userId_eventType: { userId: opts.userId, eventType: opts.eventType } },
    });
    // Default = enabled, no quiet hours. So we only suppress when an explicit
    // row says disabled OR quiet hours are active.
    if (pref) {
      if (!pref.enabled) return null;
      if (isInQuietHours(pref)) return null;
    }
    const created = await db.notification.create({
      data: {
        userId: opts.userId,
        role: opts.role ?? "employee",
        text: opts.text,
        channel: opts.channel ?? "portal",
      },
      select: { id: true },
    });
    return created.id;
  }

  // Broadcast (role-only) notification: no per-user prefs apply.
  if (!opts.role) return null;
  const created = await db.notification.create({
    data: {
      role: opts.role,
      text: opts.text,
      channel: opts.channel ?? "portal",
    },
    select: { id: true },
  });
  return created.id;
}

/**
 * Fetch preferences for a user, filling in defaults for any event type that
 * has no row yet. Useful for the settings UI to render every toggle.
 */
export const ALL_EVENTS: NotificationEvent[] = [
  "REQUEST_SUBMITTED",
  "REQUEST_APPROVED",
  "REQUEST_REJECTED",
  "PROVISIONED",
  "ACCESS_ID_REQUESTED",
  "ACCESS_ID_ISSUED",
  "REQUEST_EXTENSION",
  "REQUEST_AUTO_EXPIRED",
];

export async function getPreferencesForUser(userId: string) {
  const db = prisma;
  const rows = await db.notificationPreference.findMany({ where: { userId } });
  const byEvent = new Map<
    string,
    { eventType: string; enabled: boolean; quietFrom: string | null; quietTo: string | null }
  >(
    rows.map((r: { eventType: string; enabled: boolean; quietFrom: string | null; quietTo: string | null }) => [
      r.eventType,
      r,
    ])
  );
  return ALL_EVENTS.map((eventType) => {
    const row = byEvent.get(eventType);
    return {
      eventType,
      enabled: row ? row.enabled : true,
      quietFrom: row?.quietFrom ?? null,
      quietTo: row?.quietTo ?? null,
    };
  });
}

export async function updatePreference(
  userId: string,
  eventType: NotificationEvent,
  patch: { enabled?: boolean; quietFrom?: string | null; quietTo?: string | null }
) {
  const db = prisma;
  return db.notificationPreference.upsert({
    where: { userId_eventType: { userId, eventType } },
    create: {
      userId,
      eventType,
      enabled: patch.enabled ?? true,
      quietFrom: patch.quietFrom ?? null,
      quietTo: patch.quietTo ?? null,
    },
    update: {
      ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
      ...(patch.quietFrom !== undefined ? { quietFrom: patch.quietFrom } : {}),
      ...(patch.quietTo !== undefined ? { quietTo: patch.quietTo } : {}),
    },
  });
}
