import { Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/drama/cards";

/** Honest 404. Does not substitute another drama or a fake synopsis. */
export function MissingPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <EmptyState title={title} body={body} />
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Link to="/" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 font-semibold text-primary-ink">
          Home
        </Link>
        <Link to="/discover" className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 font-semibold">
          Discover dramas
        </Link>
      </div>
    </div>
  );
}
