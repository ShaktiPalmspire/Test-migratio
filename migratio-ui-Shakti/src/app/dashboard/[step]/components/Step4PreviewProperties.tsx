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

  // Handle adding new property mapping
  const handleAddProperty = async (createdProperty?: PropertyItem) => {
    try {
      // If a custom property was created, we should proceed even if selectedProperty is empty
      if (!selectedProperty && !createdProperty) {
        return;
      }

      // Decide mapping type and labels
      // Default to custom when mapping to an existing property (no checkbox)
      let propertyType: "custom" | "default" | "userdefined" = "custom";
      let targetName = selectedTargetName || selectedProperty;
      let sourceName = selectedProperty;
      let targetLabel = selectedTargetName;

      if (createdProperty) {
        propertyType = "userdefined"; // Newly created properties should be userdefined
        targetName = createdProperty.name;
        targetLabel = createdProperty.label;
        sourceName = selectedProperty || createdProperty.label; // Use selectedProperty if available, otherwise use label
        // Check if this is a custom property by looking at the propPool
        const isCustomProperty =
          propPool[addObject]?.some((p) => p.name === selectedTargetName) ||
          false;

        // Additional check: if selectedTargetName is not empty and doesn't match any existing property,
        // it might be a newly created custom property
        const isNewCustomProperty =
          selectedTargetName &&
          !propPool[addObject]?.some((p) => p.name === selectedTargetName);

        // Check if this is a user-defined property by looking at localStorage
        const udKey = `userDefinedProps:${addObject}`;
        const userDefinedProps = JSON.parse(
          localStorage.getItem(udKey) || "[]"
        );
        const isUserDefined = userDefinedProps.includes(selectedTargetName);

        // Determine the type based on various checks
        if (isUserDefined) {
          propertyType = "userdefined";
        } else if (isCustomProperty || isNewCustomProperty) {
          propertyType = "custom";
        } else if (selectedTargetName && selectedProperty) {
          // If we have both source and target selected, this is likely a user-defined mapping
          propertyType = "userdefined";
        }

        // Get target label from propPool or defaultMapModal
        const targetProperty =
          propPool[addObject]?.find((p) => p.name === selectedTargetName) ||
          defaultMapModal[addObject]?.find(
            (p) => p.name === selectedTargetName
          );
        targetLabel = targetProperty?.label || selectedTargetName;
      } else {
        // Mapping to an existing property via dropdown (no checkbox)
        // Treat as custom mapping and pull proper target label
        const targetProperty =
          propPool[addObject]?.find((p) => p.name === targetName) ||
          defaultMapModal[addObject]?.find((p) => p.name === targetName);
        targetLabel = targetProperty?.label || targetName;
        propertyType = "custom";
      }

      // Create the new row
      const newRow: PreviewRow = {
        object: addObject,
        source: selectedSource?.label || sourceName,
        target: targetName,
        type: propertyType,
      };

      // Add to rows
      setRows((prevRows) => {
        const newRows = [...prevRows, newRow];
        return newRows;
      });
      setHasUnsavedChanges(true);

      // Save mapping to database
      try {
        const mappingData = {
          [addObject]: {
            [targetName]: {
              targetLabel: targetLabel,
              targetName: targetName,
              sourceLabel: selectedSource?.label || sourceName,
              sourceName: selectedSource?.label || sourceName,
              newProperty: propertyType === "userdefined", // only true when created via checkbox
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

      // Reset form
      setSelectedProperty("");
      setSelectedTargetName("");

      // Close modal
      setIsAddOpen(false);
    } catch (error) {
      console.error(
        "❌ [PARENT_ADD_PROPERTY] Error in handleAddProperty:",
        error
      );
      // Even if there's an error, try to close the modal
      setIsAddOpen(false);
    }
  };

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

  // Debug addObject state
  useEffect(() => {}, [selectedObjects, addObject]);

  // Update addObject when selectedObjects changes (only if addObject is not in selectedObjects AND modal is not open)
  useEffect(() => {
    if (selectedObjects.size > 0 && !isAddOpen) {
      const sortedObjects = Array.from(selectedObjects).sort((a, b) => {
        const order = { contacts: 0, companies: 1, deals: 2, tickets: 3 };
        return order[a] - order[b];
      });
      const firstObject = sortedObjects[0] as ObjectKey;
      // Only update if current addObject is not in selectedObjects
      if (firstObject && !selectedObjects.has(addObject)) {
        setAddObject(firstObject);
        setTargetObject(firstObject);
      }
    }
  }, [selectedObjects, addObject, isAddOpen]);

  // Scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      // Check if we're at the bottom
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

  // Load mappings on mount
  useEffect(() => {
    // Clear all caches to ensure fresh data
    selectedObjects.forEach((obj) => {
      const customCacheKey = `customProperties_${obj}`;
      const udCacheKey = `userDefinedProps:${obj}`;
      localStorage.removeItem(customCacheKey);
      localStorage.removeItem(udCacheKey);
    });

    loadMappings();
  }, [selectedObjects]);

  // Listen for property deletion events
  useEffect(() => {
    const handlePropertyDeleted = (event: CustomEvent) => {
      // Clear all caches and reload mappings
      clearAllCaches();
      loadMappings();
    };

    const handlePropertyEdited = (event: CustomEvent) => {
      // Clear all caches and reload mappings
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

  // Reload mappings when profile changes (but not when we just added a property)
  useEffect(() => {
    // Only reload if we have existing rows and profile changed
    if (rows.length > 0 && profile) {
      loadMappings();
    }
  }, [profile]);

  // Load custom properties
  useEffect(() => {
    console.log(
      "🔄 [STEP4] fetchAllCustomProperties called for selectedObjects:",
      Array.from(selectedObjects)
    );
    fetchAllCustomProperties();
  }, [selectedObjects]);

  // Integrate custom properties into rows
  useEffect(() => {
    if (customProperties && Object.keys(customProperties).length > 0) {
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

      // Merge custom properties with existing rows
      if (customRows.length > 0) {
        setRows((prevRows) => {
          // Keep existing custom rows from database and add new HubSpot custom properties
          // Only add HubSpot custom properties that don't already exist
          const existingCustomSources = new Set(
            prevRows
              .filter((row) => row.type === "custom")
              .map((row) => row.source)
          );
          const newHubSpotCustomRows = customRows.filter(
            (row) => !existingCustomSources.has(row.source)
          );

          const finalRows = [...prevRows, ...newHubSpotCustomRows];
          return finalRows;
        });
      }
    }
  }, [customProperties, selectedObjects]);

  // Get source and target lists for AddPropertyModal
  const sourceList = useMemo(() => {
    // Always use defaultMapModal as fallback, even if propPool is empty
    const list = propPool[addObject] || defaultMapModal[addObject] || [];

    // If still empty, provide some basic fallback properties
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

    // Find the selected source property to get its type and fieldType
    const selectedSourceProp = sourceList.find(
      (p) => p.name === selectedProperty
    );
    if (!selectedSourceProp) return targetList;

    // Filter target properties by matching type and fieldType
    return targetList.filter(
      (targetProp) =>
        targetProp.type === selectedSourceProp.type &&
        targetProp.fieldType === selectedSourceProp.fieldType
    );
  }, [targetList, selectedProperty, sourceList]);

  const selectedSource = useMemo(() => {
    return sourceList.find((p) => p.name === selectedProperty);
  }, [sourceList, selectedProperty]);

  // Load property pools
  useEffect(() => {
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
  }, [selectedObjects, loadedLists, defaultMapModal, defaultMetaByName]);

  // Load properties when modal opens or addObject changes
  useEffect(() => {
    if (isAddOpen && addObject && !loadedLists[addObject]) {
      loadProps(addObject, defaultMapModal, defaultMetaByName);
    }
  }, [isAddOpen, addObject, loadedLists, defaultMapModal, defaultMetaByName]);

  // Ensure addObject is valid when modal opens
  useEffect(() => {
    if (isAddOpen && selectedObjects.size > 0) {
      // If current addObject is not in selectedObjects, set it to the first available
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

  const clearAllCaches = useCallback(() => {
    selectedObjects.forEach((obj) => {
      const customCacheKey = `customProperties_${obj}`;
      const udCacheKey = `userDefinedProps:${obj}`;
      const schemaCacheKey = `schema:${obj}:labels:`;
      const fetchedCacheKey = `fetchedInSessionObjects`;

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
  }, [selectedObjects]);

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
                  // Clear all caches
                  clearAllCaches();
                  // Reload mappings
                  loadMappings();
                }}
                disabled={isSaving}
              >
                Refresh
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  // Force reload from database
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

      {/* Single scroll toggle button - always visible */}
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
