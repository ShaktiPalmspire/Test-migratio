"use client";

import * as React from "react";

import { IconAddressBook, IconHelp } from "@tabler/icons-react";
import MigratioLogo from "../components/AppLogo/logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";

// This is sample data.
const data = {
  user: {
    name: "User Name",
    email: "user@gmail.com",
    avatar: "https://eu.ui-avatars.com/api/?name=User+Name&size=250",
  },
  teams: [
    {
      name: "Migratio",
      logo: <MigratioLogo />,
      plan: "By Palmspire",
    },
  ],
  navMain: [
    {
      title: "Contacts",
      url: "/contacts",
      icon: IconAddressBook,
      isActive: true,
    },
    {
      title: "Companies",
      url: "/companies",
      icon: IconAddressBook,
      isActive: true,
    },
    {
      title: "Deals",
      url: "/deals",
      icon: IconAddressBook,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: IconAddressBook,
    },
    {
      title: "Documentation",
      url: "/documentation",
      icon: IconAddressBook,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, isLoading } = useUser();

  if (isLoading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          {/* You can add a skeleton loader here */}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  const userData = user
    ? {
        name: profile?.full_name || "User Name",
        email: user.email || "user@gmail.com",
        avatar:
          profile?.avatar_url ||
          `https://eu.ui-avatars.com/api/?name=${
            profile?.full_name ?? "User+Name"
          }&size=250`,
      }
    : data.user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <a href="/help-and-information" className="flex gap-2 p-4 border-b-1">
        <IconHelp />
        <p className="text-[var(--black_color)] text-margin-zero">Help & Information</p>
      </a>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
