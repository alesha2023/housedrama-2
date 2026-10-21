/**
 * Deploy this Worker on the OLD zone (house-drama.web.id) only.
 * It is not part of the house-drama.xyz Worker. Do not attach both domains
 * to this script or the new site will redirect to itself.
 *
 * Returns a 301 Location, or null when the request is already on the new host
 * so a mis-attached route cannot loop.
 */
export function legacyRedirectLocation(requestUrl) {
  const url = new URL(requestUrl);
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host !== "house-drama.web.id" && host !== "www.house-drama.web.id") return null;
  url.protocol = "https:";
  url.hostname = "house-drama.xyz";
  url.port = "";
  return url.toString();
}

export default {
  async fetch(request) {
    const target = legacyRedirectLocation(request.url);
    if (!target) return new Response("Legacy redirect does not apply to this host", { status: 404 });
    return Response.redirect(target, 301);
  },
};
