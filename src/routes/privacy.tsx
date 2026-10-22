import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/drama/cards";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — HouseDrama" },
      { name: "description", content: "HouseDrama stores watch history locally in your browser and does not require an account." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.xyz/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = usePrefs();
  return (
    <div className="max-w-2xl">
      <PageIntro title={t.privacy} />
      <div className="mt-6 space-y-4 text-sm leading-6">
        <p>{t.privacy1}</p>
        <p>{t.privacy2}</p>
        <p>{t.privacy3}</p>
        <p>{t.privacy4}</p>
      </div>
    </div>
  );
}
