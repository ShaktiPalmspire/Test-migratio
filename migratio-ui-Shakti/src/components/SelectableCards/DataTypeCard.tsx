"use client";

import * as React from "react";
import clsx from "clsx";

type Props = {
  title: string;
  subtitle?: string;
  logo?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
};

export default function DataTypeCard({
  title,
  subtitle,
  isSelected,
  onSelect,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={clsx(
        "relative max-w-[240px] w-full rounded-2xl border p-5 transition-all duration-300 border-[var(--migratio_border)] bg-[var(--migratio_primary-50)] cursor-pointer hover:border-[var(--migratio_primary)] hover:shadow-[var(--migratio_box_shadow)]",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
        isSelected ? "border-lime-400 bg-[var(--migratio_primary)]" : "border-[var(--migratio_border)] bg-[var(--migratio_white)]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div>
        <div className="text-xl font-semibold">{title}</div>
        {subtitle && <div className="text-sm text-[var(--migratio_text)] mt-1">{subtitle}</div>}
      </div>
    </button>
  );
}