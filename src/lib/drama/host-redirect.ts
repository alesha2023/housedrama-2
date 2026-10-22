import { createServerFn } from "@tanstack/react-start";
import { productionHostRedirect } from "./site";

/** SSR-only. Returns a 301 target, or null. Does not build canonical URLs. */
export const getProductionRedirect = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  if (!request?.url) return null;
  return productionHostRedirect(request.url);
});
