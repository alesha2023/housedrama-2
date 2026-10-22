export function Logo({ className = "h-12 w-auto" }: { className?: string }) {
  return <img src="/logo.png?v=4" alt="HouseDrama" className={className} />;
}