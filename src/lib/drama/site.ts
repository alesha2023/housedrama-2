/** Production origin. Never derive this from the request Host header. */
export const SITE_ORIGIN = "https://house-drama.xyz";
/** Previous production host. Redirect this host with a 301 that keeps path and query. */
export const LEGACY_ORIGIN = "https://house-drama.web.id";
export const SITE_NAME = "HouseDrama";
const OG_IMAGE_PATH = "/og.jpg";
const PRODUCTION_HOST = "house-drama.xyz";

export function absoluteSiteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

/**
 * 301 target for hosts we control. Returns null for the apex and for every
 * other host, so a preview domain or a mis-read Host header cannot redirect.
 * Path, query, and hash are copied. The scheme is always https.
 */
export function productionHostRedirect(requestUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(requestUrl);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  const movable = host === "www.house-drama.xyz" || host === "house-drama.web.id" || host === "www.house-drama.web.id";
  if (!movable) return null;
  url.protocol = "https:";
  url.hostname = PRODUCTION_HOST;
  url.port = "";
  const next = url.toString();
  return next === requestUrl ? null : next;
}

/** JSON-LD safe to embed in HTML. Does not add fields that were not passed in. */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type SeoLink = { rel: string; href: string; hrefLang?: string };

/** Canonical, Open Graph, and Twitter tags for one indexable path. Origin is fixed. */
export function pageSeo({
  title,
  description,
  path,
  locale = "en_US",
  robots = "index,follow,max-image-preview:large",
  extraLinks = [],
}: {
  title: string;
  description: string;
  path: string;
  locale?: string;
  robots?: string;
  extraLinks?: SeoLink[];
}) {
  const url = absoluteSiteUrl(path);
  const image = absoluteSiteUrl(OG_IMAGE_PATH);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: locale },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }, ...extraLinks],
  };
}
