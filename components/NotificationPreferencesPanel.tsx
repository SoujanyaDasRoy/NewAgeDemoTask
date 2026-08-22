"use client";

import { useEffect, useState, useTransition } from "react";
import { loadPreferences, setPreference } from "@/lib/actions/notification-prefs";
import type { NotificationEvent } from "@/lib/notifications-engine";

interface PrefRow {
  eventType: NotificationEvent;
  enabled: boolean;
  quietFrom: string | null;
  quietTo: string | null;
}

const LABELS: Record<NotificationEvent, string> = {
  REQUEST_SUBMITTED: "Request submitted",
  REQUEST_APPROVED: "Request approved",
  REQUEST_REJECTED: "Request rejected",
  PROVISIONED: "Access provisioned",
  ACCESS_ID_REQUESTED: "Access ID requested",
  ACCESS_ID_ISSUED: "Access ID issued",
  REQUEST_EXTENSION: "Extension requested",
  REQUEST_AUTO_EXPIRED: "Request auto-expired",
};

export function NotificationPreferencesPanel({ onClose }: { onClose: () => void }) {
  const [prefs, setPrefs] = useState<PrefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences()
      .then((res) => {
        setPrefs(res.preferences);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  function patch(eventType: NotificationEvent, change: Partial<PrefRow>) {
    setPrefs((rows) => rows.map((r) => (r.eventType === eventType ? { ...r, ...change } : r)));
    startTransition(async () => {
      const res = await setPreference(eventType, {
        enabled: change.enabled,
        quietFrom: change.quietFrom,
        quietTo: change.quietTo,
      });
      if (!res.success && res.error) setError(res.error);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notification preferences</h2>
            <p className="text-xs text-slate-500">Per-event opt-outs and quiet hours.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading preferences…</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {prefs.map((p) => (
              <div key={p.eventType} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{LABELS[p.eventType] ?? p.eventType}</div>
                  <div className="font-mono text-[11px] uppercase tracking-wide text-slate-400">{p.eventType}</div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      disabled={isPending}
                      onChange={(e) => patch(p.eventType, { enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Enabled
                  </label>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>Quiet</span>
                    <input
                      type="time"
                      value={p.quietFrom ?? ""}
                      disabled={isPending || !p.enabled}
                      onChange={(e) =>
                        patch(p.eventType, {
                          quietFrom: e.target.value || null,
                          quietTo: p.quietTo,
                        })
                      }
                      className="rounded border border-slate-300 px-1 py-0.5 text-xs disabled:opacity-40"
                    />
                    <span>→</span>
                    <input
                      type="time"
                      value={p.quietTo ?? ""}
                      disabled={isPending || !p.enabled}
                      onChange={(e) =>
                        patch(p.eventType, {
                          quietFrom: p.quietFrom,
                          quietTo: e.target.value || null,
                        })
                      }
                      className="rounded border border-slate-300 px-1 py-0.5 text-xs disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
          Quiet hours pause notifications during a daily window (HH:MM). Leave both blank to disable.
        </div>
      </div>
    </div>
  );
}