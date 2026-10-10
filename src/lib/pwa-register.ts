// Single guarded entry point for service worker registration.
// Never registers in dev, Lovable previews, iframes, or with ?sw=off —
// and unregisters stale /sw.js registrations in those contexts.

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true; // inside an iframe
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com"))
    return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterStaleAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((reg) => {
          const url =
            reg.active?.scriptURL ??
            reg.waiting?.scriptURL ??
            reg.installing?.scriptURL ??
            "";
          return url.endsWith("/sw.js");
        })
        .map((reg) => reg.unregister()),
    );
  } catch {
    // best-effort cleanup only
  }
}

export async function registerAppServiceWorker() {
  if (isRefusedContext()) {
    await unregisterStaleAppWorkers();
    return;
  }
  if (!("serviceWorker" in navigator)) return;
  try {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  } catch {
    // offline support is a progressive enhancement — never break the app
  }
}
