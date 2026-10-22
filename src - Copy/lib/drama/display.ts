type Titled = { title: string; originalTitle?: string; displayTitle?: string };
type Described = {
  description?: string | null;
  originalDescription?: string | null;
  displayDescription?: string | null;
};

export function pickTitle(item: Titled, _lang: string) {
  return item.originalTitle || item.title;
}

export function pickDescription(item: Described, lang: string) {
  if (lang === "en") return item.originalDescription ?? item.description ?? null;
  return item.displayDescription ?? item.description ?? null;
}

export function useDisplayTitles(_titles: string[], _lang: string) {
  return (title: string, originalTitle?: string) => originalTitle || title;
}
