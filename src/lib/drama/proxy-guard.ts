/** Reject hosts that must never be fetched by the media or poster proxy. */
export function isBlockedProxyHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.+$/, "").replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "metadata.google.internal" || host === "169.254.169.254") return true;
  // Raw IP literals, including shorthand (127.1) and decimal forms, are not CDN hosts.
  if (/^[\d.]+$/.test(host)) return true;
  if (host.includes(":")) return true;
  return false;
}
