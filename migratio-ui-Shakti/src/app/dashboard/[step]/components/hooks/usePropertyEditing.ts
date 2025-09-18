import { useState } from 'react';
import { ObjectKey, PreviewRow, PendingJsonState, EditFormState, PropPoolState } from '../types/propertyTypes';
import { getInternalNameForLabel } from '../utils/propertyUtils';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/context/UserContext';

export const usePropertyEditing = (
  rows: PreviewRow[],
  setRows: React.Dispatch<React.SetStateAction<PreviewRow[]>>,
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>,
  setPendingJson: React.Dispatch<React.SetStateAction<PendingJsonState>>,
  propPool: PropPoolState
) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ target: "" });
  const { user, profile } = useUser();

  const startEditing = (index: number, row: PreviewRow) => {
    if (row.type === "default") return; // allow edit for custom + userdefined
    setEditingRow(index);
    setEditForm({ target: row.target });
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setEditForm({ target: "" });
  };

  const saveEditing = (index: number) => {
    const actualRowIndex = rows.findIndex(
      (row) => row.source === rows[index].source && row.object === rows[index].object
    );
    if (actualRowIndex === -1) return;
    
    const updatedRow = { ...rows[actualRowIndex], target: editForm.target, isEditing: false };
    const storageKey = `customPropertyEdits:${updatedRow.object}`;
    const existingEdits = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const previous = existingEdits[updatedRow.source] || {};
    existingEdits[updatedRow.source] = {
      ...previous,
      target: updatedRow.target,
      timestamp: new Date().toISOString(),
    };

    // Also mirror under internal source name to keep both references in sync
    try {
      const internalName = getInternalNameForLabel(updatedRow.object, updatedRow.source, propPool, {
        contacts: [],
        companies: [],
        deals: [],
        tickets: []
      });
      if (internalName) {
        const prevInternal = existingEdits[internalName] || {};
        existingEdits[internalName] = {
          ...prevInternal,
          target: updatedRow.target,
          timestamp: new Date().toISOString(),
        };
      }
    } catch { }
    
    localStorage.setItem(storageKey, JSON.stringify(existingEdits));
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[actualRowIndex] = updatedRow;
      return newRows;
    });
    setEditingRow(null);
    setEditForm({ target: "" });
    setTimeout(() => window.dispatchEvent(new Event("storage")), 100);
    setHasUnsavedChanges(true);

    // Track change in pending JSON
    const storageKey2 = `customPropertyEdits:${updatedRow.object}`;
    const edits2 = JSON.parse(localStorage.getItem(storageKey2) || "{}");
    const prevEdit2 = edits2[updatedRow.source] || {};
    let sourceName = getInternalNameForLabel(updatedRow.object, updatedRow.source, propPool, {
      contacts: [],
      companies: [],
      deals: [],
      tickets: []
    });

    // If getInternalNameForLabel returns the same as source (meaning it used fallback), 
    // try to find it in the original source list
    if (sourceName === updatedRow.source) {
      const sourceList = propPool?.[updatedRow.object] ?? [];
      const foundSrc = sourceList?.find((p) => p.label === updatedRow.source || p.name === updatedRow.source);
      if (foundSrc?.name) {
        sourceName = foundSrc.name;
      }
    }

    // Apply different handling based on property type
    if (updatedRow.type === "userdefined") {
      console.log('💾 [SAVE_EDITING] Userdefined property - sourceName:', sourceName, 'for source:', updatedRow.source);
      // For userdefined, validate internal name format
      if (sourceName && /[A-Z\s]/.test(sourceName)) {
        const fixedSourceName = sourceName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        console.log('🔧 [SAVE_EDITING] Fixed userdefined sourceName:', sourceName, '→', fixedSourceName);
        sourceName = fixedSourceName;
      }
    } else {
      console.log('💾 [SAVE_EDITING] Custom property - sourceName:', sourceName, 'for source:', updatedRow.source);
    }

    // Determine targetLabel based on property type
    const targetLabel = updatedRow.target; // Always use the target label from the row

           // Create the mapping object based on property type
     const mappingObject: any = {
       targetLabel: targetLabel,
       sourceLabel: updatedRow.source, // Store source label for reference
       type: updatedRow.type === "custom" ? "custom" : "userdefined", // Keep existing type logic
       newProperty: updatedRow.type === "userdefined", // true for userdefined, false for custom
     };

    if (updatedRow.type === "userdefined") {
      // For userdefined properties, include targetName and newProperty
      mappingObject.targetName = prevEdit2.targetName || updatedRow.target;
      // Don't change newProperty when editing - keep existing value
      // mappingObject.newProperty = true; // Always true for userdefined
    } else if (updatedRow.type === "custom") {
      // For custom properties, only include targetLabel and sourceLabel
      // No targetName or newProperty needed
    }

    setPendingJson((prev) => ({
      ...prev,
      [updatedRow.object]: {
        ...(prev[updatedRow.object] || {}),
        [sourceName || updatedRow.source]: mappingObject,
      },
    }));

    // Immediately save the edit to Supabase
    (async () => {
      try {
        if (!user?.id) return;

        console.log('💾 [SAVE_EDITING] Persisting edit to Supabase for:', updatedRow.source, 'in', updatedRow.object);

        // Load existing JSON from Supabase
        const { data: existingRow } = await supabase
          .from("profiles")
          .select("hubspot_crm_a_mapped_json")
          .eq("id", user.id)
          .single();

        const existingJson = (existingRow as any)?.hubspot_crm_a_mapped_json || {};
        const existingChanges = (existingJson?.changes || {}) as Partial<Record<ObjectKey, Record<string, any>>>;

        // Update the property in the changes
        const updatedChanges = { ...existingChanges };
        if (!updatedChanges[updatedRow.object]) {
          updatedChanges[updatedRow.object] = {};
        }

        // Find and update the existing property or add new one
        const objectChanges = { ...updatedChanges[updatedRow.object] };
        
        // Find the property to update
        let foundKey = null;
        Object.entries(objectChanges).forEach(([key, mapping]: [string, any]) => {
          const matchesSource = mapping.sourceLabel === updatedRow.source || 
                               mapping.sourceName === updatedRow.source ||
                               mapping.sourceLabel === updatedRow.target ||
                               mapping.sourceName === updatedRow.target;
          
          const matchesTarget = mapping.targetLabel === updatedRow.source || 
                               mapping.targetName === updatedRow.source ||
                               mapping.targetLabel === updatedRow.target ||
                               mapping.targetName === updatedRow.target;
          
          const matchesKey = key === updatedRow.source || key === updatedRow.target;
          
          const normalizedSource = updatedRow.source.toLowerCase().replace(/[^a-z0-9]+/g, "_");
          const normalizedTarget = updatedRow.target.toLowerCase().replace(/[^a-z0-9]+/g, "_");
          const matchesNormalized = key === normalizedSource || key === normalizedTarget;
          
          if (matchesSource || matchesTarget || matchesKey || matchesNormalized) {
            foundKey = key;
          }
        });

        // Update the property
        const finalKey = foundKey || (sourceName || updatedRow.source);
        
                 // Create the mapping object for Supabase update
         const supabaseMappingObject: any = {
           targetLabel: updatedRow.target,
           sourceLabel: updatedRow.source,
           sourceName: sourceName, // ✅ Add internal source name
           type: updatedRow.type === "custom" ? "custom" : "userdefined", // Keep existing type logic
           newProperty: updatedRow.type === "userdefined", // true for userdefined, false for custom
         };

        if (updatedRow.type === "userdefined") {
          // For userdefined properties, include targetName and newProperty
          supabaseMappingObject.targetName = prevEdit2.targetName || updatedRow.target;
          // Don't change newProperty when editing - keep existing value
          // supabaseMappingObject.newProperty = true;
        } else if (updatedRow.type === "custom") {
          // For custom properties, only include targetLabel and sourceLabel
          // No targetName or newProperty needed
        }
        
        objectChanges[finalKey] = supabaseMappingObject;
        
        updatedChanges[updatedRow.object] = objectChanges;

        // Save updated JSON
        const payload = {
          instance: existingJson.instance || "a",
          updatedAt: new Date().toISOString(),
          changes: updatedChanges,
        };

        console.log('💾 [SAVE_EDITING] Saving updated mappings to Supabase:', JSON.stringify(payload, null, 2));

        const { data, error } = await supabase
          .from("profiles")
          .update({ hubspot_crm_a_mapped_json: payload })
          .eq("id", user.id);

        if (error) {
          console.error('❌ [SAVE_EDITING] Supabase update error:', error);
        } else {
          console.log('✅ [SAVE_EDITING] Edit persisted to Supabase successfully');
        }

        // Reset hasUnsavedChanges since we just saved
        setHasUnsavedChanges(false);

        // Trigger a reload event to refresh the UI
        setTimeout(() => {
          console.log('🔄 [SAVE_EDITING] Triggering reload event after save');
          window.dispatchEvent(new CustomEvent('propertyEdited', {
            detail: { object: updatedRow.object, source: updatedRow.source, target: updatedRow.target }
          }));
        }, 500);

      } catch (error) {
        console.error('❌ [SAVE_EDITING] Error persisting edit to Supabase:', error);
      }
    })();
  };

  const handleEditChange = (field: "target", value: string) => setEditForm((prev) => ({ ...prev, [field]: value }));

  // Add reverse functionality for custom properties
  const reverseCustomProperty = (index: number) => {
    const targetRow = rows[index];
    const actualRowIndex = rows.findIndex(
      (row) =>
        row.object === targetRow.object &&
        row.source === targetRow.source &&
        row.target === targetRow.target &&
        row.type === targetRow.type
    );
    if (actualRowIndex === -1) return;
    const row = rows[actualRowIndex];
    if (row.type !== "custom") return;

    console.log('🔄 [REVERSE] Starting reverse for custom property:', {
      object: row.object,
      source: row.source,
      target: row.target,
      type: row.type
    });

    // Update the row to use the original source label as target
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[actualRowIndex] = {
        ...newRows[actualRowIndex],
        target: row.source, // Revert to original source label
      };
      return newRows;
    });

    setHasUnsavedChanges(true);

    // Update pending JSON to reflect the reverse
    setPendingJson((prev) => {
      const copy = { ...(prev as any) } as typeof prev;
      const objMap = { ...(copy[row.object] || {}) };
      
      // Find the property to reverse
      const keysToUpdate: string[] = [];
      Object.entries(objMap).forEach(([key, mapping]: [string, any]) => {
        const matchesSource = mapping.sourceLabel === row.source || 
                             mapping.sourceName === row.source ||
                             mapping.sourceLabel === row.target ||
                             mapping.sourceName === row.target;
        
        const matchesTarget = mapping.targetLabel === row.source || 
                             mapping.targetName === row.source ||
                             mapping.targetLabel === row.target ||
                             mapping.targetName === row.target;
        
        const matchesKey = key === row.source || key === row.target;
        
        const normalizedSource = row.source.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        const normalizedTarget = row.target.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        const matchesNormalized = key === normalizedSource || key === normalizedTarget;
        
        if (matchesSource || matchesTarget || matchesKey || matchesNormalized) {
          keysToUpdate.push(key);
        }
      });
      
      // Update the matching keys to revert the label
      keysToUpdate.forEach(key => {
        if (objMap[key]) {
          objMap[key] = {
            ...objMap[key],
            targetLabel: row.source, // Revert to original source label
          };
          console.log('🔄 [REVERSE] Reverted property:', key, 'to:', row.source);
        }
      });
      
      return { ...copy, [row.object]: objMap };
    });

    // Save the reverse to Supabase
    (async () => {
      try {
        if (!user?.id) return;

        console.log('🔄 [REVERSE] Persisting reverse to Supabase for:', row.source, 'in', row.object);

        // Load existing JSON from Supabase
        const { data: existingRow } = await supabase
          .from("profiles")
          .select("hubspot_crm_a_mapped_json")
          .eq("id", user.id)
          .single();

        const existingJson = (existingRow as any)?.hubspot_crm_a_mapped_json || {};
        const existingChanges = (existingJson?.changes || {}) as Partial<Record<ObjectKey, Record<string, any>>>;

        // Update the property to revert the label
        const updatedChanges = { ...existingChanges };
        if (updatedChanges[row.object]) {
          const objectChanges = { ...updatedChanges[row.object] };
          
          // Find and update the property
          Object.entries(objectChanges).forEach(([key, mapping]: [string, any]) => {
            const matchesSource = mapping.sourceLabel === row.source || 
                                 mapping.sourceName === row.source ||
                                 mapping.sourceLabel === row.target ||
                                 mapping.sourceName === row.target;
            
            const matchesTarget = mapping.targetLabel === row.source || 
                                 mapping.targetName === row.source ||
                                 mapping.targetLabel === row.target ||
                                 mapping.targetName === row.target;
            
            const matchesKey = key === row.source || key === row.target;
            
            const normalizedSource = row.source.toLowerCase().replace(/[^a-z0-9]+/g, "_");
            const normalizedTarget = row.target.toLowerCase().replace(/[^a-z0-9]+/g, "_");
            const matchesNormalized = key === normalizedSource || key === normalizedTarget;
            
            if (matchesSource || matchesTarget || matchesKey || matchesNormalized) {
              objectChanges[key] = {
                ...objectChanges[key],
                targetLabel: row.source, // Revert to original source label
              };
              console.log('🔄 [REVERSE] Updated property in database:', key, 'to:', row.source);
            }
          });
          
          updatedChanges[row.object] = objectChanges;
        }

        // Save updated JSON
        const payload = {
          instance: existingJson.instance || "a",
          updatedAt: new Date().toISOString(),
          changes: updatedChanges,
        };

        console.log('💾 [REVERSE] Saving updated mappings to Supabase:', JSON.stringify(payload, null, 2));

        const { data, error } = await supabase
          .from("profiles")
          .update({ hubspot_crm_a_mapped_json: payload })
          .eq("id", user.id);

        if (error) {
          console.error('❌ [REVERSE] Supabase update error:', error);
        } else {
          console.log('✅ [REVERSE] Reverse persisted to Supabase successfully');
        }

        // Reset hasUnsavedChanges since we just saved
        setHasUnsavedChanges(false);

      } catch (error) {
        console.error('❌ [REVERSE] Error persisting reverse to Supabase:', error);
      }
    })();
  };

  const deleteUserDefined = (index: number) => {
    const targetRow = rows[index];
    const actualRowIndex = rows.findIndex(
      (row) =>
        row.object === targetRow.object &&
        row.source === targetRow.source &&
        row.target === targetRow.target &&
        row.type === targetRow.type
    );
    if (actualRowIndex === -1) return;
    const row = rows[actualRowIndex];
    
    // Allow deletion for both userdefined and custom properties (user-created mappings)
    if (row.type !== "userdefined" && row.type !== "custom") return;

    console.log('🗑️ [DELETE_START] Starting deletion for:', {
      object: row.object,
      source: row.source,
      target: row.target,
      type: row.type
    });

    // Remove from rows
    setRows((prev) => prev.filter((_, i) => i !== actualRowIndex));

    // Remove persisted edit if any
    try {
      const storageKey = `customPropertyEdits:${row.object}`;
      const existingEdits = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const sourceName = getInternalNameForLabel(row.object, row.source, propPool, {
        contacts: [],
        companies: [],
        deals: [],
        tickets: []
      });

      // Remove from custom property edits
      if (existingEdits[row.source]) delete existingEdits[row.source];
      if (sourceName && existingEdits[sourceName]) delete existingEdits[sourceName];
      localStorage.setItem(storageKey, JSON.stringify(existingEdits));

      // Also remove from user-defined properties list if it's there
      const udKey = `userDefinedProps:${row.object}`;
      try {
        const prevUD: string[] = JSON.parse(localStorage.getItem(udKey) || "[]");
        const updatedUD = prevUD.filter(prop => prop !== sourceName && prop !== row.source);
        localStorage.setItem(udKey, JSON.stringify(updatedUD));
        console.log('🗑️ [DELETE] Removed from user-defined properties:', { removed: row.source, remaining: updatedUD.length });
      } catch { }

      setTimeout(() => window.dispatchEvent(new Event("storage")), 100);
    } catch { }

    // Update pending JSON to reflect deletion
    setPendingJson((prev) => {
      const copy = { ...(prev as any) } as typeof prev;
      const objMap = { ...(copy[row.object] || {}) };
      
      // Find and delete the property by matching multiple criteria
      const keysToDelete: string[] = [];
      Object.entries(objMap).forEach(([key, mapping]: [string, any]) => {
        // Check if this mapping matches the row we want to delete
        const matchesSource = mapping.sourceLabel === row.source || 
                             mapping.sourceName === row.source ||
                             mapping.sourceLabel === row.target ||
                             mapping.sourceName === row.target;
        
        const matchesTarget = mapping.targetLabel === row.source || 
                             mapping.targetName === row.source ||
                             mapping.targetLabel === row.target ||
                             mapping.targetName === row.target;
        
        const matchesKey = key === row.source || key === row.target;
        
        // Also check if the key is a transformed version of the source/target
        const normalizedSource = row.source.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        const normalizedTarget = row.target.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        const matchesNormalized = key === normalizedSource || key === normalizedTarget;
        
        if (matchesSource || matchesTarget || matchesKey || matchesNormalized) {
          keysToDelete.push(key);
          console.log('🗑️ [DELETE] Found matching property in pendingJson:', {
            key,
            mapping,
            rowSource: row.source,
            rowTarget: row.target
          });
        }
      });
      
      // Delete all matching keys
      keysToDelete.forEach(key => {
        delete objMap[key];
        console.log('🗑️ [DELETE] Deleted from pendingJson:', key);
      });
      
      return { ...copy, [row.object]: objMap };
    });

    setHasUnsavedChanges(true);

    // Immediately save to Supabase to persist the deletion
    (async () => {
      try {
        if (!user?.id) return;

        console.log('🗑️ [DELETE] Persisting deletion to Supabase for:', row.source, 'in', row.object);

        // Load existing JSON from Supabase
        const { data: existingRow } = await supabase
          .from("profiles")
          .select("hubspot_crm_a_mapped_json")
          .eq("id", user.id)
          .single();

        const existingJson = (existingRow as any)?.hubspot_crm_a_mapped_json || {};
        const existingChanges = (existingJson?.changes || {}) as Partial<Record<ObjectKey, Record<string, any>>>;

        console.log('🗑️ [DELETE] Current database state:', JSON.stringify(existingChanges, null, 2));

        // Remove the deleted property from the changes
        const updatedChanges = { ...existingChanges };
        if (updatedChanges[row.object]) {
          const objectChanges = { ...updatedChanges[row.object] };
          
          // Find and delete the property by matching multiple criteria
          const keysToDelete: string[] = [];
          Object.entries(objectChanges).forEach(([key, mapping]: [string, any]) => {
            // Check if this mapping matches the row we want to delete
            const matchesSource = mapping.sourceLabel === row.source || 
                                 mapping.sourceName === row.source ||
                                 mapping.sourceLabel === row.target ||
                                 mapping.sourceName === row.target;
            
            const matchesTarget = mapping.targetLabel === row.source || 
                                 mapping.targetName === row.source ||
                                 mapping.targetLabel === row.target ||
                                 mapping.targetName === row.target;
            
            const matchesKey = key === row.source || key === row.target;
            
            // Also check if the key is a transformed version of the source/target
            const normalizedSource = row.source.toLowerCase().replace(/[^a-z0-9]+/g, "_");
            const normalizedTarget = row.target.toLowerCase().replace(/[^a-z0-9]+/g, "_");
            const matchesNormalized = key === normalizedSource || key === normalizedTarget;
            
            if (matchesSource || matchesTarget || matchesKey || matchesNormalized) {
              keysToDelete.push(key);
              console.log('🗑️ [DELETE] Found matching property in database:', {
                key,
                mapping,
                rowSource: row.source,
                rowTarget: row.target,
                matchesSource,
                matchesTarget,
                matchesKey,
                matchesNormalized
              });
            }
          });
          
          // Delete all matching keys
          keysToDelete.forEach(key => {
            delete objectChanges[key];
            console.log('🗑️ [DELETE] Deleted property with key:', key);
          });
          
          updatedChanges[row.object] = objectChanges;
        }

        // Save updated JSON without the deleted property
        const payload = {
          instance: existingJson.instance || "a",
          updatedAt: new Date().toISOString(),
          changes: updatedChanges,
        };

        console.log('💾 [DELETE] Saving updated mappings to Supabase:', JSON.stringify(payload, null, 2));

        const { data, error } = await supabase
          .from("profiles")
          .update({ hubspot_crm_a_mapped_json: payload })
          .eq("id", user.id);

        if (error) {
          console.error('❌ [DELETE] Supabase update error:', error);
        } else {
          console.log('✅ [DELETE] Deletion persisted to Supabase successfully');
        }

        // Reset hasUnsavedChanges since we just saved
        setHasUnsavedChanges(false);

        // Also clear custom properties cache for this object to force refresh
        const cacheKey = `customProperties_${row.object}`;
        localStorage.removeItem(cacheKey);
        console.log('🧹 [DELETE] Cleared custom properties cache for:', row.object);
        
        // Also clear user-defined properties cache
        const udCacheKey = `userDefinedProps:${row.object}`;
        localStorage.removeItem(udCacheKey);
        console.log('🧹 [DELETE] Cleared user-defined properties cache for:', row.object);

        // Clear ALL related caches to ensure no stale data
        const allCacheKeys = [
          `customProperties_${row.object}`,
          `userDefinedProps:${row.object}`,
          `customPropertyEdits:${row.object}`,
          `schema:${row.object.charAt(0).toUpperCase() + row.object.slice(1)}:labels:${profile?.hubspot_portal_id_a}`,
          `fetchedInSessionObjects`
        ];
        
        allCacheKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log('🧹 [DELETE] Cleared cache key:', key);
        });
        
        // Also clear session storage
        sessionStorage.removeItem('fetchedInSessionObjects');
        console.log('🧹 [DELETE] Cleared session storage');

        // Trigger a custom event to notify other components about the deletion
        setTimeout(() => {
          console.log('🔄 [DELETE] Triggering deletion event');
          window.dispatchEvent(new CustomEvent('propertyDeleted', {
            detail: { object: row.object, source: row.source, target: row.target }
          }));
        }, 500);

      } catch (error) {
        console.error('❌ [DELETE] Error persisting deletion to Supabase:', error);
      }
    })();
  };

  return {
    editingRow,
    editForm,
    startEditing,
    cancelEditing,
    saveEditing,
    handleEditChange,
    deleteUserDefined,
    reverseCustomProperty
  };
};
