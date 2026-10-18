import { Link } from "@tanstack/react-router";
import { Clapperboard, LoaderCircle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { DramaCard, ProviderId } from "@/lib/drama/types";
import { usePrefs } from "@/lib/drama/i18n";
import { pickTitle } from "@/lib/drama/display";
import { providerLabel } from "@/lib/drama/providers";
import { cn } from "@/lib/utils";

export { providerLabel };

function directPosterSource(value: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.hostname === "wsrv.nl" || parsed.hostname === "images.weserv.nl") {
      const original = parsed.searchParams.get("url");
      if (original && /^https?:\/\//i.test(original)) return original;
    }
  } catch {
    return value;
  }
  return value;
}

export function ProviderBadge({ provider, className }: { provider: ProviderId; className?: string }) {
  return (
    <span className={cn("rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur", className)}>
      {providerLabel(provider)}
    </span>
  );
}

export function Poster({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [activeSrc, setActiveSrc] = useState(directPosterSource(src));
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setActiveSrc(directPosterSource(src));
    setFailed(!src);
  }, [src]);

  function handleImageError() {
    // Retry through the image optimizer only when the original provider URL fails.
    // This keeps the original URL as the first choice for Googlebot and social crawlers.
    if (activeSrc && !activeSrc.includes("wsrv.nl") && !activeSrc.includes("images.weserv.nl")) {
      setActiveSrc(`https://images.weserv.nl/?url=${encodeURIComponent(activeSrc)}`);
      return;
    }
    setFailed(true);
  }

  if (!activeSrc || failed) {
    return (
      <div className={cn("grid place-items-center bg-surface text-muted", className)} role="img" aria-label={alt}>
        <Clapperboard className="size-8" aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleImageError}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

export function DramaCardView({ item, className }: { item: DramaCard; className?: string }) {
  const { t, contentLang, uiLang } = usePrefs();
  const title = pickTitle(item, contentLang);
  const badgeText = item.badge === "Trending di HouseDrama" || item.badge === "Trending on HouseDrama"
    ? ({ en: "Trending on HouseDrama", id: "Trending di HouseDrama", hi: "HouseDrama पर ट्रेंडिंग", fil: "Trending sa HouseDrama", ms: "Trending di HouseDrama", th: "กำลังมาแรงบน HouseDrama" } as const)[uiLang]
    : item.badge;
  return (
    <Link
      to="/drama/$provider/$seriesId"
      params={{ provider: item.provider, seriesId: item.seriesId }}
      className={cn("drama-card group block shrink-0 snap-start", className)}
    >
      <div className="drama-card__poster rise relative overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5">
        <div className="drama-card__image aspect-poster">
          <Poster src={item.posterUrl} alt={title} />
        </div>
        <div className="absolute left-2 top-2 flex max-w-[90%] flex-wrap gap-1">
          <ProviderBadge provider={item.provider} />
          {badgeText ? (
            <span className="rounded-full bg-bg/90 px-2 py-0.5 text-xs font-semibold text-ink">{badgeText}</span>
          ) : null}
        </div>
      </div>
      <h3 className="drama-card__title mt-2 line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-primary">
        {title}
      </h3>
      <p className="drama-card__meta mt-1 text-xs text-muted">
        {[item.episodeCount ? `${item.episodeCount} ${t.eps}` : null, item.completed ? t.completed : null]
          .filter(Boolean)
          .join(" · ") || t.shortDrama}
      </p>
      {item.tags.length ? <TagPills tags={item.tags} /> : null}
    </Link>
  );
}

export function TagPills({ tags }: { tags: string[] }) {
  const clean = [...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 1))].slice(0, 2);
  if (!clean.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {clean.map((tag) => (
        <span
          key={tag}
          className="max-w-full rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold leading-snug break-words text-primary"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function popularity(item: DramaCard) {
  const raw = (item.playCount ?? "").replace(/,/g, "").trim().toLowerCase();
  const match = raw.match(/([\d.]+)\s*(k|m|b|jt|rb)?/);
  if (!match) return 0;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return 0;
  const unit = match[2] ?? "";
  const scale = unit === "b" ? 1_000_000_000 : unit === "m" || unit === "jt" ? 1_000_000 : unit === "k" || unit === "rb" ? 1_000 : 1;
  return value * scale;
}

export function byPopularity(items: DramaCard[]) {
  return [...items].sort((a, b) => popularity(b) - popularity(a));
}

export function DramaGrid({ items }: { items: DramaCard[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <DramaCardView key={`${item.provider}-${item.seriesId}`} item={item} className="w-auto" />
      ))}
    </div>
  );
}

export function Rail({
  title,
  action,
  items,
  more,
}: {
  title: string;
  action?: string;
  items: DramaCard[];
  more?: ReactNode;
}) {
  const ordered = byPopularity(items);
  if (!ordered.length) return null;
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {more ?? (action ? <span className="text-sm font-semibold text-primary">{action}</span> : null)}
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {ordered.map((item) => (
          <DramaCardView key={`${item.provider}-${item.seriesId}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="max-w-2xl">
      {eyebrow ? <p className="text-sm font-semibold text-primary">{eyebrow}</p> : null}
      <h1 className="mt-1 text-4xl text-ink sm:text-5xl">{title}</h1>
      {description ? <p className="mt-3 text-base text-muted">{description}</p> : null}
    </header>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mt-8 rounded-card border border-line bg-surface px-6 py-12 text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-bg text-primary">
        <Clapperboard className="size-7" aria-hidden="true" />
      </div>
      <h2 className="text-2xl text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-card border border-coral/30 bg-coral/8 px-4 py-3 text-sm text-ink">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="mt-2 font-semibold text-primary">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonRail() {
  return <PageSkeleton />;
}

/** Shared route-pending UI: show an explicit loading state instead of blank-looking skeleton cards. */
export function PageSkeleton() {
  const { uiLang } = usePrefs();
  const label = uiLang === "id" ? "Memuat konten HouseDrama…" : uiLang === "ms" ? "Memuatkan kandungan HouseDrama…" : uiLang === "th" ? "กำลังโหลดเนื้อหา HouseDrama…" : "Loading HouseDrama content…";
  return (
    <main className="grid min-h-[48vh] place-items-center px-4 py-12" role="status" aria-live="polite" aria-busy="true">
      <div className="flex max-w-sm flex-col items-center rounded-3xl border border-line bg-surface/80 px-7 py-9 text-center shadow-sm">
        <LoaderCircle className="size-10 animate-spin text-primary" aria-hidden="true" />
        <p className="mt-4 text-base font-semibold text-ink">{label}</p>
        <p className="mt-2 text-sm text-muted">{uiLang === "id" ? "Sedang mengambil data dan poster drama. Mohon tunggu sebentar." : uiLang === "ms" ? "Sedang mendapatkan data dan poster drama. Sila tunggu sebentar." : uiLang === "th" ? "กำลังดึงข้อมูลและโปสเตอร์ละคร โปรดรอสักครู่" : "Fetching drama details and posters. Please wait a moment."}</p>
      </div>
    </main>
  );
}
