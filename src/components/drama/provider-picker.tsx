import { ChevronDown } from "lucide-react";
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
  const current = value === "all" ? t.allProviders : providerLabel(value);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-full border border-line bg-surface px-4 text-left font-semibold"
      >
        <span className="truncate">{current}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <>
          <button type="button" aria-label={t.close} className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="listbox" className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-card border border-line bg-bg p-1 shadow-lg">
            <PickerOption
              active={value === "all"}
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
            >
              {t.allProviders}
            </PickerOption>
            {visibleProviders().map((id) => (
              <PickerOption
                key={id}
                active={value === id}
                onClick={() => {
                  onChange(id);
                  setOpen(false);
                }}
              >
                {providerLabel(id)}
              </PickerOption>
            ))}
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
