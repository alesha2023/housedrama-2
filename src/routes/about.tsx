import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/drama/cards";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About HouseDrama" },
      {
        name: "description",
        content: "HouseDrama aggregates publicly available Chinese short-drama catalogs. It does not own the shows.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.xyz/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = usePrefs();
  return (
    <div className="max-w-2xl">
      <PageIntro title={t.about} description={t.aboutLead} />
      <div className="mt-6 space-y-4 text-sm leading-6 text-ink">
        <p>{t.about1}</p>
        <p>{t.about2}</p>
        <p>{t.about3}</p>
        <p>{t.about4}</p>
      </div>
    </div>
  );
}
