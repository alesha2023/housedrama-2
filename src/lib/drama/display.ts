import { useEffect, useState } from "react";
import { lookupDisplays } from "./api";

type Titled = { title: string; originalTitle?: string; displayTitle?: string };
type Described = {
  description?: string | null;
  originalDescription?: string | null;
  displayDescription?: string | null;
};

export function pickTitle(item: Titled, lang: string) {
  if (lang === "en") return item.originalTitle || item.title;
  return item.displayTitle || item.title;
}

export function pickDescription(item: Described, lang: string) {
  if (lang === "en") return item.originalDescription ?? item.description ?? null;
  return item.displayDescription ?? item.description ?? null;
}

export function useDisplayTitles(titles: string[], lang: string) {
  const [map, setMap] = useState<Record<string, string>>({});
  const key = titles.join("\n");
  useEffect(() => {
    const unique = [...new Set(titles.map((title) => title.trim()).filter(Boolean))].slice(0, 40);
    if (!unique.length) return;
    let cancel = false;
    lookupDisplays({ data: { lang, titles: unique } })
      .then((next) => {
        if (!cancel) setMap(next);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [key, lang]);

  return (title: string, originalTitle?: string) => {
    if (lang === "en") return originalTitle || map[title] || title;
    const source = originalTitle || title;
    return map[source] || map[title] || title;
  };
}
