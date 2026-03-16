"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FILTERS = [
  { label: "전체", value: "all" },
  { label: "Mistakr", value: "mistakr" },
  { label: "100:0LAB", value: "100:0lab" },
];

const FORMATS = [
  { label: "전체 포맷", value: "all" },
  { label: "캐러셀", value: "carousel" },
  { label: "단일", value: "single" },
  { label: "릴스", value: "reels_script" },
];

export function ApprovalFilters() {
  const [account, setAccount] = useState("all");
  const [format, setFormat] = useState("all");

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setAccount(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              account === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="w-px h-5 bg-border" />
      <div className="flex gap-1.5">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFormat(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm transition-colors",
              format === f.value
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
