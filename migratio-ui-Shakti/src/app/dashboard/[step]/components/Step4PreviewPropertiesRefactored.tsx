"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/Buttons/button";
import { StepIndex } from "../types/dashboard";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import {
  hubspotContactProperties,
  hubspotCompanyProperties,
  hubspotDealProperties,
  hubspotTicketProperties,
} from "@/context/hubspotdefaultproperties";

// Import modular components and utilities
import { ObjectKey, PreviewRow, PropertyItem, PendingJsonState, EditFormState } from "./types/propertyTypes";
import { 
  slugify, 
  getDisplayText, 
  getPropertyLabel, 
  getInternalNameForLabel, 
  fixCorruptedProperties, 
  norm, 
  getTotalPropertiesCount 
} from "./utils/propertyUtils";
import { useCustomProperties, usePropertyPool } from "./hooks/usePropertyHooks";
import { PropertyTable, SearchBar, SummarySection } from "./components/PropertyTableComponents";
import { AddPropertyModal } from "./components/AddPropertyModal";

interface Step4PreviewPropertiesProps {
  onStepChange: (step: StepIndex) => void;
  selectedObjects: Set<ObjectKey>;
}

export function Step4PreviewProperties({ onStepChange, selectedObjects }: Step4PreviewPropertiesProps) {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ target: "" });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingJson, setPendingJson] = useState<PendingJsonState>({});

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addObject, setAddObject] = useState<ObjectKey>((Array.from(selectedObjects)[0] as ObjectKey) || "contacts");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [targetObject, setTargetObject] = useState<ObjectKey>((Array.from(selectedObjects)[0] as ObjectKey) || "contacts");
  const [selectedTargetName, setSelectedTargetName] = useState<string>("");

  const { user, profile } = useUser();
  const { customProperties, isLoadingCustom, fetchAllCustomProperties } = useCustomProperties(selectedObjects);
  const { propPool, loadedLists, loadProps, setPropPool } = usePropertyPool();

  // Clear pendingJson when component mounts to start fresh
  useEffect(() => {
    setPendingJson({});
    console.log('🔄 [INIT] Cleared pendingJson for fresh start');
  }, []);

  // Unified data migration function to fix existing data issues
  useEffect(() => {
    const migrateAndFixData = async () => {
      if (!user?.id || !profile) {
        console.log('🔄 [MIGRATION] Skipping migration - no user or profile');
        return;
      }
      
      console.log('🔄 [MIGRATION] Starting unified data migration...');
      
      try {
        const mappedChangesAll: any = (profile as any)?.hubspot_crm_a_mapped_json?.changes || {};
        let hasChanges = false;
        const updatedChanges = { ...mappedChangesAll };
        
        console.log('🔄 [MIGRATION] Current mapped changes:', mappedChangesAll);
        
        // Helper function to determine if a property is existing HubSpot property
        const isExistingHubSpotProperty = (sourceName: string, objectType: string) => {
          const defaultProps = defaultMapModal[objectType as ObjectKey] || [];
          return defaultProps.some(prop => prop.name === sourceName);
        };
        
        // Process each object type
        Object.keys(updatedChanges).forEach((objectType) => {
          const objectChanges = updatedChanges[objectType];
          if (objectChanges) {
            Object.keys(objectChanges).forEach((propertyKey) => {
              const property = objectChanges[propertyKey];
              if (property) {
                const isExisting = isExistingHubSpotProperty(property.sourceName || propertyKey, objectType);
                
                // Fix 1: Keep userdefined properties as userdefined (don't convert to custom)
                // This ensures userdefined properties remain userdefined on all pages
                if (property.type === "userdefined") {
                  console.log('🔄 [MIGRATION] Keeping userdefined property as userdefined:', propertyKey);
                  // No conversion needed - keep as userdefined
                }
                
                // Fix 2: Set newProperty to false for existing HubSpot properties
                if (property.newProperty === true && isExisting) {
                  console.log('🔄 [MIGRATION] Setting newProperty to false for existing property:', propertyKey);
                  property.newProperty = false;
                  hasChanges = true;
                }
                
                // Fix 3: Ensure sourceName is properly set
                if (!property.sourceName && property.sourceLabel) {
                  const sourceName = getInternalNameForLabel(
                    objectType as ObjectKey, 
                    property.sourceLabel, 
                    propPool, 
                    defaultMapModal
                  );
                  if (sourceName) {
                    property.sourceName = sourceName;
                    hasChanges = true;
                  }
                }
              }
            });
          }
        });
        
        if (hasChanges) {
          console.log('🔄 [MIGRATION] Updating database with fixes');
          const payload = {
            instance: (profile as any)?.hubspot_crm_a_mapped_json?.instance || "a",
            updatedAt: new Date().toISOString(),
            changes: updatedChanges,
          };
          
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ hubspot_crm_a_mapped_json: payload })
            .eq("id", user.id);
          
          if (updateError) {
            console.error('❌ [MIGRATION] Error updating database:', updateError);
          } else {
            console.log('✅ [MIGRATION] Successfully migrated data');
            // Trigger a reload to refresh the UI
            window.location.reload();
          }
        } else {
          console.log('ℹ️ [MIGRATION] No data needs migration');
        }
      } catch (error) {
        console.error('❌ [MIGRATION] Error during migration:', error);
      }
    };
    
    migrateAndFixData();
  }, [user?.id, profile, propPool]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.source, r.target, r.object, r.type].map(String).some((v) => v.toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  const canProceed = !isLoadingCustom && rows.length > 0;

  // Label map for property lookups
  const labelMap = useMemo(() => {
    const createMap = (arr: any[]) => Object.fromEntries(arr.map((p) => [p.name, p.label || p.name]));
    return {
      contacts: createMap(hubspotContactProperties),
      companies: createMap(hubspotCompanyProperties),
      deals: createMap(hubspotDealProperties),
      tickets: createMap(hubspotTicketProperties),
    };
  }, []);

  // Default property mappings
  const defaultMapModal: Record<ObjectKey, PropertyItem[]> = useMemo(
    () => ({
      contacts: hubspotContactProperties.map((p) => ({ name: p.name, label: p.label || p.name, type: p.type, fieldType: p.fieldType })),
      companies: hubspotCompanyProperties.map((p) => ({ name: p.name, label: p.label || p.name, type: p.type, fieldType: p.fieldType })),
      deals: hubspotDealProperties.map((p) => ({ name: p.name, label: p.label || p.name, type: p.type, fieldType: p.fieldType })),
      tickets: hubspotTicketProperties.map((p) => ({ name: p.name, label: p.label || p.name, type: p.type, fieldType: p.fieldType })),
    }),
    []
  );

  const defaultMetaByName = useMemo(() => {
    const build = (arr: PropertyItem[]) => {
      const m: Record<string, { type?: string; fieldType?: string }> = {};
      arr.forEach((p) => (m[p.name] = { type: p.type, fieldType: p.fieldType }));
      return m;
    };
    return {
      contacts: build(defaultMapModal.contacts),
      companies: build(defaultMapModal.companies),
      deals: build(defaultMapModal.deals),
      tickets: build(defaultMapModal.tickets),
    };
  }, [defaultMapModal]);

  // Load mappings from profile and localStorage
  useEffect(() => {
    const loadMappings = () => {
      try {
        const collected: PreviewRow[] = [];

        const mappedChangesAll: any = (profile as any)?.hubspot_crm_a_mapped_json?.changes || {};
        console.log('🔍 [LOAD_MAPPINGS] Loading mappings from profile:', {
          hasProfile: !!profile,
          hasJson: !!(profile as any)?.hubspot_crm_a_mapped_json,
          mappedChangesAll,
          selectedObjects: Array.from(selectedObjects)
        });

        // Clear corrupted cache data (but preserve userDefinedProps)
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.includes('customProperties_') || 
                key.includes('customPropertyEdits:') ||
                key.includes('mappings_preview:')) {
              localStorage.removeItem(key);
              console.log('🧹 [LOAD_MAPPINGS] Cleared cached key:', key);
            }
          });
        } catch (cacheError) {
          console.warn('⚠️ [LOAD_MAPPINGS] Error clearing cache:', cacheError);
        }

        selectedObjects.forEach((objectType) => {
          const mappedForObject: Record<string, any> = mappedChangesAll[objectType] || {};
          
          // Skip default properties - only process custom/userdefined properties from mappings
          // This ensures only properties created through the form are displayed

          // Only process custom/userdefined properties from stored JSON
          // Skip default HubSpot properties to show only form-created properties
          Object.entries(mappedForObject).forEach(([label, m]: [string, any]) => {
            // Only include properties that are custom or userdefined (not default)
            if (m && (m.type === "custom" || m.type === "userdefined")) {
              let targetDisplay = label;
              if (m.targetLabel === false) {
                targetDisplay = m.targetName || label;
              } else if (m.targetLabel) {
                targetDisplay = m.targetLabel;
              }

              const finalType = m.type === "userdefined" ? "userdefined" : "custom";
              
              collected.push({
                object: objectType,
                source: label,
                target: targetDisplay,
                type: finalType,
              });
            }
          });

          // Add userdefined properties from localStorage
          try {
            const udKey = `userDefinedProps:${objectType}`;
            const userDefinedProps = JSON.parse(localStorage.getItem(udKey) || "[]");
            console.log('🔍 [LOAD_MAPPINGS] Loading userDefinedProps for', objectType, ':', userDefinedProps);
            
            userDefinedProps.forEach((propName: string) => {
              // Always add userdefined properties, even if they exist in other sources
              // Check if this property exists in the mapped changes
              const mapped = mappedForObject[propName];
              let targetDisplay = propName;
              let finalType: "userdefined" | "custom" = "userdefined";
              
              if (mapped) {
                if (mapped.targetLabel === false) {
                  targetDisplay = mapped.targetName || propName;
                } else if (mapped.targetLabel) {
                  targetDisplay = mapped.targetLabel;
                }
                finalType = mapped.type === "userdefined" ? "userdefined" : "custom";
              }
              
              // Check if this userdefined property is already in collected
              const alreadyExists = collected.some(row => 
                row.object === objectType && 
                row.source === propName && 
                row.type === "userdefined"
              );
              
              if (!alreadyExists) {
                collected.push({
                  object: objectType,
                  source: propName,
                  target: targetDisplay,
                  type: finalType,
                });
                console.log('🔍 [LOAD_MAPPINGS] Added userdefined property:', propName, 'for', objectType);
              } else {
                console.log('🔍 [LOAD_MAPPINGS] Userdefined property already exists:', propName, 'for', objectType);
              }
            });
          } catch (error) {
            console.warn('⚠️ [LOAD_MAPPINGS] Error loading userDefinedProps:', error);
          }
        });

        // No sample data needed - only show properties created through the form
        // This ensures the table only displays custom/userdefined properties

        console.log('🔍 [LOAD_MAPPINGS] Collected rows:', {
          totalRows: collected.length,
          byType: {
            default: collected.filter(r => r.type === 'default').length,
            custom: collected.filter(r => r.type === 'custom').length,
            userdefined: collected.filter(r => r.type === 'userdefined').length,
          },
          sampleRows: collected.slice(0, 5),
          allUserdefinedRows: collected.filter(r => r.type === 'userdefined')
        });

        setRows(collected);
      } catch (error) {
        console.error('❌ [LOAD_MAPPINGS] Error loading mappings:', error);
        setRows([]);
      }
    };

    loadMappings();
  }, [labelMap, selectedObjects, customProperties, profile]);

  useEffect(() => {
    if (selectedObjects.size > 0) fetchAllCustomProperties();
  }, [selectedObjects, fetchAllCustomProperties]);

  // Property pool management
  useEffect(() => {
    if (isAddOpen) {
      setAddObject((Array.from(selectedObjects)[0] as ObjectKey) || "contacts");
      setTargetObject((Array.from(selectedObjects)[0] as ObjectKey) || "contacts");
      setSelectedProperty("");
      setSelectedTargetName("");
      loadProps((Array.from(selectedObjects)[0] as ObjectKey) || "contacts", defaultMapModal, defaultMetaByName);
    }
  }, [isAddOpen, selectedObjects, loadProps, defaultMapModal, defaultMetaByName]);

  useEffect(() => {
    setTargetObject(addObject);
    loadProps(addObject, defaultMapModal, defaultMetaByName);
  }, [addObject, loadProps, defaultMapModal, defaultMetaByName]);

  // Property lists with corruption fixes
  const rawSourceList = (propPool[addObject] ?? defaultMapModal[addObject]) as PropertyItem[];
  const sourceList = fixCorruptedProperties(rawSourceList);

  const rawTargetList = (propPool[targetObject] ?? defaultMapModal[targetObject]) as PropertyItem[];
  const targetList = fixCorruptedProperties(rawTargetList);

  const selectedSource: PropertyItem | undefined = useMemo(
    () => sourceList.find((p) => p.name === selectedProperty),
    [selectedProperty, sourceList]
  );

  const filteredTargetList = useMemo(() => {
    if (!selectedSource) return [];
    const st = norm(selectedSource.type);
    const sf = norm(selectedSource.fieldType);
    return targetList.filter((t) => norm(t.type) === st && norm(t.fieldType) === sf);
  }, [targetList, selectedSource]);

  useEffect(() => {
    if (!selectedTargetName) return;
    if (!filteredTargetList.some((t) => t.name === selectedTargetName)) {
      setSelectedTargetName("");
    }
  }, [filteredTargetList, selectedTargetName]);

  // Clear corrupted properties from localStorage and update propPool
  React.useEffect(() => {
    const hasCorruptions = JSON.stringify(rawSourceList) !== JSON.stringify(sourceList);

    if (hasCorruptions) {
      console.log('🔧 [FIX_CORRUPTED] Found corrupted properties, cleaning up...');

      try {
        const storageKey = `customPropertyEdits:${addObject}`;
        const udKey = `userDefinedProps:${addObject}`;
        const cacheKey = `customProperties_${addObject}`;

        localStorage.removeItem(storageKey);
        localStorage.removeItem(udKey);
        localStorage.removeItem(cacheKey);

        console.log('🧹 [CLEANUP] Cleared localStorage keys:', [storageKey, udKey, cacheKey]);
      } catch (error) {
        console.warn('⚠️ [CLEANUP] Failed to clear localStorage:', error);
      }

      setPropPool(prev => ({ ...prev, [addObject]: sourceList }));
    }
  }, [addObject, JSON.stringify(sourceList), rawSourceList, setPropPool]);

  // Event handlers
  const startEditing = (index: number, row: PreviewRow) => {
    if (row.type === "default") return;
    setEditingRow(index);
    setEditForm({ target: row.target });
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setEditForm({ target: "" });
  };

  const saveEditing = (index: number) => {
    const actualRowIndex = rows.findIndex(
      (row) => row.source === filteredRows[index].source && row.object === filteredRows[index].object
    );
    if (actualRowIndex === -1) return;
    
    const updatedRow = { ...rows[actualRowIndex], target: editForm.target, isEditing: false };
    
    // Save to localStorage
    const storageKey = `customPropertyEdits:${updatedRow.object}`;
    const existingEdits = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const previous = existingEdits[updatedRow.source] || {};
    existingEdits[updatedRow.source] = {
      ...previous,
      target: updatedRow.target,
      timestamp: new Date().toISOString(),
    };
    
    // Mirror under internal source name
    try {
      const internalName = getInternalNameForLabel(updatedRow.object, updatedRow.source, propPool, defaultMapModal);
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
    
    // Update rows
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
    try {
      const sourceName = getInternalNameForLabel(updatedRow.object, updatedRow.source, propPool, defaultMapModal);
      const targetLabel = updatedRow.target;
      const newPropertyValue = false; // HubSpot properties are not newly created
      const propertyType = updatedRow.type === "userdefined" ? "userdefined" : "custom"; // Preserve original type
      
      setPendingJson((prev) => ({
        ...prev,
        [updatedRow.object]: {
          ...(prev[updatedRow.object] || {}),
          [sourceName || updatedRow.source]: {
            targetLabel: targetLabel,
            targetName: updatedRow.target,
            sourceLabel: updatedRow.source,
            sourceName: sourceName,
            newProperty: newPropertyValue,
            type: propertyType,
          },
        },
      }));
    } catch (error) {
      console.error('❌ [SAVE_EDITING] Error setting pending JSON:', error);
    }
  };

  const handleEditChange = (field: "target", value: string) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const deleteUserDefined = (index: number) => {
    const targetRow = filteredRows[index];
    const actualRowIndex = rows.findIndex(
      (row) =>
        row.object === targetRow.object &&
        row.source === targetRow.source &&
        row.target === targetRow.target &&
        row.type === targetRow.type
    );
    if (actualRowIndex === -1) return;
    
    const row = rows[actualRowIndex];
    
    if (row.type !== "userdefined" && row.type !== "custom") return;

    console.log('🗑️ [DELETE_START] Starting deletion for:', {
      object: row.object,
      source: row.source,
      target: row.target,
      type: row.type
    });

    // Remove from rows
    setRows((prev) => prev.filter((_, i) => i !== actualRowIndex));

    // Remove from localStorage
    try {
      const storageKey = `customPropertyEdits:${row.object}`;
      const existingEdits = JSON.parse(localStorage.getItem(storageKey) || "{}");
      const sourceName = getInternalNameForLabel(row.object, row.source, propPool, defaultMapModal);

      if (existingEdits[row.source]) delete existingEdits[row.source];
      if (sourceName && existingEdits[sourceName]) delete existingEdits[sourceName];
      localStorage.setItem(storageKey, JSON.stringify(existingEdits));

      // Remove from user-defined properties list
      const udKey = `userDefinedProps:${row.object}`;
      try {
        const prevUD: string[] = JSON.parse(localStorage.getItem(udKey) || "[]");
        const updatedUD = prevUD.filter(prop => prop !== sourceName && prop !== row.source);
        localStorage.setItem(udKey, JSON.stringify(updatedUD));
      } catch { }

      setTimeout(() => window.dispatchEvent(new Event("storage")), 100);
    } catch { }

    // Update pending JSON
    setPendingJson((prev) => {
      const copy = { ...(prev as any) } as typeof prev;
      const objMap = { ...(copy[row.object] || {}) };
      
      const keysToDelete: string[] = [];
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
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => {
        delete objMap[key];
      });
      
      return { ...copy, [row.object]: objMap };
    });

    setHasUnsavedChanges(true);

    // Persist deletion to Supabase
    (async () => {
      try {
        if (!user?.id) return;

        console.log('🗑️ [DELETE] Persisting deletion to Supabase for:', row.source, 'in', row.object);

        const { data: existingRow } = await supabase
          .from("profiles")
          .select("hubspot_crm_a_mapped_json")
          .eq("id", user.id)
          .single();

        const existingJson = (existingRow as any)?.hubspot_crm_a_mapped_json || {};
        const existingChanges = (existingJson?.changes || {}) as Partial<Record<ObjectKey, Record<string, any>>>;

        const updatedChanges = { ...existingChanges };
        if (updatedChanges[row.object]) {
          const objectChanges = { ...updatedChanges[row.object] };
          
          const keysToDelete: string[] = [];
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
              keysToDelete.push(key);
            }
          });
          
          keysToDelete.forEach(key => {
            delete objectChanges[key];
          });
          
          updatedChanges[row.object] = objectChanges;
        }

        const payload = {
          instance: existingJson.instance || "a",
          updatedAt: new Date().toISOString(),
          changes: updatedChanges,
        };

        await supabase
          .from("profiles")
          .update({ hubspot_crm_a_mapped_json: payload })
          .eq("id", user.id);

        console.log('✅ [DELETE] Deletion persisted to Supabase successfully');
        setHasUnsavedChanges(false);

        // Clear caches
        const cacheKey = `customProperties_${row.object}`;
        const udCacheKey = `userDefinedProps:${row.object}`;
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(udCacheKey);

      } catch (error) {
        console.error('❌ [DELETE] Error persisting deletion to Supabase:', error);
      }
    })();
  };

  const onAddSave = async (createdProperty?: PropertyItem) => {
    if (!selectedProperty) return;

    const src = sourceList.find((p) => p.name === selectedProperty);
    let tgt = null;

    if (src) {
      tgt = filteredTargetList.find((p) => p.name === selectedTargetName) ||
            (propPool[addObject] || []).find((p) => p.name === selectedTargetName);
    }

    if (!src || !tgt) {
      console.error('❌ [ADD_PROPERTY] Could not find source or target:', { src, tgt });
      return;
    }

    const isCustomProperty = !!createdProperty;
    const newPropertyValue = isCustomProperty;
    const propertyType = newPropertyValue ? "userdefined" : "custom";

    // Add the row
    setRows((prev) => [
      ...prev,
      { 
        object: addObject, 
        source: src.label,
        target: tgt.label,
        type: propertyType 
      },
    ]);

    console.log('📊 [ADD_TO_TABLE] Adding row to table:', {
      source: src.label,
      target: tgt.label,
      type: propertyType,
      isCustomProperty,
      newPropertyValue
    });

    // Save to localStorage
    const storageKey = `customPropertyEdits:${addObject}`;
    const edits = JSON.parse(localStorage.getItem(storageKey) || "{}");
    edits[src.name] = { target: tgt.label, targetName: tgt.name, ts: Date.now() };
    edits[src.label] = { target: tgt.label, targetName: tgt.name, ts: Date.now() };
    localStorage.setItem(storageKey, JSON.stringify(edits));

    // If this is a userdefined property, also add it to userDefinedProps localStorage
    if (propertyType === "userdefined" && createdProperty) {
      const udKey = `userDefinedProps:${addObject}`;
      try {
        const prevUD: string[] = JSON.parse(localStorage.getItem(udKey) || "[]");
        if (!prevUD.includes(createdProperty.name)) {
          prevUD.push(createdProperty.name);
          localStorage.setItem(udKey, JSON.stringify(prevUD));
          console.log('📊 [ADD_TO_TABLE] Added to userDefinedProps localStorage:', createdProperty.name);
        }
      } catch (error) {
        console.error('❌ [ADD_TO_TABLE] Error updating userDefinedProps localStorage:', error);
      }
    }

    // Reset form state
    setIsAddOpen(false);
    setHasUnsavedChanges(true);

    // Track in pending JSON
    try {
      const actualSourceName = src.name;
      let finalSourceName = actualSourceName;

      if (propertyType === "custom") {
        finalSourceName = /[A-Z\s]/.test(actualSourceName) ? slugify(actualSourceName) : actualSourceName;
      }

      setPendingJson((prev) => ({
        ...prev,
        [addObject]: {
          ...(prev[addObject] || {}),
          [finalSourceName]: {
            targetLabel: tgt.label,
            targetName: tgt.name || tgt.label,
            sourceLabel: src.label,
            sourceName: src.name,
            newProperty: newPropertyValue,
            type: propertyType,
          },
        },
      }));
    } catch (error) {
      console.error('❌ [ADD_PROPERTY] Error setting pending JSON:', error);
    }
  };

  const saveMappings = async () => {
    setIsSaving(true);
    try {
      console.log('💾 [SAVE_MAPPINGS] Starting save process...');

      if (!user?.id) {
        console.error('❌ [SAVE_MAPPINGS] No user ID available');
        return;
      }

      // Load existing JSON from Supabase
      const { data: existingRow, error: fetchError } = await supabase
        .from("profiles")
        .select("hubspot_crm_a_mapped_json")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error('❌ [SAVE_MAPPINGS] Error fetching existing data:', fetchError);
        throw fetchError;
      }

      const existingJson = (existingRow as any)?.hubspot_crm_a_mapped_json || {};
      const existingChanges = (existingJson?.changes || {}) as Partial<Record<ObjectKey, Record<string, any>>>;

      // Create complete mappings from all rows
      const completeMappings: Partial<Record<ObjectKey, Record<string, any>>> = { ...existingChanges };

      rows.forEach((row) => {
        if (!completeMappings[row.object]) {
          completeMappings[row.object] = {};
        }

        // Get internal source name
        let sourceName = row.source;
        try {
          const sourceList = propPool?.[row.object] ?? defaultMapModal[row.object] as PropertyItem[];
          const foundSrc = sourceList?.find((p) => p.label === row.source || p.name === row.source);
          if (foundSrc?.name) {
            sourceName = foundSrc.name;
          }
        } catch (error) {
          console.warn('⚠️ [SAVE_MAPPINGS] Could not find internal name for:', row.source);
        }

        // Determine if this is an existing HubSpot property
        const isExistingHubSpotProperty = (() => {
          const defaultProps = defaultMapModal[row.object as ObjectKey] || [];
          const existsInDefaults = defaultProps.some(prop => prop.name === sourceName);
          return existsInDefaults;
        })();
        
        const newPropertyValue = !isExistingHubSpotProperty;
        const propertyType = newPropertyValue ? "userdefined" : "custom";

        if (completeMappings[row.object as ObjectKey]) {
          const objectMappings = completeMappings[row.object as ObjectKey] as Record<string, any>;
          objectMappings[sourceName] = {
            targetLabel: row.target,
            targetName: row.target,
            sourceLabel: row.source,
            sourceName: sourceName,
            newProperty: newPropertyValue,
            type: propertyType,
            objectType: row.object
          };
        }
      });

      // Create payload
      const payload = {
        instance: existingJson.instance || "a",
        updatedAt: new Date().toISOString(),
        changes: completeMappings,
      };

      console.log('💾 [SAVE_MAPPINGS] Saving complete mappings to Supabase:', payload);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ hubspot_crm_a_mapped_json: payload })
        .eq("id", user.id);

      if (updateError) {
        console.error('❌ [SAVE_MAPPINGS] Error updating Supabase:', updateError);
        throw updateError;
      }

      console.log('✅ [SAVE_MAPPINGS] Successfully saved complete mappings to Supabase');

      // Clear caches (but preserve userDefinedProps)
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('customProperties_') || 
              key.includes('customPropertyEdits:') ||
              key.includes('mappings_preview:')) {
            localStorage.removeItem(key);
          }
        });

        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('customProperties_') || 
              key.includes('customPropertyEdits:') ||
              key.includes('mappings_preview:')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (cacheError) {
        console.warn('⚠️ [CLEAR_CACHE] Error clearing caches:', cacheError);
      }

      setHasUnsavedChanges(false);
      setPendingJson({});

      alert('All mappings saved successfully to Supabase!');

    } catch (error) {
      console.error('❌ [SAVE_MAPPINGS] Save failed:', error);
      alert('Failed to save mappings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--migratio_headings)]">Preview Properties</h2>
        <p className="text-[var(--migratio_text)] mt-2">These are the field mappings you saved in the previous step.</p>
      </div>

      <Button variant="with_arrow" onClick={() => onStepChange(3)}>Back</Button>

      {selectedObjects.size > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">Selected Objects for Migration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-600">
            {Array.from(selectedObjects).map((objectType) => (
              <div key={objectType} className="flex items-center justify-between">
                <span className="capitalize font-medium">{objectType}</span>
                <span className="text-xs bg-blue-200 px-2 py-1 rounded">{getTotalPropertiesCount(objectType, hubspotContactProperties, hubspotCompanyProperties, hubspotDealProperties, hubspotTicketProperties)} properties</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllCustomProperties}
                disabled={isLoadingCustom}
                className="text-sm text-green-600 hover:text-green-800 underline disabled:opacity-50"
              >
                {isLoadingCustom ? "Loading..." : "🔄 Refresh Custom Properties"}
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    console.log('🔍 [DEBUG] Current rows:', rows);
                    console.log('🔍 [DEBUG] Userdefined rows:', rows.filter(r => r.type === 'userdefined'));
                    selectedObjects.forEach(obj => {
                      const udKey = `userDefinedProps:${obj}`;
                      const userDefinedProps = JSON.parse(localStorage.getItem(udKey) || "[]");
                      console.log(`🔍 [DEBUG] userDefinedProps for ${obj}:`, userDefinedProps);
                    });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  🔍 Debug Userdefined
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">💡</span>
            <span className="text-sm text-blue-800">
              <strong>Editing Custom/Userdefined:</strong> You can edit the <strong>Target Label</strong> for custom or userdefined properties.
            </span>
          </div>
        </div>

        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <PropertyTable
          rows={rows}
          filteredRows={filteredRows}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          editingRow={editingRow}
          editForm={editForm}
          onEditChange={handleEditChange}
          onStartEditing={startEditing}
          onSaveEditing={saveEditing}
          onCancelEditing={cancelEditing}
          onDeleteUserDefined={deleteUserDefined}
          selectedObjects={selectedObjects}
          onRowUpdate={(index, updatedRow) => {
            const updatedRows = [...rows];
            updatedRows[index] = updatedRow;
            setRows(updatedRows);
            setHasUnsavedChanges(true);
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
        >
          Add Property
        </Button>
        {hasUnsavedChanges && (
          <Button
            variant="primary"
            onClick={saveMappings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Mappings'}
          </Button>
        )}
      </div>

      {rows.length > 0 && (
        <SummarySection
          filteredRows={filteredRows}
          selectedObjects={selectedObjects}
          canProceed={canProceed}
          hasUnsavedChanges={hasUnsavedChanges}
          onStepChange={onStepChange}
          defaultProperties={{
            contacts: hubspotContactProperties,
            companies: hubspotCompanyProperties,
            deals: hubspotDealProperties,
            tickets: hubspotTicketProperties,
          }}
        />
      )}

      <div className="fixed right-6 bottom-6 z-40">
        <Button variant="primary" onClick={() => {
          try {
            const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            window.scrollTo({ top: height, behavior: "smooth" });
          } catch { }
        }}>Bottom</Button>
      </div>

      <AddPropertyModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={onAddSave}
        addObject={addObject}
        setAddObject={setAddObject}
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
        targetObject={targetObject}
        setTargetObject={setTargetObject}
        selectedTargetName={selectedTargetName}
        setSelectedTargetName={setSelectedTargetName}
        sourceList={sourceList}
        targetList={targetList}
        filteredTargetList={filteredTargetList}
        selectedSource={selectedSource}
        propPool={propPool}
        defaultMapModal={defaultMapModal}
        loadProps={(obj) => loadProps(obj, defaultMapModal, defaultMetaByName)}
        selectedObjects={selectedObjects}
      />
    </div>
  );
}
