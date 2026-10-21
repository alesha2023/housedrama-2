import { createIsomorphicFn } from "@tanstack/react-start";

/** Sets the document status during SSR. Client navigations have no HTTP response. */
export const applyHttpStatus = createIsomorphicFn()
  .client((_code: number) => {
    // No document status to change after hydration.
  })
  .server(async (code: number) => {
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    try {
      setResponseStatus(code);
    } catch {
      // No request event outside a real HTTP render.
    }
  });
