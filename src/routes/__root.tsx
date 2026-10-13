import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { PrefsProvider } from "@/lib/drama/i18n";
import { Shell } from "@/components/drama/shell";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: async () => {
    const { resolveCatalogLang } = await import("@/lib/drama/server/locale");
    return { lang: await resolveCatalogLang() };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HouseDrama — Chinese short dramas" },
      {
        name: "description",
        content:
          "HouseDrama is a free catalog for Chinese short dramas from AnyReel, DramaBox, and FreeReels. Browse, search, and play publicly available episodes.",
      },
      { name: "theme-color", content: "#b34bff" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg?v=4" },
      { rel: "icon", type: "image/png", sizes: "64x64", href: "/favicon.png?v=4" },
      { rel: "shortcut icon", href: "/favicon.ico?v=4" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png?v=4" },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  const { lang } = Route.useLoaderData();
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
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
