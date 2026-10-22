/** Cloudflare builds alias `@electric-sql/pglite` here. Preview still uses the real package. */
export class PGlite {
  constructor() {
    throw new Error("PGLite is not available on Cloudflare Workers. Set DATABASE_URL to Neon.");
  }
}
