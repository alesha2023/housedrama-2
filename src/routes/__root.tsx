import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { createServerFn } from "@tanstack/react-start";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PrefsProvider } from "@/lib/drama/i18n";
import { Shell } from "@/components/drama/shell";
import appCss from "../styles.css?url";

const getInitialCatalogLang = createServerFn({ method: "GET" }).handler(async () => {
  const { resolveCatalogLang } = await import("@/lib/drama/server/locale");
  return resolveCatalogLang();
});

export const Route = createRootRoute({
  loader: async () => ({ lang: await getInitialCatalogLang() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HouseDrama — Watch Chinese & Asian Short Dramas Online" },
      {
        name: "description",
        content:
          "Watch Chinese and Asian short dramas online on HouseDrama. Discover trending romance, CEO, revenge, fantasy, and drama series from multiple providers.",
      },
      { property: "og:site_name", content: "HouseDrama" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "HouseDrama — Watch Chinese & Asian Short Dramas Online" },
      { property: "og:description", content: "Discover Chinese and Asian short dramas, trending romance, CEO stories, and new episodes on HouseDrama." },
      { property: "og:image", content: "https://house-drama.web.id/og-v2.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "HouseDrama — Watch Chinese and Asian Short Dramas Online" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "HouseDrama — Chinese & Asian Short Dramas" },
      { name: "twitter:description", content: "Watch Chinese short dramas online and discover romance, revenge, CEO stories, fantasy, and new episodes on HouseDrama." },
      { name: "twitter:image", content: "https://house-drama.web.id/og-v2.jpg" },
      { name: "theme-color", content: "#b34bff" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/favicon.png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  const { lang } = Route.useLoaderData();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // New pages should open at the top instead of restoring the previous page's footer position.
  useLayoutEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "HouseDrama",
              alternateName: "House Drama",
              url: "https://house-drama.web.id/",
              inLanguage: "en",
              description: "A catalog of Chinese short dramas from multiple providers on HouseDrama.",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "HouseDrama",
              url: "https://house-drama.web.id/",
              logo: "https://house-drama.web.id/logo.png",
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__boot=Date.now();setTimeout(function(){var n=document.querySelector('.boot-splash');if(n)n.classList.add('is-done');},1000);",
          }}
        />
        <PreviewHostBridge />
        <AuthProvider>
          <PrefsProvider initialLang={lang}>
            <Shell>
              <Outlet />
            </Shell>
          </PrefsProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
