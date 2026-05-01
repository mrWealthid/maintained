"use client";

const SESSION_ACTIVITY_EVENT = "maintain:auth-session-activity";

type SessionActivityWindow = Window & {
  __lastClientSessionActivityAt?: number;
};

function getSessionActivityWindow() {
  return window as SessionActivityWindow;
}

export function getLastClientSessionActivityAt() {
  if (typeof window === "undefined") {
    return Date.now();
  }

  return getSessionActivityWindow().__lastClientSessionActivityAt ?? Date.now();
}

export function markClientSessionActivity(at = Date.now()) {
  if (typeof window === "undefined") {
    return;
  }

  const activityWindow = getSessionActivityWindow();
  activityWindow.__lastClientSessionActivityAt = at;
  activityWindow.dispatchEvent(
    new CustomEvent(SESSION_ACTIVITY_EVENT, {
      detail: { at },
    }),
  );
}

export function subscribeToClientSessionActivity(
  callback: (at: number) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler: EventListener = (event) => {
    if (event instanceof CustomEvent && typeof event.detail?.at === "number") {
      callback(event.detail.at);
      return;
    }

    callback(Date.now());
  };

  window.addEventListener(SESSION_ACTIVITY_EVENT, handler);
  return () => window.removeEventListener(SESSION_ACTIVITY_EVENT, handler);
}
