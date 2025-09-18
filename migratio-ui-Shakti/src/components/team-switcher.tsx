"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    plan: string;
  }[];
}) {
  const [activeTeam] = React.useState(teams[0]);
  const router = useRouter();

  const handleClick = () => {
    console.log('🚀 Navigating to dashboard/1');
    router.push('/dashboard/1');
  };

  return (
    <div 
      onClick={handleClick}
      className="block w-full cursor-pointer migratio-link"
    >
      <SidebarMenu>
        <SidebarMenuItem 
          className="flex gap-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md"
        >
          <div className="flex aspect-square items-center justify-center">
            <svg
              width="030"
              height="30"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="#a1e75d"
                stroke="var(--migratio_secondary)"
                strokeWidth="10"
              />
              <path
                d="M35 65 L65 35 M50 35 H65 V50"
                stroke="var(--migratio_secondary)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex items-center group-data-[state=collapsed]:hidden">
            <h3 className="truncate text-margin-zero fw-400">
              {activeTeam.name}
            </h3>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
