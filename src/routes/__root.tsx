import { createRootRoute, HeadContent, Outlet, Scripts, redirect, useRouterState } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PrefsProvider } from "@/lib/drama/i18n";
import { Shell } from "@/components/drama/shell";
import { absoluteSiteUrl, jsonLdScript } from "@/lib/drama/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (typeof window !== "undefined") return;
    const { getProductionRedirect } = await import("@/lib/drama/host-redirect");
    const target = await getProductionRedirect();
    if (target) throw redirect({ href: target, statusCode: 301 });
  },
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
      { name: "theme-color", content: "#07080b" },
      { name: "admaven-placement", content: "BpdU4qdU6" },
    ],
    links: [
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/favicon.png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap" },
      { rel: "preload", as: "style", href: appCss },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const routeLang = pathname === "/id" || pathname.startsWith("/id/") ? "id" : "en";

  // New pages should open at the top instead of restoring the previous page's footer position.
  useLayoutEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <html lang={routeLang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "HouseDrama",
              alternateName: "House Drama",
              url: absoluteSiteUrl("/"),
              inLanguage: "en",
              description: "A catalog of Chinese short dramas from multiple providers on HouseDrama.",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "HouseDrama",
              url: absoluteSiteUrl("/"),
              logo: absoluteSiteUrl("/icon-512.png"),
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__boot=Date.now();try{if(window.localStorage.getItem('housedrama_dark_default_v1')!=='1'){window.localStorage.setItem('housedrama_dark_default_v1','1');window.localStorage.setItem('housedrama_theme','dark');}var t=window.localStorage.getItem('housedrama_theme')==='light'?'light':'dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}",
          }}
        />
        <PreviewHostBridge />
        <AuthProvider>
          <PrefsProvider initialLang={routeLang}>
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
