import { Frown, Leaf, Skull, Smile, Sparkles, type LucideIcon } from "lucide-react";
import type { HealthState } from "@/lib/types";

const STYLES: Record<HealthState, { label: string; icon: LucideIcon; className: string }> = {
  dancing: { label: "Dancing", icon: Sparkles, className: "bg-lotus text-ink" },
  happy: { label: "Happy", icon: Smile, className: "bg-leaf text-white" },
  sad: { label: "Sad", icon: Frown, className: "bg-pond text-ink" },
  browning: { label: "Browning", icon: Leaf, className: "bg-sand text-ink" },
  dead: { label: "Dead", icon: Skull, className: "bg-[#6f6354] text-white" },
};

export function HealthBadge({ state }: { state: HealthState }) {
  const { label, icon: Icon, className } = STYLES[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-inkline px-2.5 py-0.5 text-xs font-bold ${className}`}
      data-health={state}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}
