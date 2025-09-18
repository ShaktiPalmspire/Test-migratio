import React from "react";
import SelectableCard from "@/components/SelectableCards/SelectableCard";
import Button from "@/components/Buttons/button";
import Heading from "@/components/Headings/heading";
import { CRM_DATA } from "../types/constants";
import type { Step1Props } from "../types";

/**
 * Step 1: CRM Selection Component
 * Allows users to select which CRM they want to migrate from
 */
export function Step1Connections({ 
  selectedId, 
  onSelectCrm, 
  onNext 
}: Step1Props) {
  return (
    <>
      <Heading as="h2" className="mt-8">
        Select CRM
      </Heading>
      
      <div className="flex flex-wrap gap-4">
        {Object.entries(CRM_DATA).map(([id, data]) => (
          <SelectableCard
            key={id}
            title={data.title}
            subtitle={data.subtitle}
            logo={data.logo}
            isSelected={selectedId === id}
            onSelect={() => onSelectCrm(id as keyof typeof CRM_DATA)}
            comingSoon={["zoho", "zendesk", "pipedrive"].includes(id)}
          />
        ))}
      </div>
      
      {selectedId === "hubspot" && (
        <div className="mt-6">
          <Button variant="primary" onClick={onNext}>
            Next
          </Button>
        </div>
      )}
    </>
  );
}