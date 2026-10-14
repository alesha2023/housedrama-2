import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { providerLabel, visibleProviders } from "@/lib/drama/providers";
import { usePrefs } from "@/lib/drama/i18n";
import { type ProviderId } from "@/lib/drama/types";
import { cn } from "@/lib/utils";

export function ProviderPicker({
  value,
  onChange,
  className,
  label,
}: {
  value: "all" | ProviderId;
  onChange: (value: "all" | ProviderId) => void;
  className?: string;
  label?: string;
}) {
  const { t } = usePrefs();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = value === "all" ? t.allProviders : providerLabel(value);
  const filteredProviders = visibleProviders().filter((id) =>
    providerLabel(id).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        onClick={() => {
          setOpen((currentOpen) => {
            if (currentOpen) setQuery("");
            return !currentOpen;
          });
        }}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-full border border-line bg-surface px-4 text-left font-semibold"
      >
        <span className="truncate">{current}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label={t.close}
            className="fixed inset-0 z-40"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
          />
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-bg shadow-xl">
            <div className="border-b border-line p-2">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3">
                <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setOpen(false);
                      setQuery("");
                    }
                  }}
                  placeholder="Cari nama penyedia..."
                  aria-label="Cari nama penyedia"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </div>
            </div>
            <div role="listbox" className="max-h-64 overflow-y-auto p-1">
              <PickerOption
                active={value === "all"}
                onClick={() => {
                  onChange("all");
                  setOpen(false);
                  setQuery("");
                }}
              >
                {t.allProviders}
              </PickerOption>
              {filteredProviders.map((id) => (
                <PickerOption
                  key={id}
                  active={value === id}
                  onClick={() => {
                    onChange(id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {providerLabel(id)}
                </PickerOption>
              ))}
              {!filteredProviders.length && query.trim() ? (
                <p className="px-3 py-4 text-center text-sm text-muted">Tidak ada penyedia yang cocok.</p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function PickerOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={cn("block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold", active ? "bg-ink text-player-ink" : "hover:bg-surface")}
    >
      {children}
    </button>
  );
}
