"use client";

import type { CommodityType } from "@/lib/types";

const FILTERS: { key: string; label: string; color: string }[] = [
  { key: "all", label: "ALL", color: "bg-accent-blue" },
  { key: "iron", label: "IRON", color: "bg-accent-amber" },
  { key: "copper", label: "COPPER", color: "bg-accent-red" },
  { key: "aluminium", label: "ALUM", color: "bg-accent-cyan" },
  { key: "gold", label: "GOLD", color: "bg-yellow-500" },
  { key: "silver", label: "SILVER", color: "bg-gray-400" },
];

interface CommodityFilterProps {
  active: string;
  onChange: (commodity: string) => void;
  counts?: Record<string, number>;
}

export default function CommodityFilter({
  active,
  onChange,
  counts,
}: CommodityFilterProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto">
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`
              px-3 py-1 text-xs font-mono uppercase tracking-wider shrink-0
              border transition-all duration-150
              ${
                isActive
                  ? `${f.color} border-transparent text-bg-primary font-bold`
                  : "bg-transparent border-border text-text-secondary hover:border-border-bright hover:text-text-primary"
              }
            `}
          >
            {f.label}
            {counts && counts[f.key] !== undefined && (
              <span className="ml-1 opacity-60">{counts[f.key]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
