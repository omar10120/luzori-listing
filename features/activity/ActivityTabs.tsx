"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ActivityTabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export default function ActivityTabs<T extends string>({ tabs, activeTab, onChange }: ActivityTabsProps<T>) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {tabs.map((tabItem) => (
        <button
          key={tabItem.id}
          type="button"
          onClick={() => onChange(tabItem.id)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
            activeTab === tabItem.id
              ? "bg-gray-900 text-white"
              : "border border-gray-200 bg-white text-gray-700 hover:border-[#225D5C]/40"
          )}
        >
          {tabItem.label}
        </button>
      ))}
    </div>
  );
}
