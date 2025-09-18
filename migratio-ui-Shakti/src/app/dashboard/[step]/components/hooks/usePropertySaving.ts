import { useState } from 'react';
import { PendingJsonState } from '../types/propertyTypes';
import { StepIndex } from '../../types/dashboard';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/context/UserContext';

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
      console.error('❌ [SAVE] No user ID available');
      return false;
    }

    setIsSaving(true);
    try {
      console.log('💾 [SAVE] Starting to save mappings...');
      console.log('💾 [SAVE] Pending JSON:', pendingJson);

      // Load existing JSON from Supabase
      const { data: existingRow } = await supabase
        .from("profiles")
        .select("hubspot_crm_a_mapped_json")
        .eq("id", user.id)
        .single();

      const existingJson = (existingRow as any)?.hubspot_crm_a_mapped_json || {};
      const existingChanges = (existingJson?.changes || {}) as Partial<Record<string, Record<string, any>>>;

      // Merge existing changes with new pending changes
      const mergedChanges = { ...existingChanges };
      Object.entries(pendingJson).forEach(([objectType, objectChanges]) => {
        if (!mergedChanges[objectType]) {
          mergedChanges[objectType] = {};
        }
        mergedChanges[objectType] = { ...mergedChanges[objectType], ...objectChanges };
      });

      // Prepare the payload
      const payload = {
        instance: existingJson.instance || "a",
        updatedAt: new Date().toISOString(),
        changes: mergedChanges,
      };

      console.log('💾 [SAVE] Final payload:', payload);

      // Save to Supabase
      const { data, error } = await supabase
        .from("profiles")
        .update({ hubspot_crm_a_mapped_json: payload })
        .eq("id", user.id)
        .select();

      if (error) {
        console.error('❌ [SAVE] Supabase error:', error);
        return false;
      }

      console.log('✅ [SAVE] Mappings saved successfully:', data);
      setHasUnsavedChanges(false);
      return true;

    } catch (error) {
      console.error('❌ [SAVE] Error saving mappings:', error);
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
    handleSaveAndProceed
  };
};
