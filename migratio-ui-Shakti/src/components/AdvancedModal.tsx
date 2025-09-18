"use client";

import React from "react";

export function AdvancedModal({
  open,
  title,
  onClose,
  children,
  size = "lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" } as const;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} mx-4 max-h-[90vh] overflow-hidden rounded-xl bg-gray-800 shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          <button className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-200" onClick={onClose}>✕</button>
        </div>
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 80px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdvancedModal;


