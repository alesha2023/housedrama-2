import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/drama/cards";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — HouseDrama" },
      { name: "description", content: "Terms for using HouseDrama’s short-drama catalog." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.xyz/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = usePrefs();
  return (
    <div className="max-w-2xl">
      <PageIntro title={t.termsTitle} />
      <div className="mt-6 space-y-4 text-sm leading-6">
        <p>{t.terms1}</p>
        <p>{t.terms2}</p>
        <p>{t.terms3}</p>
        <p>{t.terms4}</p>
      </div>
    </div>
  );
}
