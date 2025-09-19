import React, { useState, useEffect, useRef } from "react";
import {
  ObjectKey,
  PropertyItem,
  CreateFormState,
  CreateStatus,
} from "../types/propertyTypes";
import {
  slugify,
  validateInternalName,
  ensureUniqueName,
} from "../utils/propertyUtils";
import { useUser } from "@/context/UserContext";
import { ensureValidToken } from "@/utils/cacheUtils";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (createdProperty?: PropertyItem) => Promise<void>; // Modified to be async
  addObject: ObjectKey;
  setAddObject: (obj: ObjectKey) => void;
  selectedProperty: string;
  setSelectedProperty: (prop: string) => void;
  targetObject: ObjectKey;
  setTargetObject: (obj: ObjectKey) => void;
  selectedTargetName: string;
  setSelectedTargetName: (name: string) => void;
  sourceList: PropertyItem[];
  targetList: PropertyItem[];
  filteredTargetList: PropertyItem[];
  selectedSource: PropertyItem | undefined;
  propPool: Record<ObjectKey, PropertyItem[] | null>;
  defaultMapModal: Record<ObjectKey, PropertyItem[]>;
  loadProps: (obj: ObjectKey) => void;
  selectedObjects: Set<ObjectKey>;
  setPropPool?: (pool: Record<ObjectKey, PropertyItem[] | null>) => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  addObject,
  setAddObject,
  selectedProperty,
  setSelectedProperty,
  targetObject,
  setTargetObject,
  selectedTargetName,
  setSelectedTargetName,
  sourceList,
  targetList,
  filteredTargetList,
  selectedSource,
  propPool,
  defaultMapModal,
  loadProps,
  selectedObjects,
  setPropPool,
}) => {
  const [createChecked, setCreateChecked] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    label: "",
    name: "",
  });
  const [createStatus, setCreateStatus] = useState<CreateStatus>("idle");
  const [createError, setCreateError] = useState<string>("");
  const [isInternalNameEditable, setIsInternalNameEditable] = useState(false);
  const [nameValidationError, setNameValidationError] = useState("");
  const [selectedGroup, setSelectedGroup] =
    useState<string>("custom_properties");
  const { user, profile } = useUser();

  useEffect(() => {
    if (!createChecked) return;

    const base = slugify(createForm.label || "new_property");
    const uniqueName = ensureUniqueName(
      base,
      targetObject,
      propPool,
      defaultMapModal
    );

    if (!isInternalNameEditable) {
      setCreateForm((f) => ({ ...f, name: uniqueName }));
      setNameValidationError(
        validateInternalName(
          uniqueName,
          targetObject,
          propPool,
          defaultMapModal
        )
      );
    }
  }, [
    createForm.label,
    createChecked,
    targetObject,
    propPool,
    defaultMapModal,
    isInternalNameEditable,
  ]);

  // Auto-select group based on object type
  useEffect(() => {
    if (createChecked) {
      const groupMap: Record<ObjectKey, string> = {
        contacts: "contactinformation",
        companies: "companyinformation",
        deals: "dealinformation",
        tickets: "ticketinformation",
      };
      setSelectedGroup(groupMap[addObject] || "custom_properties");
    }
  }, [createChecked, addObject]);

  useEffect(() => {
    setCreateStatus("idle");
    setCreateError("");
  }, [createChecked, selectedSource, createForm.label, targetObject, isOpen]);

  const createTargetPropertyIfNeeded =
    async (): Promise<PropertyItem | null> => {
      if (!createChecked) return null;
      const label = createForm.label.trim();
      // Force use of slugified version and ensure uniqueness
      const baseName = slugify(label || "new_property");
      const name = ensureUniqueName(
        baseName,
        addObject,
        propPool,
        defaultMapModal
      );
      if (!label || !name || !selectedSource) return null;

      // Debug custom property creation
      console.log("🏗️ [CREATE_PROPERTY] Creating custom property:");
      console.log("🏗️ [CREATE_PROPERTY] Label:", label);
      console.log("🏗️ [CREATE_PROPERTY] Base name from slugify:", baseName);
      console.log("🏗️ [CREATE_PROPERTY] Final unique name:", name);
      console.log(
        "🏗️ [CREATE_PROPERTY] createForm.name (ignored):",
        createForm.name
      );
      console.log("🏗️ [CREATE_PROPERTY] addObject:", addObject);
      console.log("🏗️ [CREATE_PROPERTY] user?.id:", user?.id);
      console.log("🏗️ [CREATE_PROPERTY] profile:", profile);

      const srcType = selectedSource.type || "string";
      const srcFieldType = selectedSource.fieldType || "text";
      const newProp: PropertyItem = {
        name,
        label,
        type: srcType,
        fieldType: srcFieldType,
      };

      console.log("🏗️ [CREATE_PROPERTY] Final newProp object:", newProp);

      // Create property in HubSpot via API
      try {
        console.log(
          "🏗️ [CREATE_PROPERTY] Creating property in HubSpot via API..."
        );
        setCreateStatus("creating");

        if (!user?.id || !profile) {
          throw new Error("User or profile not available");
        }

        // Check if user has HubSpot access token
        if (!profile.hubspot_access_token_a) {
          throw new Error(
            "No HubSpot access token found. Please reconnect your HubSpot account."
          );
        }

        // Ensure valid token
        await ensureValidToken(profile, user.id, "a");

        // Validate property name for deals (HubSpot has stricter requirements for deal properties)
        if (addObject === "deals") {
          // Deal property names must be lowercase and can't contain certain characters
          const dealNameValidation = /^[a-z][a-z0-9_]*$/.test(newProp.name);
          if (!dealNameValidation) {
            throw new Error(
              "Deal property names must start with a letter and contain only lowercase letters, numbers, and underscores."
            );
          }

          // Deal property names must be unique and not conflict with existing HubSpot deal properties
          if (newProp.name.length > 50) {
            throw new Error(
              "Deal property names must be 50 characters or less."
            );
          }
        }

        // Log the property details for debugging
        console.log("🏗️ [CREATE_PROPERTY] Property details:", {
          name: newProp.name,
          label: newProp.label,
          type: newProp.type,
          fieldType: newProp.fieldType,
          groupName: selectedGroup,
          objectType: addObject,
        });

        const response = await fetch(`/api/hubspot/schema/${addObject}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers
            "X-User-ID": user.id,
            ...(profile?.hubspot_portal_id_a && {
              "X-Portal-ID": profile.hubspot_portal_id_a.toString(),
            }),
            ...(profile?.hubspot_access_token_a && {
              Authorization: `Bearer ${profile.hubspot_access_token_a}`,
            }),
          },
          body: JSON.stringify({
            name: newProp.name,
            label: newProp.label,
            type: newProp.type,
            fieldType: newProp.fieldType,
            description: `Custom property created via Migratio UI`,
            userId: user.id,
            instance: "a",
            groupName: selectedGroup, // Use selected group
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [CREATE_PROPERTY] HubSpot API error:", errorText);

          // Try to parse as JSON for better error messages
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(
              errorData.error ||
                errorData.message ||
                `HTTP ${response.status}: ${errorText}`
            );
          } catch (parseError) {
            // If not JSON, use the raw text
            throw new Error(
              `Failed to create property in HubSpot (HTTP ${
                response.status
              }): ${errorText.substring(0, 100)}`
            );
          }
        }

        const result = await response.json();
        console.log("✅ [CREATE_PROPERTY] HubSpot API response:", result);

        if (!result.ok) {
          throw new Error(
            result.error || "Failed to create property in HubSpot"
          );
        }

        console.log(
          "✅ [CREATE_PROPERTY] Property successfully created in HubSpot"
        );
      } catch (error) {
        console.error(
          "❌ [CREATE_PROPERTY] Error creating property in HubSpot:",
          error
        );
        setCreateError(
          error instanceof Error
            ? error.message
            : "Failed to create property in HubSpot"
        );
        setCreateStatus("error");
        return null;
      }

      // persist in prop pool for this object
      const existingList = (propPool[addObject] ??
        defaultMapModal[addObject]) as PropertyItem[];
      const updatedList = existingList.some((p) => p.name === newProp.name)
        ? existingList
        : [...existingList, newProp];

      console.log("🏗️ [CREATE_PROPERTY] Adding to propPool:");
      console.log("🏗️ [CREATE_PROPERTY] newProp before adding:", newProp);
      console.log(
        "🏗️ [CREATE_PROPERTY] newProp.name should be internal name:",
        newProp.name
      );
      console.log(
        "🏗️ [CREATE_PROPERTY] newProp.label should be display label:",
        newProp.label
      );
      console.log(
        "🏗️ [CREATE_PROPERTY] existingList length:",
        existingList.length
      );
      console.log(
        "🏗️ [CREATE_PROPERTY] updatedList length:",
        updatedList.length
      );
      console.log(
        "🏗️ [CREATE_PROPERTY] Last item in updatedList:",
        updatedList[updatedList.length - 1]
      );

      // Update the propPool in the parent component
      if (setPropPool) {
        const updatedPropPool = { ...propPool, [addObject]: updatedList };
        setPropPool(updatedPropPool);
        console.log("🏗️ [CREATE_PROPERTY] Updated propPool in parent");
      }

      // mark as user-defined (persist)
      const udKey = `userDefinedProps:${addObject}`;
      try {
        const prevUD: string[] = JSON.parse(
          localStorage.getItem(udKey) || "[]"
        );
        if (!prevUD.includes(newProp.name)) {
          prevUD.push(newProp.name);
          localStorage.setItem(udKey, JSON.stringify(prevUD));
          console.log(
            "🏗️ [CREATE_PROPERTY] Added to userDefinedProps localStorage:",
            newProp.name
          );
          console.log(
            "🏗️ [CREATE_PROPERTY] Updated userDefinedProps list:",
            prevUD
          );
        }
      } catch (error) {
        console.error(
          "❌ [CREATE_PROPERTY] Error updating localStorage:",
          error
        );
      }

      // also merge into cached custom list to appear on reload
      const cacheKey = `customProperties_${addObject}`;
      try {
        const prevRaw = localStorage.getItem(cacheKey);
        const prev = prevRaw ? JSON.parse(prevRaw) : { data: [], timestamp: 0 };
        const data = Array.isArray(prev.data) ? prev.data : [];
        if (!data.some((p: any) => p.name === newProp.name)) {
          const merged = [
            ...data,
            {
              name: newProp.name,
              label: newProp.label,
              type: srcType,
              fieldType: srcFieldType,
            },
          ];
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: merged, timestamp: Date.now() })
          );
          console.log(
            "🏗️ [CREATE_PROPERTY] Added to customProperties cache:",
            newProp.name
          );
        }
      } catch (error) {
        console.error("❌ [CREATE_PROPERTY] Error updating cache:", error);
      }

      setSelectedTargetName(newProp.name);
      setCreateStatus("created");
      console.log(
        "✅ [CREATE_PROPERTY] Property created successfully:",
        newProp
      );
      return newProp;
    };

  const handleInternalNameChange = (value: string) => {
    const newName = value.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const error = validateInternalName(
      newName,
      targetObject,
      propPool,
      defaultMapModal
    );

    setCreateForm((f) => ({ ...f, name: newName }));
    setNameValidationError(error);
  };

  const handleSave = async () => {
    try {
      console.log("🔄 [MODAL_SAVE] Starting save process...");
      console.log("🔄 [MODAL_SAVE] createChecked:", createChecked);
      console.log("🔄 [MODAL_SAVE] selectedSource:", selectedSource);
      console.log("🔄 [MODAL_SAVE] createForm.label:", createForm.label);
      console.log(
        "🔄 [MODAL_SAVE] selectedTargetName before:",
        selectedTargetName
      );

      // Validate that source and target are not the same
      if (!createChecked && selectedSource && selectedTargetName) {
        if (selectedSource.name === selectedTargetName) {
          alert(
            "❌ Error: Source and target properties cannot be the same. Please select a different target property."
          );
          return;
        }
      }

      let finalTargetName = selectedTargetName;
      let createdProperty: PropertyItem | null = null;

      // Only create a property if checkbox is checked (creating new custom property)
      if (createChecked && selectedSource && createForm.label.trim()) {
        console.log(
          "🔄 [MODAL_SAVE] Creating custom property (checkbox checked)..."
        );

        // Call the function that actually creates the property in HubSpot
        createdProperty = await createTargetPropertyIfNeeded();

        if (!createdProperty) {
          console.error("❌ [MODAL_SAVE] Failed to create property in HubSpot");
          return; // Don't proceed if property creation failed
        }

        finalTargetName = createdProperty.name;
        console.log(
          "✅ [MODAL_SAVE] Custom property created in HubSpot:",
          createdProperty
        );
        console.log(
          "✅ [MODAL_SAVE] Final target name set to:",
          finalTargetName
        );
      } else {
        console.log(
          "🔄 [MODAL_SAVE] Not creating custom property (checkbox unchecked), using existing property"
        );
        console.log("🔄 [MODAL_SAVE] selectedTargetName:", selectedTargetName);
      }

      // Always call parent's onSave function with the created property (or undefined)
      console.log(
        "🔄 [MODAL_SAVE] Calling parent onSave with createdProperty:",
        createdProperty
      );
      await onSave(createdProperty || undefined);
      console.log("✅ [MODAL_SAVE] Parent onSave completed successfully");

      // Close modal on success
      onClose();
    } catch (error) {
      console.error("❌ [MODAL_SAVE] Error saving property:", error);
      alert("Failed to save property. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
  className={`fixed inset-0 transition-opacity duration-200 ${
    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
  } bg-gray-900 bg-opacity-75 flex items-center justify-center z-50`}
  onPointerDown={onClose}
>
  <div
    className={`bg-gray-800 rounded-lg p-6 w-full max-w-2xl transform transition-transform duration-200 ${
      isOpen ? "scale-100" : "scale-95"
    }`}
    onPointerDown={(e) => e.stopPropagation()}
  >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-200">
            Add Custom Property Mapping
          </h2>
          <button
            onClick={() => {
              console.log("🔍 [MODAL_CLOSE] Close button clicked");
              onClose();
            }}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Source object */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Select Source Object
            </label>
            <select
              className="w-full rounded-lg border border-gray-600 bg-gray-700 text-gray-200 p-3 text-sm"
              value={addObject}
              onChange={(e) => {
                const v = e.target.value as ObjectKey;
                setAddObject(v);
                setTargetObject(v);
                setSelectedProperty("");
                setSelectedTargetName("");
                loadProps(v);
              }}
            >
              {Array.from(selectedObjects)
                .sort((a, b) => {
                  const order = {
                    contacts: 0,
                    companies: 1,
                    deals: 2,
                    tickets: 3,
                  };
                  return order[a] - order[b];
                })
                .map((o) => (
                  <option key={o} value={o}>
                    {o[0].toUpperCase() + o.slice(1)}
                  </option>
                ))}
            </select>
          </div>

          {/* Source property */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Select Source Property
            </label>
            <select
              className="w-full rounded-lg border border-gray-600 bg-gray-700 text-gray-200 p-3 text-sm"
              value={selectedProperty}
              onChange={(e) => {
                console.log("🔧 [DROPDOWN] Property selected:", e.target.value);
                setSelectedProperty(e.target.value);
              }}
            >
              <option value="" disabled>
                Choose…
              </option>
              {sourceList.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.label} ({p.name})
                </option>
              ))}
            </select>
            {selectedSource && (
              <p className="text-xs text-gray-400 mt-2">
                Source type: <b>{selectedSource.type || "-"}</b> • fieldType:{" "}
                <b>{selectedSource.fieldType || "-"}</b>
              </p>
            )}
          </div>

          {/* Target property */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Select Target Property
            </label>
            <select
              className="w-full rounded-lg border border-gray-600 bg-gray-700 text-gray-200 p-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedTargetName}
              onChange={(e) => setSelectedTargetName(e.target.value)}
              disabled={!selectedSource || createChecked}
            >
              <option value="" disabled>
                {!selectedSource
                  ? "Pick a source first"
                  : createChecked
                  ? "Disabled while creating a new property"
                  : "Select property…"}
              </option>
              {selectedSource &&
                !createChecked &&
                filteredTargetList
                  .filter((p) => p.name !== selectedSource.name) // Exclude the source property from target options
                  .map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.label} ({p.name})
                    </option>
                  ))}
            </select>

            {selectedSource &&
              !createChecked &&
              filteredTargetList.length === 0 && (
                <p className="text-xs text-amber-400 mt-2">
                  No property matches type <b>{selectedSource.type}</b> &
                  fieldType <b>{selectedSource.fieldType}</b>.
                </p>
              )}

            {selectedSource &&
              selectedTargetName &&
              selectedSource.name === selectedTargetName && (
                <p className="text-xs text-red-400 mt-2">
                  ⚠️ Warning: Source and target properties are the same. This
                  mapping will be ignored.
                </p>
              )}
          </div>

          {/* Create custom property */}
          <div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                checked={createChecked}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setCreateChecked(checked);
                  if (checked) {
                    setSelectedTargetName(""); // clear dropdown selection
                    setTargetObject(addObject); // ensure creation goes to selected object
                  }
                }}
                disabled={!selectedSource || !profile?.hubspot_access_token_a}
              />
              <span className="text-sm text-gray-300 select-none">
                Create custom property
              </span>
            </label>

            {!profile?.hubspot_access_token_a && (
              <div className="mt-2 text-xs text-yellow-400">
                ⚠️ HubSpot connection required. Please reconnect your HubSpot
                account in Step 1.
              </div>
            )}

            {createChecked && (
              <div className="mt-3 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Label
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 text-gray-200 p-3 text-sm"
                    placeholder="e.g. Avatar FileManager key"
                    value={createForm.label}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, label: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Property Group
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 text-gray-200 p-3 text-sm"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option value="custom_properties">Custom Properties</option>
                    <option value="dealinformation">Deal Information</option>
                    <option value="deal_revenue">Deal Revenue</option>
                    <option value="deal_activity">Deal Activity</option>
                    <option value="contactinformation">
                      Contact Information
                    </option>
                    <option value="companyinformation">
                      Company Information
                    </option>
                    <option value="ticketinformation">
                      Ticket Information
                    </option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Choose the group where this property will be created in
                    HubSpot
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-300">
                      Internal name
                    </label>
                    <button
                      type="button"
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                      onClick={() =>
                        setIsInternalNameEditable(!isInternalNameEditable)
                      }
                    >
                      {isInternalNameEditable
                        ? "Use auto-generated"
                        : "Edit manually"}
                    </button>
                  </div>

                  <input
                    className={`w-full rounded-lg border ${
                      nameValidationError ? "border-red-500" : "border-gray-600"
                    } bg-gray-700 text-gray-200 p-3 text-sm`}
                    value={createForm.name}
                    onChange={(e) => handleInternalNameChange(e.target.value)}
                    readOnly={!isInternalNameEditable}
                    placeholder="e.g. avatar_filemanager_key"
                  />

                  {nameValidationError && (
                    <p className="text-xs text-red-400 mt-1">
                      {nameValidationError}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    Will be created with type{" "}
                    <b>{selectedSource?.type || "-"}</b> & fieldType{" "}
                    <b>{selectedSource?.fieldType || "-"}</b>.
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    {createStatus === "creating" && (
                      <span className="text-blue-400 text-sm">
                        Creating property in HubSpot...
                      </span>
                    )}
                    {createStatus === "created" && (
                      <span className="text-green-400 text-sm">
                        Created ✓ & added to dropdown
                      </span>
                    )}
                    {createStatus === "error" && (
                      <div className="text-red-400 text-sm">
                        <div className="font-medium">
                          Error creating property:
                        </div>
                        <div className="text-xs mt-1">{createError}</div>
                        {createError.includes("HubSpot access token") && (
                          <div className="text-xs mt-2 text-yellow-400">
                            💡 Try reconnecting your HubSpot account in Step 1
                          </div>
                        )}
                        {createError.includes("already exists") && (
                          <div className="text-xs mt-2 text-yellow-400">
                            💡 Try using a different property name
                          </div>
                        )}
                        {createError.includes("property group") &&
                          createError.includes("does not exist") && (
                            <div className="text-xs mt-2 text-yellow-400">
                              💡 Try selecting a different property group from
                              the dropdown
                            </div>
                          )}
                        {createError.includes("Deal property names") && (
                          <div className="text-xs mt-2 text-yellow-400">
                            💡 Deal property names must start with a letter and
                            use only lowercase letters, numbers, and underscores
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                console.log("🔍 [MODAL_CANCEL] Cancel button clicked");
                onClose();
              }}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log("🔍 [MODAL_CREATE] Create button clicked");
                console.log(
                  "🔍 [MODAL_CREATE] selectedProperty:",
                  selectedProperty
                );
                console.log(
                  "🔍 [MODAL_CREATE] selectedTargetName:",
                  selectedTargetName
                );
                console.log("🔍 [MODAL_CREATE] createChecked:", createChecked);
                console.log(
                  "🔍 [MODAL_CREATE] createForm.label:",
                  createForm.label
                );
                console.log(
                  "🔍 [MODAL_CREATE] selectedSource:",
                  selectedSource
                );
                handleSave();
              }}
              disabled={
                !selectedProperty ||
                (!createChecked && !selectedTargetName) ||
                createStatus === "creating" ||
                !profile?.hubspot_access_token_a
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createStatus === "creating" ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
