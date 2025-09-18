"use client";

import Button from "@/components/Buttons/button";
import Heading from "@/components/Headings/heading";
import React, { useMemo, useEffect, useState } from "react";
import type { ObjectKey } from "@/components/Mapping/MappingModal";
import type { StepIndex } from "../types/dashboard";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Step5Props {
  onBack: (step: StepIndex) => void;
  selectedObjects: Set<ObjectKey>;
  hubspotStatusA: { portalId: number | null };
  hubspotStatusB: { portalId: number | null };
}

export default function Step5CustomPropertySetup({
  onBack,
  selectedObjects,
  hubspotStatusA,
  hubspotStatusB,
}: Step5Props) {
  const { user, profile } = useUser();
  const [mappingsData, setMappingsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationSummary, setMigrationSummary] = useState<{
    successCount: number;
    errorCount: number;
    alreadyExistsCount: number;
    alreadyExistsProperties: string[];
  } | null>(null);

  // Track which properties were successfully created or already existed
  const [createdProperties, setCreatedProperties] = useState<Set<string>>(new Set());
  const [existingProperties, setExistingProperties] = useState<Set<string>>(new Set());

  // Load migration status from localStorage on component mount
  useEffect(() => {
    const loadMigrationStatus = () => {
      try {
        const savedCreated = localStorage.getItem('hubspotB_createdProperties');
        const savedExisting = localStorage.getItem('hubspotB_existingProperties');

        if (savedCreated) {
          setCreatedProperties(new Set(JSON.parse(savedCreated)));
        }
        if (savedExisting) {
          setExistingProperties(new Set(JSON.parse(savedExisting)));
        }
      } catch (error) {
        console.error("Error loading migration status:", error);
      }
    };

    loadMigrationStatus();
  }, []);

  // Refresh token when component mounts to ensure it's valid
  useEffect(() => {
    const refreshTokenOnLoad = async () => {
      if (profile?.hubspot_refresh_token_b && !profile?.hubspot_access_token_b) {
        try {
          await refreshHubSpotBToken();
        } catch (error) {
          console.warn("Token refresh on load failed:", error);
        }
      }
    };

    refreshTokenOnLoad();
  }, [profile?.hubspot_refresh_token_b, profile?.hubspot_access_token_b]);

  // Load mappings from Supabase
  useEffect(() => {
    const loadMappings = async () => {
      if (!user?.id) return;

      try {
        const { data: existingRow } = await supabase
          .from("profiles")
          .select("hubspot_crm_a_mapped_json")
          .eq("id", user.id)
          .single();

        const mappings = (existingRow as any)?.hubspot_crm_a_mapped_json || {};
        setMappingsData(mappings);
      } catch (error) {
        console.error("Error loading mappings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMappings();
  }, [user?.id, refreshTick]);

  // Listen for updates from Step 4 and refresh
  useEffect(() => {
    const handler = () => setRefreshTick((t) => t + 1);
    window.addEventListener("mappings-updated", handler);
    return () => window.removeEventListener("mappings-updated", handler);
  }, []);

  // Function to refresh HubSpot B token
  const refreshHubSpotBToken = async () => {
    try {
      if (!profile?.hubspot_refresh_token_b) {
        throw new Error("No refresh token available for HubSpot B");
      }

      const response = await fetch("/api/hubspot/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: profile.hubspot_refresh_token_b,
          userId: user?.id,
          instance: "b",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Token refresh failed: ${response.statusText} - ${errorData.message || errorData.error || "Unknown error"}`
        );
      }

      const result = await response.json();
      if (!result.success || !result.access_token) {
        throw new Error("Token refresh response invalid");
      }

      return result.access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  };

  // Function to check if property already exists in HubSpot B
  const checkPropertyExists = async (objectType: string, propertyName: string, accessToken: string) => {
    try {
      const response = await fetch(
        `/api/hubspot/schema/${objectType}/${propertyName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-User-ID": user?.id || "",
            "X-Portal-ID": hubspotStatusB.portalId?.toString() || "",
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Error checking property existence:", error);
      return false;
    }
  };

  // Handle migration of user-defined properties to HubSpot B
  const handleMigratePropertiesToHubSpotB = async () => {
    if (!hubspotStatusB.portalId || !profile?.hubspot_access_token_b) {
      toast.error("HubSpot B credentials not available", {
        description: "Please check your HubSpot B connection.",
      });
      return;
    }

    if (!profile?.hubspot_refresh_token_b) {
      toast.error("HubSpot B refresh token not available", {
        description: "Please reconnect your HubSpot B account.",
      });
      return;
    }

    // Filter to only include user-defined properties
    const allPropertiesToMigrate = detailedProperties.filter((prop) => {
      if (prop.category !== "Userdefined") {
        return false;
      }

      const name = prop.name.toLowerCase();
      const reservedPrefixes = ["hs_", "hubspot_"];
      const hasReservedPrefix = reservedPrefixes.some((prefix) =>
        name.startsWith(prefix)
      );
      const hasAppPrefix = name.startsWith("a") && name.includes("_") && name.match(/^a\d+_/);

      return !(hasReservedPrefix || hasAppPrefix);
    });

    if (allPropertiesToMigrate.length === 0) {
      toast.info("No user-defined properties to migrate", {
        description: "Only user-defined properties are created in HubSpot B.",
      });
      return;
    }

    try {
      setIsMigrating(true);

      // DON'T reset the tracking sets here - this was causing the toggle issue
      // We want to preserve existing state and only add new properties

      let accessToken = profile?.hubspot_access_token_b;
      try {
        accessToken = await refreshHubSpotBToken();
      } catch (tokenError) {
        if (!accessToken) {
          throw new Error(
            "No valid access token available. Please reconnect your HubSpot B account."
          );
        }
      }

      // Create copies of the current sets to update
      const newCreatedProperties = new Set(createdProperties);
      const newExistingProperties = new Set(existingProperties);

      let successCount = 0;
      let errorCount = 0;
      let alreadyExistsCount = 0;
      const alreadyExistsProperties: string[] = [];

      for (const property of allPropertiesToMigrate) {
        try {
          const propertyKey = `${property.object}-${property.name}`;

          // Skip if already processed in previous migrations
          if (newCreatedProperties.has(propertyKey) || newExistingProperties.has(propertyKey)) {
            alreadyExistsCount++;
            continue;
          }

          const sanitizedName = property.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
          const finalName = /^[0-9]/.test(sanitizedName) ? `prop_${sanitizedName}` : sanitizedName;

          const propertyExists = await checkPropertyExists(property.object, finalName, accessToken);
          if (propertyExists) {
            alreadyExistsCount++;
            alreadyExistsProperties.push(`${property.name} (${property.object})`);
            newExistingProperties.add(propertyKey);
            continue;
          }

          await createPropertyInHubSpotB(property.object, property, accessToken);
          successCount++;
          newCreatedProperties.add(propertyKey);
        } catch (error) {
          console.error(`Failed to create property ${property.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isPropertyExists = /already exists|duplicate|name already taken|conflict|already been created|Property with this name already exists/i.test(errorMessage);

          if (isPropertyExists) {
            alreadyExistsCount++;
            alreadyExistsProperties.push(`${property.name} (${property.object})`);
            newExistingProperties.add(`${property.object}-${property.name}`);
          } else {
            errorCount++;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Update state with the new sets
      setCreatedProperties(newCreatedProperties);
      setExistingProperties(newExistingProperties);

      // Save to localStorage for persistence
      localStorage.setItem('hubspotB_createdProperties', JSON.stringify([...newCreatedProperties]));
      localStorage.setItem('hubspotB_existingProperties', JSON.stringify([...newExistingProperties]));

      // Set migration summary
      setMigrationSummary({
        successCount,
        errorCount,
        alreadyExistsCount,
        alreadyExistsProperties,
      });

      // Show appropriate toast messages
      if (successCount > 0 || alreadyExistsCount > 0) {
        if (successCount === 0 && alreadyExistsCount > 0 && errorCount === 0) {
          toast.success("Properties already exist", {
            description: `Already existed: ${alreadyExistsCount}`,
            duration: 6000,
          });
        } else {
          toast.success("Migration Successful!", {
            description: `Created: ${successCount} • Already existed: ${alreadyExistsCount} • Failed: ${errorCount}`,
            duration: 6000,
          });
        }
      } else if (errorCount > 0) {
        throw new Error("No properties were created successfully");
      }
    } catch (error) {
      console.error("Error migrating properties:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("No properties were created successfully")) {
        toast.warning("Migration completed with issues", {
          description: "No new properties were created. They may already exist or there were auth/network issues.",
        });
      } else {
        toast.error("Error migrating properties", {
          description: `${errorMessage}. See console for details.`,
        });
      }
    } finally {
      setIsMigrating(false);
    }
  };


  // Function to create individual property in HubSpot B
  const createPropertyInHubSpotB = async (
    objectType: string,
    property: any,
    accessToken?: string
  ) => {
    if (!property.name) {
      throw new Error(`Invalid property data: missing name for property ${JSON.stringify(property)}`);
    }

    const sanitizedName = property.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const finalName = /^[0-9]/.test(sanitizedName) ? `prop_${sanitizedName}` : sanitizedName;

    const reservedNames = [
      "id", "createdate", "lastmodifieddate", "hs_object_id", "hs_createdate",
      "hs_lastmodifieddate", "email", "firstname", "lastname", "phone", "company",
      "website", "city", "state", "country", "dealname", "amount", "closedate",
      "pipeline", "dealstage", "dealtype", "subject", "content", "hs_ticket_id",
      "hs_ticket_category", "hs_ticket_priority",
    ];

    const finalPropertyName = reservedNames.includes(finalName.toLowerCase())
      ? `${finalName}_custom`
      : finalName;

    const propertyData = {
      name: finalPropertyName,
      label: finalPropertyName,
      type: mapPropertyType(property.type),
      fieldType: "text",
      description: `Migrated from HubSpot A - ${property.name}`,
      userId: user?.id,
      instance: "b",
    };

    const response = await fetch(`/api/hubspot/schema/${objectType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken || profile?.hubspot_access_token_b}`,
        "X-User-ID": user?.id || "",
        "X-Portal-ID": hubspotStatusB.portalId?.toString() || "",
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create property: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.message || errorData.error || JSON.stringify(errorData)}`;
      } catch {
        const errorText = await response.text();
        errorMessage += ` - Raw response: ${errorText.substring(0, 200)}`;
      }
      throw new Error(errorMessage);
    }

    await response.json();
  };

  // Map property types from HubSpot A to HubSpot B
  const mapPropertyType = (type: string) => {
    const typeMap: Record<string, string> = {
      string: "string",
      number: "number",
      bool: "bool",
      datetime: "datetime",
      enumeration: "enumeration",
      text: "text",
      phone_number: "phone_number",
      email: "email",
    };
    return typeMap[type] || "string";
  };

  const {
    selected,
    totalCustom,
    totalUserdefined,
    counts,
    userdefinedCounts,
    detailedProperties,
  } = useMemo(() => {
    const selected = Array.from(selectedObjects);

    if (!mappingsData || isLoading) {
      return {
        selected,
        totalCustom: 0,
        totalUserdefined: 0,
        counts: {},
        userdefinedCounts: {},
        detailedProperties: [],
      };
    }

    const changes = mappingsData.changes || {};
    const detailedProps: any[] = [];
    const counts: Record<string, number> = {};
    const userdefinedCounts: Record<string, number> = {};

    selected.forEach((obj) => {
      const objectMappings = changes[obj] || {};
      let customCount = 0;
      let userdefinedCount = 0;

      Object.entries(objectMappings).forEach(([key, mapping]: [string, any]) => {
        if (mapping) {
          const propertyData = {
            object: obj,
            name: key,
            label: mapping.sourceLabel || mapping.targetLabel || key,
            type: mapping.type || "string",
            category: mapping.type === "userdefined" ? "Userdefined" : "Custom",
            newProperty: mapping.newProperty,
            sourceName: mapping.sourceName,
            targetName: mapping.targetName,
          };

          if (mapping.type === "userdefined") {
            detailedProps.push(propertyData);
            userdefinedCount++;
          } else if (mapping.type === "custom") {
            detailedProps.push(propertyData);
            customCount++;
          }
        }
      });

      counts[obj] = customCount;
      userdefinedCounts[obj] = userdefinedCount;
    });

    const totalCustom = Object.values(counts).reduce((a, b) => a + b, 0);
    const totalUserdefined = Object.values(userdefinedCounts).reduce((a, b) => a + b, 0);

    return {
      selected,
      totalCustom,
      totalUserdefined,
      counts,
      userdefinedCounts,
      detailedProperties: detailedProps,
    };
  }, [selectedObjects, mappingsData, isLoading]);

  return (
    <>
      <Heading as="h2" className="mt-8">
        Custom Property Setup
      </Heading>
      <p className="text-[var(--migratio_text)] mt-2">
        Default properties don't need to be set up.
      </p>

      <div className="mt-6 flex gap-3">
        <Button variant="with_arrow" onClick={() => onBack(4 as StepIndex)}>
          Back
        </Button>
      </div>

      {/* Summary: Selected Objects and Custom Properties */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
        {/* Account Details */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Account Details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="bg-white rounded border p-2 flex items-center justify-between">
              <span>HubSpot CRM A Portal ID</span>
              <span className="font-medium">
                {hubspotStatusA.portalId ?? "—"}
              </span>
            </div>
            <div className="bg-white rounded border p-2 flex items-center justify-between">
              <span>HubSpot CRM B Portal ID</span>
              <span className="font-medium">
                {hubspotStatusB.portalId ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <span className="font-medium">Selected Objects:</span>
            <span className="ml-2 capitalize">
              {selected.length > 0 ? selected.join(", ") : "None"}
            </span>
          </div>
          <div>
            <span className="font-medium">No. of Custom Properties:</span>
            <span className="ml-2 text-gray-500">{totalCustom}</span>
          </div>
          <div>
            <span className="font-medium">No. of Userdefined Properties:</span>
            <span className="ml-2 font-semibold text-purple-600">
              {totalUserdefined}
            </span>
          </div>
          <div>
            <span className="font-medium">Total Properties:</span>
            <span className="ml-2">{totalCustom + totalUserdefined}</span>
          </div>
          {selected.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Breakdown by object</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {selected.map((obj) => {
                  // Get the correct object name (ensure proper mapping)
                  const objectName = obj.toLowerCase();
                  const customCount = counts[obj] || 0;
                  const userdefinedCount = userdefinedCounts[obj] || 0;

                  return (
                    <div key={obj} className="bg-white rounded border p-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="capitalize">{obj}</span>
                        <span className="font-medium">{customCount + userdefinedCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Custom:</span>
                        <span>{customCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-purple-600">
                        <span>Userdefined:</span>
                        <span className="font-semibold">{userdefinedCount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User-Defined Properties List */}
      {selected.length > 0 && (
        <div className="mt-8 p-4 bg-white rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Detailed Properties List
          </h3>

          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 text-xs font-bold text-black uppercase tracking-wider">
                    Object
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-black uppercase tracking-wider">
                    Property Name
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-black uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-black uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-black uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-3 text-sm text-gray-500 text-center"
                    >
                      Loading properties...
                    </td>
                  </tr>
                ) : detailedProperties.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-3 text-sm text-gray-500 text-center"
                    >
                      No user-defined properties found. Please go back and
                      create some user-defined property mappings.
                    </td>
                  </tr>
                ) : (
                  detailedProperties.map((prop: any, index: number) => {
                    const propertyKey = `${prop.object}-${prop.name}`;
                    const isCreated = createdProperties.has(propertyKey);
                    const alreadyExists = existingProperties.has(propertyKey);

                    // Show checkmark for created or existing properties
                    const showCheckmark = prop.category === "Custom" || isCreated || alreadyExists;

                    return (
                      <tr
                        key={`${prop.object}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="p-3 text-sm text-gray-700 capitalize">
                          {index === 0 || detailedProperties[index - 1]?.object !== prop.object
                            ? prop.object
                            : ""}
                        </td>

                        <td className="p-3 text-sm text-gray-600">
                          {(() => {
                            const label = prop.label || prop.name || "Unknown";
                            const internal = prop.name || "";
                            const showBracket = internal && label && internal.toLowerCase() !== label.toLowerCase();

                            return (
                              <>
                                {label}
                                {showBracket && <span> ({internal})</span>}
                              </>
                            );
                          })()}
                        </td>

                        <td className="p-3 text-sm text-gray-600">
                          {prop.type || "Unknown"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prop.category === "Custom"
                              ? "bg-blue-100 text-blue-800"
                              : prop.category === "Userdefined"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                              }`}
                          >
                            {prop.category}
                          </span>
                        </td>
                        <td className="p-3">
                          {showCheckmark ? (
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>User-Defined Properties: {totalUserdefined}</span>
              <div className="flex gap-4">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-purple-100 rounded-full mr-2"></span>
                  Userdefined: {totalUserdefined}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Property Migration Info */}
      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-sm font-semibold text-green-700 mb-3">
          Create Custom Properties
        </h3>
        <div className="text-sm text-green-600 mb-3">
          Click the button below to create only user-defined properties from the
          detailed list in HubSpot CRM B account.
        </div>
        <div className="text-xs text-green-500">
          <strong>Note:</strong> Only user-defined properties will be created in HubSpot CRM B. Custom properties
          will be skipped.
        </div>
      </div>

      {/* Action Button at the bottom */}
      <div className="mt-8 flex flex-col items-center">
        <button
          onClick={handleMigratePropertiesToHubSpotB}
          disabled={
            !profile?.hubspot_access_token_b ||
            !profile?.hubspot_refresh_token_b ||
            !hubspotStatusB.portalId ||
            isMigrating
          }
          className={`min-w-[300px] py-3 px-6 rounded-md font-medium text-white transition-colors
            ${isMigrating || !profile?.hubspot_access_token_b || !hubspotStatusB.portalId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isMigrating ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Migrating Properties...
            </div>
          ) : (
            "Create Custom Properties in HubSpot CRM B"
          )}
        </button>

      </div>
    </>
  );
}