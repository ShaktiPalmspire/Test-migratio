"use client";

import InfoCard from "../../components/InfoCards/InfoCards";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/Headings/heading";
import { IconLayoutSidebar } from "@tabler/icons-react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 p-4">
          <SidebarTrigger className="-ml-1">
            <IconLayoutSidebar size={20} stroke={1.5} />
          </SidebarTrigger>
          <Separator orientation="vertical" className="!h-6 mx-2" />
          <Heading as="h3" className="text-margin-zero">
            Migratio
          </Heading>
        </header>

        <main className="md:px-6">
          <div className="heading_container">
            <Heading as="h4" className="text-margin-zero">
              Help & Information
            </Heading>
          </div>
          <div className="information_cards flex gap-4 py-10 px-4">
            <InfoCard
              title="Guided Migration"
              subtitle="For when you're not looking to complete a data migration on your own."
              dialogContent={
                <p>
                  This option gives you hands-on assistance with experts helping
                  you move your data step by step.
                </p>
              }
            />
            <InfoCard
              title="Guided Migration"
              subtitle="For when you're not looking to complete a data migration on your own."
              dialogContent={
                <p>
                  This option gives you hands-on assistance with experts helping
                  you move your data step by step.
                </p>
              }
            />
            <InfoCard
              title="Guided Migration"
              subtitle="For when you're not looking to complete a data migration on your own."
              dialogContent={
                <p>
                  This option gives you hands-on assistance with experts helping
                  you move your data step by step.
                </p>
              }
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
