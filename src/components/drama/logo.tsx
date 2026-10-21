export function Logo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src="/favicon.svg?v=pink2" alt="" width={32} height={32} className="size-8 shrink-0 rounded-[9px]" />
      <span className="font-display text-lg leading-none tracking-tight text-[#ff5cab] sm:text-[1.35rem]">
        HouseDrama
      </span>
    </span>
  );
}
