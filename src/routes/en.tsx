import { createFileRoute, redirect } from "@tanstack/react-router";

/** English already lives on `/`. This alias must not be a second indexable URL. */
export const Route = createFileRoute("/en")({
  beforeLoad: () => {
    throw redirect({ href: "/", statusCode: 301 });
  },
  head: () => ({
    meta: [
      { title: "HouseDrama" },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: () => null,
});
