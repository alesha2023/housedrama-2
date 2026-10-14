import { Link, useRouterState } from "@tanstack/react-router";
import { Clock3, Compass, House, Menu, Search, Sparkles, UserRound, Users, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CONTENT_LANGS, UI_LANGS, usePrefs } from "@/lib/drama/i18n";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", key: "home" },
  { to: "/discover", key: "discover" },
  { to: "/latest", key: "latest" },
  { to: "/trending", key: "trending" },
  { to: "/categories", key: "categories" },
] as const;

function VisitorCounter() {
  const [counts, setCounts] = useState<{ total: number; today: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const update = async () => {
      try {
        let visitorId = window.localStorage.getItem("housedrama_visitor_id");
        if (!visitorId) {
          visitorId = typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `hd-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
          window.localStorage.setItem("housedrama_visitor_id", visitorId);
        }
        const response = await fetch("/api/visitor-count", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });
        if (!response.ok) return;
        const data = (await response.json()) as { total: number; today: number };
        if (!cancelled && Number.isFinite(data.total) && Number.isFinite(data.today)) setCounts(data);
      } catch {
        // Keep the footer clean when storage or the counter service is unavailable.
      }
    };
    void update();
    return () => { cancelled = true; };
  }, []);

  if (!counts) return null;
  const stats = [
    { label: "Total pengunjung", value: counts.total, Icon: Users },
    { label: "Pengunjung hari ini", value: counts.today, Icon: UserRound },
  ];
  return (
    <section className="mx-auto grid w-full max-w-md grid-cols-2 gap-3 py-2" aria-label="Statistik pengunjung">
      {stats.map(({ label, value, Icon }) => (
        <div key={label} className="flex min-w-0 items-center gap-3 rounded-2xl border border-primary/15 bg-white/75 p-3 shadow-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <strong className="block text-lg font-bold leading-tight tabular-nums text-primary">
              {value.toLocaleString("id-ID")}
            </strong>
            <span className="mt-1 block text-[11px] leading-tight text-muted">{label}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { t, uiLang, setUiLang, contentLang, setContentLang } = usePrefs();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const watching = pathname.startsWith("/watch/");
  const shorts = pathname === "/shorts";
  const [open, setOpen] = useState(false);
  const labels: Record<string, string> = {
    home: t.home,
    discover: t.discover,
    latest: t.latest,
    trending: t.trending,
    categories: t.categories,
  };

  return (
    <div className={cn("min-h-dvh", watching ? "bg-player text-player-ink" : shorts ? "bg-black text-white" : "page-bg text-ink")}>
      <BootSplash />
      {watching || shorts ? null : (
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
            <Logo className="h-10 w-auto" />
          </Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-ink data-[status=active]:bg-surface data-[status=active]:text-ink"
                activeOptions={{ exact: link.to === "/" }}
              >
                {labels[link.key]}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Link to="/search" aria-label={t.search} className="grid size-11 place-items-center rounded-full hover:bg-surface">
              <Search className="size-5" />
            </Link>
            <Link to="/watchlist" aria-label={t.watchlist} className="hidden size-11 place-items-center rounded-full hover:bg-surface sm:grid">
              <Sparkles className="size-5" />
            </Link>
            <details className="relative hidden sm:block">
              <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full text-sm font-semibold hover:bg-surface">
                {uiLang.toUpperCase()}
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-card border border-line bg-bg p-3 shadow-lg">
                <label className="block text-xs font-semibold text-muted">
                  {t.uiLang}
                  <select
                    className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
                    value={uiLang}
                    onChange={(event) => setUiLang(event.target.value as typeof uiLang)}
                  >
                    {UI_LANGS.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-3 block text-xs font-semibold text-muted">
                  {t.contentLang}
                  <select
                    className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
                    value={contentLang}
                    onChange={(event) => setContentLang(event.target.value)}
                  >
                    {CONTENT_LANGS.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </details>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full hover:bg-surface lg:hidden"
              aria-label="Menu"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-line bg-bg px-4 py-3 lg:hidden">
            <div className="grid gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium hover:bg-surface"
                >
                  {labels[link.key]}
                </Link>
              ))}
              <Link to="/shorts" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 hover:bg-surface">
                {t.shorts}
              </Link>
              <Link to="/history" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 hover:bg-surface">
                {t.history}
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select className="h-11 rounded-xl border border-line bg-surface px-3" value={uiLang} onChange={(event) => setUiLang(event.target.value as typeof uiLang)}>
                {UI_LANGS.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <select className="h-11 rounded-xl border border-line bg-surface px-3" value={contentLang} onChange={(event) => setContentLang(event.target.value)}>
                {CONTENT_LANGS.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </header>
      )}
      <main className={cn(watching || shorts ? "h-dvh overflow-hidden" : "mx-auto max-w-6xl px-4 pt-5 pb-28 lg:pb-16")}>{children}</main>
      {watching || shorts ? null : (
      <footer className="border-t border-line pb-28 lg:pb-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 text-center">
          <div className="flex items-center gap-2.5" aria-label="Social">
            {SOCIALS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  className="grid size-10 place-items-center rounded-full border border-line bg-bg text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted" aria-label="Footer">
            <Link to="/discover" className="hover:text-ink">{t.discover}</Link>
            <Link to="/latest" className="hover:text-ink">{t.latest}</Link>
            <Link to="/trending" className="hover:text-ink">{t.trending}</Link>
            <Link to="/categories" className="hover:text-ink">{t.categories}</Link>
            <Link to="/shorts" className="hover:text-ink">{t.shorts}</Link>
            <Link to="/about" className="hover:text-ink">{t.about}</Link>
            <Link to="/privacy" className="hover:text-ink">{t.privacy}</Link>
            <Link to="/terms" className="hover:text-ink">{t.terms}</Link>
          </nav>
          <section className="w-full max-w-3xl border-t border-line/70 pt-4" aria-labelledby="footer-topics-title">
            <h2 id="footer-topics-title" className="mb-3 text-sm font-semibold text-ink">Jelajahi berdasarkan topik</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "Drama China subtitle Indonesia", rail: "romance" },
                { label: "Drama romantis", rail: "romance" },
                { label: "Drama CEO", rail: "ceo" },
                { label: "Drama balas dendam", rail: "revenge" },
                { label: "Drama fantasi", rail: "fantasy" },
                { label: "Drama sejarah", rail: "historical" },
                { label: "Drama tamat", rail: "completed" },
                { label: "Drama terbaru", rail: "latest" },
              ].map((topic) => (
                <Link
                  key={topic.label}
                  to={topic.rail === "latest" ? "/latest" : "/discover"}
                  search={topic.rail === "latest" ? undefined : { rail: topic.rail }}
                  className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          </section>
          <VisitorCounter />
          <p className="max-w-md text-xs leading-relaxed text-muted">{t.footerNote}</p>
          <p className="text-[11px] text-muted">HouseDrama · Katalog drama pendek dari berbagai penyedia</p>
        </div>
      </footer>
      )}
      {watching ? null : (
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 lg:hidden",
          shorts ? "bg-black/55 text-white backdrop-blur-md [&_a]:text-white/75 [&_a[data-status=active]]:text-white" : "border-t border-line/80 bg-white/90 backdrop-blur-xl",
        )}
        aria-label="Mobile"
      >
        <div className="grid grid-cols-5 px-1 py-1">
          <Tab to="/" label={t.home} icon={<House className="size-5" />} exact />
          <Tab to="/discover" label={t.discover} icon={<Compass className="size-5" />} />
          <Tab to="/shorts" label={t.shorts} icon={<Sparkles className="size-5" />} />
          <Tab to="/search" label={t.search} icon={<Search className="size-5" />} />
          <Tab to="/watchlist" label={t.watchlist} icon={<Clock3 className="size-5" />} />
        </div>
      </nav>
      )}
    </div>
  );
}

function BootSplash() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const started = (window as Window & { __boot?: number }).__boot ?? Date.now();
    const left = Math.max(0, 1000 - (Date.now() - started));
    const remove = window.setTimeout(() => setGone(true), left);
    return () => window.clearTimeout(remove);
  }, []);

  if (gone) return null;

  return (
    <div className="boot-splash" role="status" aria-label="Loading HouseDrama">
      <div className="boot-splash__glow" />
      <Logo className="boot-splash__logo h-16 w-auto" />
      <div className="boot-splash__track" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

function Tab({
  to,
  label,
  icon,
  exact = false,
}: {
  to: "/" | "/discover" | "/shorts" | "/search" | "/watchlist";
  label: string;
  icon: ReactNode;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted data-[status=active]:text-primary"
    >
      {icon}
      {label}
    </Link>
  );
}

const SOCIALS: { name: string; href: string; icon: () => ReactNode }[] = [
  { name: "Facebook", href: "https://www.facebook.com/", icon: FacebookIcon },
  { name: "Instagram", href: "https://www.instagram.com/", icon: InstagramIcon },
  { name: "TikTok", href: "https://www.tiktok.com/", icon: TikTokIcon },
  { name: "YouTube", href: "https://www.youtube.com/", icon: YouTubeIcon },
];

function SocialGlyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      {children}
    </svg>
  );
}

function FacebookIcon() {
  return (
    <SocialGlyph>
      <path
        fill="currentColor"
        d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </SocialGlyph>
  );
}

function InstagramIcon() {
  return (
    <SocialGlyph>
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </SocialGlyph>
  );
}

function TikTokIcon() {
  return (
    <SocialGlyph>
      <path
        fill="currentColor"
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      />
    </SocialGlyph>
  );
}

function YouTubeIcon() {
  return (
    <SocialGlyph>
      <path
        fill="currentColor"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </SocialGlyph>
  );
}
