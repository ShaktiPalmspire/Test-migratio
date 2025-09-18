import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/Headings/heading";
import StepperComponent from "@/components/Stepper/StepperComponent";
import { IconLayoutSidebar } from "@tabler/icons-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { StepIndex, CrmId } from "../types";
import { CRM_DATA } from "../types/constants";

interface DashboardLayoutProps {
  currentStep: StepIndex;
  selectedCrmId?: CrmId | null;
  onStepClick: (step: StepIndex) => void;
  children: React.ReactNode;
  step: number;
}

export function DashboardLayout({ children, step }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex">
        <div className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex items-center gap-2">
                <IconLayoutSidebar className="h-4 w-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </div>
            </div>
          </header>
          <Separator />
          <main className="flex w-full flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 p-4 pt-6">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((stepNumber) => (
                    <React.Fragment key={stepNumber}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          stepNumber <= step
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div
                          className={`w-12 h-0.5 ${
                            stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <span className="ml-4 text-sm text-gray-600">
                  Step {step} of 3
                </span>
              </div>

              {/* Main content */}
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}