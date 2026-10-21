import { createRouter } from "@tanstack/react-router";
import { MissingPage } from "@/components/drama/not-found";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: () => (
      <MissingPage title="Page not found" body="This URL is not on HouseDrama. Nothing was invented to fill it." />
    ),
    scrollRestoration: false,
  });
}
