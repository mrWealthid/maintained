"use client";

type AuthRedirectWindow = Window & {
  __authRedirecting?: boolean;
};

function isProtectedClientPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/technician/dashboard") ||
    pathname.startsWith("/onboarding")
  );
}

export function redirectToSessionExpiredIfNeeded(status?: number) {
  if (typeof window === "undefined") {
    return false;
  }

  if (status !== 401) {
    return false;
  }

  const authWindow = window as AuthRedirectWindow;
  const pathname = authWindow.location.pathname;

  if (!isProtectedClientPath(pathname)) {
    return false;
  }

  if (pathname.startsWith("/auth/session-expired")) {
    return false;
  }

  if (authWindow.__authRedirecting) {
    return true;
  }

  authWindow.__authRedirecting = true;

  const next = `${pathname}${authWindow.location.search}`;
  authWindow.location.assign(
    `/auth/session-expired?next=${encodeURIComponent(next)}`,
  );

  return true;
}
