"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";
import { getPreferencesForUser, updatePreference, ALL_EVENTS } from "@/lib/notifications-engine";
import type { NotificationEvent } from "@/lib/notifications-engine";

/**
 * Load current user's notification preferences (all event types, with defaults
 * filled in).
 */
export async function loadPreferences() {
  const user = await getCurrentUser();
  if (!user) {
    return { preferences: [], eventTypes: ALL_EVENTS };
  }
  const preferences = await getPreferencesForUser(user.id);
  return { preferences, eventTypes: ALL_EVENTS };
}

/**
 * Update a single preference row for the current user.
 */
export async function setPreference(
  eventType: NotificationEvent,
  patch: { enabled?: boolean; quietFrom?: string | null; quietTo?: string | null }
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }
  // Quiet-hours validation
  if (patch.quietFrom !== undefined || patch.quietTo !== undefined) {
    const from = patch.quietFrom ?? null;
    const to = patch.quietTo ?? null;
    // Both null → quiet hours disabled. Only one set → invalid.
    if ((from === null) !== (to === null)) {
      return { success: false, error: "Quiet hours require both 'from' and 'to'." };
    }
    if (from && to && !/^\d{2}:\d{2}$/.test(from)) {
      return { success: false, error: "Quiet hours must be HH:MM." };
    }
    if (from && to && !/^\d{2}:\d{2}$/.test(to)) {
      return { success: false, error: "Quiet hours must be HH:MM." };
    }
  }
  await updatePreference(user.id, eventType, patch);
  try {
    revalidatePath("/");
  } catch {}
  return { success: true };
}