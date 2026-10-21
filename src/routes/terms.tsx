import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/drama/cards";
import { pageSeo } from "@/lib/drama/site";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/terms")({
  head: () => pageSeo({
    title: "Terms — HouseDrama",
    description: "Terms for using the HouseDrama short-drama catalog. Streams play only when a provider returns a real URL.",
    path: "/terms",
    robots: "index,follow",
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
