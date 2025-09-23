import { useState } from "react";
import { PendingJsonState } from "../types/propertyTypes";
import { StepIndex } from "../../types/dashboard";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/context/UserContext";

export const usePropertySaving = (
  pendingJson: PendingJsonState,
  hasUnsavedChanges: boolean,
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>,
  onStepChange: (step: StepIndex) => void
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();

  const saveMappings = async () => {
    if (!user?.id) {
      console.error("[SAVE] No user ID available");
      return false;
    }

    setIsSaving(true);
    try {
      // Load existing JSON
      const { data: existingRow, error: fetchError } = await supabase
        .from("profiles")
        .select("hubspot_crm_a_mapped_json")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error("[SAVE] Failed to load existing mappings:", fetchError);
        return false;
      }

      const existingJson =
        (existingRow as any)?.hubspot_crm_a_mapped_json || {};
      const existingChanges =
        (existingJson?.changes || {}) as Partial<
          Record<string, Record<string, any>>
        >;

      // Merge with new changes
      const mergedChanges = { ...existingChanges };
      for (const [objectType, objectChanges] of Object.entries(pendingJson)) {
        mergedChanges[objectType] = {
          ...(mergedChanges[objectType] || {}),
          ...objectChanges,
        };
      }

      // Final payload
      const payload = {
        instance: existingJson.instance || "a",
        updatedAt: new Date().toISOString(),
        changes: mergedChanges,
      };

      // Save to Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ hubspot_crm_a_mapped_json: payload })
        .eq("id", user.id);

      if (updateError) {
        console.error("[SAVE] Supabase update failed:", updateError);
        return false;
      }

      setHasUnsavedChanges(false);
      return true;
    } catch (err) {
      console.error("[SAVE] Unexpected error:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndProceed = async () => {
    if (!hasUnsavedChanges) {
      onStepChange(5);
      return;
    }

    const success = await saveMappings();
    if (success) {
      onStepChange(5);
    }
  };

  return {
    isSaving,
    saveMappings,
    handleSaveAndProceed,
  };
};
