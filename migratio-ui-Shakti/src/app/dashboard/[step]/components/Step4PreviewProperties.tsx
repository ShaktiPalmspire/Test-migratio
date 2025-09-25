"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Button from "@/components/Buttons/button";
import { StepIndex } from "../types/dashboard";
import { useUser } from "@/context/UserContext";
import AdvancedModal from "@/components/AdvancedModal";
import { supabase } from "@/lib/supabaseClient";
import {
  hubspotContactProperties,
  hubspotCompanyProperties,
  hubspotDealProperties,
  hubspotTicketProperties,
} from "@/context/hubspotdefaultproperties";
import { ensureValidToken } from "@/utils/cacheUtils";

// Import modular components and utilities
import {
  ObjectKey,
  PreviewRow,
  PropertyItem,
  PendingJsonState,
  EditFormState,
  CreateFormState,
} from "./types/propertyTypes";
import {
  slugify,
  getDisplayText,
  getPropertyLabel,
  getInternalNameForLabel,
  fixCorruptedProperties,
  norm,
  getTotalPropertiesCount,
} from "./utils/propertyUtils";
import { useCustomProperties, usePropertyPool } from "./hooks/usePropertyHooks";
import {
  PropertyTable,
  SearchBar,
  SummarySection,
} from "./components/PropertyTableComponents";
import { AddPropertyModal } from "./components/AddPropertyModal";
import { usePropertyMappings } from "./hooks/usePropertyMappings";
import { usePropertyEditing } from "./hooks/usePropertyEditing";
import { usePropertySaving } from "./hooks/usePropertySaving";

interface Step4PreviewPropertiesProps {
  onStepChange: (step: StepIndex) => void;
  selectedObjects: Set<ObjectKey>;
}

export function Step4PreviewProperties({
  onStepChange,
  selectedObjects,
}: Step4PreviewPropertiesProps) {
  const { user, profile, upsertMappedJson } = useUser();
  
  // Get unique identifier for HubSpot instance - use user ID as it's always available
  const hubspotInstanceIdentifier = useMemo(() => {
    // Use user ID as the primary identifier for data separation
    // If you need to support multiple HubSpot accounts per user, you'll need to store this differently
    return user?.id || 'default';
  }, [user]);

  const { customProperties, isLoadingCustom, fetchAllCustomProperties } =
    useCustomProperties(selectedObjects);
  const { propPool, loadedLists, loadProps, setPropPool } = usePropertyPool();

  // Check if user is admin
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
    return adminEmails.includes(user.email);
  }, [user?.email]);

  // Property mapping logic
  const {
    rows,
    setRows,
    pendingJson,
    setPendingJson,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    loadMappings,
  } = usePropertyMappings(selectedObjects, profile);

  // Property editing logic
  const {
    editingRow,
    editForm,
    startEditing,
    cancelEditing,
    saveEditing,
    handleEditChange,
    deleteUserDefined,
    reverseCustomProperty,
  } = usePropertyEditing(
    rows,
    setRows,
    setHasUnsavedChanges,
    setPendingJson,
    propPool
  );

  // Property saving logic
  const { isSaving, saveMappings, handleSaveAndProceed } = usePropertySaving(
    pendingJson,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    onStepChange
  );

  // Search functionality
  const [searchQuery, setSearchQuery] = useState<string>("");
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.source, r.target, r.object, r.type]
        .map(String)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  const canProceed = !isLoadingCustom && rows.length > 0;

  // Label map for property lookups
  const labelMap = useMemo(() => {
    const createMap = (arr: any[]) =>
      Object.fromEntries(arr.map((p) => [p.name, p.label || p.name]));
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
      contacts: hubspotContactProperties.map((p) => ({
        name: p.name,
        label: p.label || p.name,
        type: p.type,
        fieldType: p.fieldType,
      })),
      companies: hubspotCompanyProperties.map((p) => ({
        name: p.name,
        label: p.label || p.name,
        type: p.type,
        fieldType: p.fieldType,
      })),
      deals: hubspotDealProperties.map((p) => ({
        name: p.name,
        label: p.label || p.name,
        type: p.type,
        fieldType: p.fieldType,
      })),
      tickets: hubspotTicketProperties.map((p) => ({
        name: p.name,
        label: p.label || p.name,
        type: p.type,
        fieldType: p.fieldType,
      })),
    }),
    []
  );

  const defaultMetaByName = useMemo(() => {
    const build = (arr: PropertyItem[]) => {
      const m: Record<string, { type?: string; fieldType?: string }> = {};
      arr.forEach(
        (p) => (m[p.name] = { type: p.type, fieldType: p.fieldType })
      );
      return m;
    };
    return {
      contacts: build(defaultMapModal.contacts),
      companies: build(defaultMapModal.companies),
      deals: build(defaultMapModal.deals),
      tickets: build(defaultMapModal.tickets),
    };
  }, [defaultMapModal]);

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addObject, setAddObject] = useState<ObjectKey>(() => {
    if (selectedObjects.size > 0) {
      const sortedObjects = Array.from(selectedObjects).sort((a, b) => {
        const order = { contacts: 0, companies: 1, deals: 2, tickets: 3 };
        return order[a] - order[b];
      });
      return sortedObjects[0] as ObjectKey;
    }
    return "contacts";
  });
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [targetObject, setTargetObject] = useState<ObjectKey>(() => {
    if (selectedObjects.size > 0) {
      const sortedObjects = Array.from(selectedObjects).sort((a, b) => {
        const order = { contacts: 0, companies: 1, deals: 2, tickets: 3 };
        return order[a] - order[b];
      });
      return sortedObjects[0] as ObjectKey;
    }
    return "contacts";
  });
  const [selectedTargetName, setSelectedTargetName] = useState<string>("");
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Handle adding new property mapping
  const handleAddProperty = async (createdProperty?: PropertyItem) => {
    try {
      if (!selectedProperty && !createdProperty) {
        return;
      }

      let propertyType: "custom" | "default" | "userdefined" = "custom";
      let targetName = selectedTargetName || selectedProperty;
      let sourceName = selectedProperty;
      let targetLabel = selectedTargetName;

      if (createdProperty) {
        propertyType = "userdefined";
        targetName = createdProperty.name;
        targetLabel = createdProperty.label;
        sourceName = selectedProperty || createdProperty.label;
        
        const isCustomProperty =
          propPool[addObject]?.some((p) => p.name === selectedTargetName) ||
          false;

        const isNewCustomProperty =
          selectedTargetName &&
          !propPool[addObject]?.some((p) => p.name === selectedTargetName);

        // Use the hubspotInstanceIdentifier instead of hubspotInstance
        const udKey = `userDefinedProps:${addObject}:${hubspotInstanceIdentifier}`;
        const userDefinedProps = JSON.parse(
          localStorage.getItem(udKey) || "[]"
        );
        const isUserDefined = userDefinedProps.includes(selectedTargetName);

        if (isUserDefined) {
          propertyType = "userdefined";
        } else if (isCustomProperty || isNewCustomProperty) {
          propertyType = "custom";
        } else if (selectedTargetName && selectedProperty) {
          propertyType = "userdefined";
        }

        const targetProperty =
          propPool[addObject]?.find((p) => p.name === selectedTargetName) ||
          defaultMapModal[addObject]?.find(
            (p) => p.name === selectedTargetName
          );
        targetLabel = targetProperty?.label || selectedTargetName;
      } else {
        const targetProperty =
          propPool[addObject]?.find((p) => p.name === targetName) ||
          defaultMapModal[addObject]?.find((p) => p.name === targetName);
        targetLabel = targetProperty?.label || targetName;
        propertyType = "custom";
      }

      const isDuplicate = rows.some(
        (r) =>
          r.object === addObject &&
          r.source === (selectedSource?.label || sourceName) &&
          r.target === targetName
      );

      if (isDuplicate || (selectedSource?.label || sourceName) === targetName) {
        console.warn("⚠️ Skipping duplicate/self-mapping:", targetName);
        setIsAddOpen(false);
        return;
      }

      const newRow: PreviewRow = {
        object: addObject,
        source: selectedSource?.label || sourceName,
        target: targetName,
        type: propertyType,
      };

      setRows((prevRows) => {
        const newRows = [...prevRows, newRow];
        return newRows;
      });
      setHasUnsavedChanges(true);

      try {
        const mappingData = {
          [addObject]: {
            [targetName]: {
              targetLabel: targetLabel,
              targetName: targetName,
              sourceLabel: selectedSource?.label || sourceName,
              sourceName: selectedSource?.label || sourceName,
              newProperty: propertyType === "userdefined",
              type: propertyType,
              objectType: addObject,
            },
          },
        };

        await upsertMappedJson(mappingData);
        try {
          window.dispatchEvent(new Event("mappings-updated"));
        } catch {}
      } catch (error) {
        console.error("❌ [DATABASE_SAVE] Error saving mapping:", error);
      }

      setSelectedProperty("");
      setSelectedTargetName("");
      setIsAddOpen(false);
    } catch (error) {
      console.error(
        "❌ [PARENT_ADD_PROPERTY] Error in handleAddProperty:",
        error
      );
      setIsAddOpen(false);
    }
  };

  // Scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      const isBottom =
        window.scrollY + window.innerHeight >= document.body.scrollHeight - 10;
      setIsAtBottom(isBottom);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const toggleScroll = () => {
    if (isAtBottom) {
      scrollToTop();
    } else {
      scrollToBottom();
    }
  };

  // Clear pendingJson when component mounts to start fresh
  useEffect(() => {
    setPendingJson({});
  }, []);

  // 🔥 FIX: Use hubspotInstanceIdentifier for data separation
useEffect(() => {
  if (hubspotInstanceIdentifier) {
    console.log("🔄 [STEP4] User changed, clearing caches and reloading...");
    clearAllCaches();
    loadMappings();
  }
}, [hubspotInstanceIdentifier]);

  // Load mappings on mount
  useEffect(() => {
    clearAllCaches();
    loadMappings();
  }, [selectedObjects]);

  // Listen for property deletion events
  useEffect(() => {
    const handlePropertyDeleted = (event: CustomEvent) => {
      clearAllCaches();
      loadMappings();
    };

    const handlePropertyEdited = (event: CustomEvent) => {
      clearAllCaches();
      loadMappings();
    };

    window.addEventListener(
      "propertyDeleted",
      handlePropertyDeleted as EventListener
    );
    window.addEventListener(
      "propertyEdited",
      handlePropertyEdited as EventListener
    );
    return () => {
      window.removeEventListener(
        "propertyDeleted",
        handlePropertyDeleted as EventListener
      );
      window.removeEventListener(
        "propertyEdited",
        handlePropertyEdited as EventListener
      );
    };
  }, [selectedObjects, loadMappings]);

  // Reload mappings when profile changes
  useEffect(() => {
    if (rows.length > 0 && profile) {
      loadMappings();
    }
  }, [profile]);

  // Load custom properties with user scoping
useEffect(() => {
  if (hubspotInstanceIdentifier) {
    console.log("🔄 [STEP4] Skipping fetchAllCustomProperties (CRM A blocked)");
  }
}, [selectedObjects, hubspotInstanceIdentifier]);

  // Integrate custom properties into rows with proper scoping
  useEffect(() => {
    if (customProperties && Object.keys(customProperties).length > 0 && hubspotInstanceIdentifier) {
      console.log("🔄 [STEP4] Custom properties found:", customProperties);
      const customRows: PreviewRow[] = [];

      Object.entries(customProperties).forEach(([objectType, properties]) => {
        console.log(
          `🔄 [STEP4] Processing ${objectType}:`,
          properties.length,
          "properties"
        );

        if (
          selectedObjects.has(objectType as ObjectKey) &&
          Array.isArray(properties) &&
          properties.length > 0
        ) {
          properties.forEach((prop: any) => {
            customRows.push({
              object: objectType as ObjectKey,
              source: prop.label || prop.name,
              target: prop.label || prop.name,
              type: "custom",
            });
          });
        }
      });

      console.log("🔄 [STEP4] Total custom rows created:", customRows.length);

      if (customRows.length > 0) {
        setRows((prevRows) => {
          const existingCustomSources = new Set(
            prevRows
              .filter((row) => row.type === "custom")
              .map((row) => row.source)
          );
          
          const newHubSpotCustomRows = customRows.filter(
            (row) =>
              !existingCustomSources.has(row.source) &&
              row.source !== row.target
          );

          const finalRows = [...prevRows, ...newHubSpotCustomRows];
          console.log("🔄 [STEP4] Final rows count:", finalRows.length);
          return finalRows;
        });
      }
    }
  }, [customProperties, selectedObjects, hubspotInstanceIdentifier]);

  // Get source and target lists for AddPropertyModal
  const sourceList = useMemo(() => {
    const list = propPool[addObject] || defaultMapModal[addObject] || [];

    if (list.length === 0) {
      const fallbackProps = [
        { name: "name", label: "Name", type: "string", fieldType: "text" },
        { name: "email", label: "Email", type: "string", fieldType: "text" },
        { name: "phone", label: "Phone", type: "string", fieldType: "text" },
        {
          name: "createdate",
          label: "Create Date",
          type: "datetime",
          fieldType: "date",
        },
      ];
      return fallbackProps;
    }

    return Array.isArray(list) ? list : [];
  }, [propPool, defaultMapModal, addObject]);

  const targetList = useMemo(() => {
    const list = propPool[targetObject] || defaultMapModal[targetObject] || [];
    return Array.isArray(list) ? list : [];
  }, [propPool, defaultMapModal, targetObject]);

  const filteredTargetList = useMemo(() => {
    if (!selectedProperty) return targetList;

    const selectedSourceProp = sourceList.find(
      (p) => p.name === selectedProperty
    );
    if (!selectedSourceProp) return targetList;

    return targetList.filter(
      (targetProp) =>
        targetProp.type === selectedSourceProp.type &&
        targetProp.fieldType === selectedSourceProp.fieldType
    );
  }, [targetList, selectedProperty, sourceList]);

  const selectedSource = useMemo(() => {
    return sourceList.find((p) => p.name === selectedProperty);
  }, [sourceList, selectedProperty]);

  // Load property pools with user scoping
  useEffect(() => {
    if (hubspotInstanceIdentifier) {
      Array.from(selectedObjects)
        .sort((a, b) => {
          const order = { contacts: 0, companies: 1, deals: 2, tickets: 3 };
          return order[a] - order[b];
        })
        .forEach((obj) => {
          if (!loadedLists[obj]) {
            loadProps(obj, defaultMapModal, defaultMetaByName);
          }
        });
    }
  }, [selectedObjects, loadedLists, defaultMapModal, defaultMetaByName, hubspotInstanceIdentifier]);

  // Load properties when modal opens or addObject changes
  useEffect(() => {
    if (isAddOpen && addObject && !loadedLists[addObject] && hubspotInstanceIdentifier) {
      loadProps(addObject, defaultMapModal, defaultMetaByName);
    }
  }, [isAddOpen, addObject, loadedLists, defaultMapModal, defaultMetaByName, hubspotInstanceIdentifier]);

  // Ensure addObject is valid when modal opens
  useEffect(() => {
    if (isAddOpen && selectedObjects.size > 0) {
      if (!selectedObjects.has(addObject)) {
        const sortedObjects = Array.from(selectedObjects).sort((a, b) => {
          const order = { contacts: 0, companies: 1, deals: 2, tickets: 3 };
          return order[a] - order[b];
        });
        const firstObject = sortedObjects[0] as ObjectKey;
        setAddObject(firstObject);
        setTargetObject(firstObject);
      }
    }
  }, [isAddOpen, selectedObjects, addObject]);

  // 🔥 FIX: Updated clearAllCaches to use hubspotInstanceIdentifier
  const clearAllCaches = useCallback(() => {
    if (!hubspotInstanceIdentifier) return;
    
    selectedObjects.forEach((obj) => {
      // Use hubspotInstanceIdentifier for cache keys
      const customCacheKey = `customProperties_${obj}_${hubspotInstanceIdentifier}`;
      const udCacheKey = `userDefinedProps:${obj}:${hubspotInstanceIdentifier}`;
      const schemaCacheKey = `schema:${obj}:labels:${hubspotInstanceIdentifier}`;
      const fetchedCacheKey = `fetchedInSessionObjects:${hubspotInstanceIdentifier}`;

      // Clear localStorage
      localStorage.removeItem(customCacheKey);
      localStorage.removeItem(udCacheKey);

      // Clear sessionStorage
      sessionStorage.removeItem(customCacheKey);
      sessionStorage.removeItem(udCacheKey);

      // Clear all schema-related caches
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(schemaCacheKey)) {
          localStorage.removeItem(key);
        }
      });

      // Clear fetched objects cache
      sessionStorage.removeItem(fetchedCacheKey);
    });

    // Clear generic caches without identifier (legacy)
    selectedObjects.forEach((obj) => {
      const legacyKeys = [
        `customProperties_${obj}`,
        `userDefinedProps:${obj}`,
        `schema:${obj}:labels:`
      ];
      legacyKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    });

    console.log("🧹 [CACHE] All caches cleared for:", hubspotInstanceIdentifier);
  }, [selectedObjects, hubspotInstanceIdentifier]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Step 4: Preview & Configure Properties
        </h2>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  clearAllCaches();
                  loadMappings();
                }}
                disabled={isSaving}
              >
                Refresh
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  clearAllCaches();
                  loadMappings();
                }}
                disabled={isSaving}
              >
                Debug & Reload
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() => onStepChange(3)}
            disabled={isSaving}
          >
            Back
          </Button>
          <Button
            onClick={handleSaveAndProceed}
            disabled={!canProceed || isSaving}
          >
            {isSaving ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>

      {/* Debug info */}
      {isAdmin && (
        <div className="bg-gray-100 p-3 rounded text-sm">
          <div>User ID: {user?.id}</div>
          <div>Instance Identifier: {hubspotInstanceIdentifier}</div>
          <div>Rows: {rows.length}</div>
          <div>Custom Properties: {Object.keys(customProperties || {}).length}</div>
        </div>
      )}

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <PropertyTable
        rows={rows}
        filteredRows={filteredRows}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        editingRow={editingRow}
        editForm={editForm}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        onSaveEditing={saveEditing}
        onEditChange={handleEditChange}
        onDeleteUserDefined={deleteUserDefined}
        onReverseCustomProperty={reverseCustomProperty}
        selectedObjects={selectedObjects}
        onAddProperty={() => setIsAddOpen(true)}
        onRowUpdate={(index, updatedRow) => {
          const updatedRows = [...rows];
          updatedRows[index] = updatedRow;
          setRows(updatedRows);
          setHasUnsavedChanges(true);
        }}
        setRows={setRows}
        setHasUnsavedChanges={setHasUnsavedChanges}
        setPendingJson={setPendingJson}
        propPool={propPool as Record<ObjectKey, PropertyItem[]>}
        defaultMapModal={defaultMapModal}
      />

      <SummarySection
        filteredRows={rows}
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

      <AddPropertyModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
        }}
        onSave={handleAddProperty}
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
        loadProps={(obj: ObjectKey) =>
          loadProps(obj, defaultMapModal, defaultMetaByName)
        }
        selectedObjects={selectedObjects}
        setPropPool={setPropPool}
      />

      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow-lg">
          ⚠️ You have unsaved changes
        </div>
      )}

      <button
        onClick={toggleScroll}
        className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        title={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
      >
        {isAtBottom ? "▲" : "▼"}
      </button>
    </div>
  );
}