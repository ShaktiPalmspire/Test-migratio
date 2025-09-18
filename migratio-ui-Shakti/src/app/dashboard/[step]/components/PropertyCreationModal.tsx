"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/Buttons/button";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

interface PropertyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hubspotStatusB: { portalId: number | null };
}

interface PropertyFormData {
  objectType: string;
  name: string;
  label: string;
  type: string;
  fieldType: string;
  description: string;
  groupName: string;
}

const OBJECT_TYPES = [
  { value: "contacts", label: "Contacts" },
  { value: "companies", label: "Companies" },
  { value: "deals", label: "Deals" },
  { value: "tickets", label: "Tickets" },
];

export default function PropertyCreationModal({
  isOpen,
  onClose,
  onSuccess,
  hubspotStatusB,
}: PropertyCreationModalProps) {
  const { user, profile } = useUser();
  const [formData, setFormData] = useState<PropertyFormData>({
    objectType: "contacts",
    name: "",
    label: "",
    type: "string",
    fieldType: "text",
    description: "",
    groupName: "contactinformation", // Set correct default groupName for contacts
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [propertyExists, setPropertyExists] = useState(false);

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setIsSuccess(false); // Reset success state when form changes
    setPropertyExists(false); // Reset property exists state when form changes
  };

  // Function to refresh HubSpot B token
  const refreshHubSpotBToken = async () => {
    try {
      console.log("🔄 [MODAL] Refreshing HubSpot B token...");

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
          `Token refresh failed: ${response.statusText} - ${
            errorData.message || errorData.error || "Unknown error"
          }`
        );
      }

      const result = await response.json();
      console.log("✅ [MODAL] Token refreshed successfully:", {
        success: result.success,
        hasAccessToken: !!result.access_token,
      });

      if (!result.success || !result.access_token) {
        throw new Error("Token refresh response invalid");
      }

      return result.access_token;
    } catch (error) {
      console.error("❌ [MODAL] Token refresh failed:", error);
      throw error;
    }
  };

  // Auto-generate property name from label
  const generatePropertyName = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/^[0-9]/, "prop_$&") // Add prefix if starts with number
      .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
      .substring(0, 50); // Limit length
  };

  const handleObjectTypeChange = (objectType: string) => {
    // Set appropriate default groupName based on object type
    const getDefaultGroupName = (objType: string) => {
      switch (objType) {
        case "contacts":
          return "contactinformation";
        case "companies":
          return "companyinformation";
        case "deals":
          return "dealinformation";
        case "tickets":
          return "ticketinformation";
        default:
          return "contactinformation";
      }
    };

    setFormData((prev) => ({
      ...prev,
      objectType,
      groupName: getDefaultGroupName(objectType),
      type: "string", // Default to string, will be updated when property types load
      fieldType: "text",
    }));
  };

  // Handle type change and set appropriate fieldType
  const handleTypeChange = (type: string) => {
    const getFieldTypeForType = (propType: string) => {
      switch (propType) {
        case "enumeration":
          return "checkbox";
        case "string":
          return "text";
        case "number":
          return "number";
        case "bool":
          return "checkbox";
        case "datetime":
          return "datetime";
        case "text":
          return "textarea";
        case "phone_number":
          return "phone";
        case "email":
          return "email";
        default:
          return "text";
      }
    };

    setFormData((prev) => ({
      ...prev,
      type,
      fieldType: getFieldTypeForType(type),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !user?.id ||
      !profile?.hubspot_access_token_b ||
      !hubspotStatusB.portalId
    ) {
      setError(
        "Missing authentication data. Please refresh the page and try again."
      );
      return;
    }

    if (!formData.name.trim() || !formData.label.trim()) {
      setError("Property name and label are required.");
      return;
    }

    // Validate property name format
    const propertyName = formData.name.trim();
    if (!/^[a-z][a-z0-9_]*$/.test(propertyName)) {
      setError(
        "Property name must start with a letter and contain only lowercase letters, numbers, and underscores."
      );
      return;
    }

    if (propertyName.length > 50) {
      setError("Property name must be 50 characters or less.");
      return;
    }

    // Additional validation for specific object types
    if (formData.objectType === "deals") {
      // Deal properties have stricter requirements
      if (propertyName.length < 2) {
        setError("Deal property names must be at least 2 characters long.");
        return;
      }
    }

    // Check for reserved property names that might cause conflicts
    const reservedNames = [
      "id",
      "createdate",
      "lastmodifieddate",
      "hs_object_id",
      "hs_createdate",
      "hs_lastmodifieddate",
      "email",
      "firstname",
      "lastname",
      "phone",
      "company",
      "website",
      "city",
      "state",
      "country",
      "dealname",
      "amount",
      "closedate",
      "pipeline",
      "dealstage",
      "dealtype",
      "subject",
      "content",
      "hs_ticket_id",
      "hs_ticket_category",
      "hs_ticket_priority",
    ];

    if (reservedNames.includes(propertyName.toLowerCase())) {
      setError(
        `"${propertyName}" is a reserved property name in HubSpot. Please choose a different name.`
      );
      return;
    }

    setIsCreating(true);
    setError(null);
    setIsSuccess(false);
    setPropertyExists(false);

    try {
      // Try to refresh the token first to prevent expiration
      let accessToken = profile?.hubspot_access_token_b;
      try {
        console.log(
          "🔄 [MODAL] Attempting to refresh token before property creation..."
        );
        accessToken = await refreshHubSpotBToken();
        console.log("✅ [MODAL] Token refreshed successfully, using new token");
      } catch (tokenError) {
        console.warn(
          "⚠️ [MODAL] Token refresh failed, proceeding with existing token:",
          tokenError
        );
        if (!accessToken) {
          throw new Error(
            "No valid access token available. Please reconnect your HubSpot B account."
          );
        }
      }

      const requestBody = {
        name: formData.name.trim(),
        label: formData.label.trim(),
        type: formData.type,
        fieldType: formData.fieldType,
        description: formData.description.trim(),
        userId: user.id,
        instance: "b",
        groupName: formData.groupName.trim() || undefined,
      };

      console.log("🔄 [MODAL] Creating property with data:", {
        url: `/api/hubspot/schema/${formData.objectType}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken?.substring(0, 20)}...`,
          "X-User-ID": user.id,
          "X-Portal-ID": hubspotStatusB.portalId.toString(),
        },
        body: requestBody,
      });

      const response = await fetch(
        `/api/hubspot/schema/${formData.objectType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-User-ID": user.id,
            "X-Portal-ID": hubspotStatusB.portalId.toString(),
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("🔍 [MODAL] Response status:", response.status);
      console.log(
        "🔍 [MODAL] Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      const result = await response.json();
      console.log("🔍 [MODAL] API Response:", result);
      console.log("🔍 [MODAL] Response Status:", response.status);
      console.log("🔍 [MODAL] Error Message:", result.error);
      console.log("🔍 [MODAL] Message:", result.message);
      console.log("🔍 [MODAL] HubSpot Error:", result.hubspot);
      console.log(
        "🔍 [MODAL] Full Error Response:",
        JSON.stringify(result, null, 2)
      );

      // If token is invalid/expired, refresh and retry once here
      const authErrorDetected =
        response.status === 401 ||
        (typeof result?.hubspot?.category === "string" &&
          result.hubspot.category.includes("AUTH")) ||
        (typeof result?.hubspot?.message === "string" &&
          /expired|authentication/i.test(result.hubspot.message));

      if (!response.ok && authErrorDetected) {
        console.log(
          "🔄 [MODAL] Detected 401/auth error. Refreshing token and retrying…"
        );
        try {
          const refreshedToken = await refreshHubSpotBToken();
          const retryResponse = await fetch(
            `/api/hubspot/schema/${formData.objectType}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshedToken}`,
                "X-User-ID": user.id,
                "X-Portal-ID": hubspotStatusB.portalId.toString(),
              },
              body: JSON.stringify(requestBody),
            }
          );
          const retryResult = await retryResponse.json();
          if (retryResult.ok) {
            console.log("✅ [MODAL] Property created successfully after retry");
            setIsSuccess(true);
            toast.success("Property created successfully!", { duration: 4000 });
            onSuccess();
            setTimeout(() => {
              setFormData({
                objectType: "contacts",
                name: "",
                label: "",
                type: "string",
                fieldType: "text",
                description: "",
                groupName: "contactinformation",
              });
              setIsSuccess(false);
              setError(null);
              setPropertyExists(false);
            }, 3000);
            return;
          }
          // fall through to normal error handling with retryResult
          console.warn(
            "❌ [MODAL] Retry after token refresh still failed:",
            retryResult
          );
        } catch (retryErr) {
          console.error(
            "❌ [MODAL] Retry after token refresh threw error:",
            retryErr
          );
        }
      }

      if (result.ok) {
        console.log("✅ [MODAL] Property created successfully");
        setIsSuccess(true);
        toast.success("Property created successfully!", {
          duration: 4000,
        });
        onSuccess(); // Still call onSuccess to refresh the parent component
        // Don't close the modal - let user see the success message
        // Reset form after showing success
        setTimeout(() => {
          setFormData({
            objectType: "contacts",
            name: "",
            label: "",
            type: "string",
            fieldType: "text",
            description: "",
            groupName: "contactinformation", // Reset to correct default groupName for contacts
          });
          setIsSuccess(false);
          setError(null);
          setPropertyExists(false);
        }, 3000); // Reset after 3 seconds
      } else {
        // Extract error message from various possible locations
        let errorMessage =
          result.error || result.message || "Failed to create property";

        // Check if there's a HubSpot-specific error message
        if (result.hubspot && result.hubspot.message) {
          errorMessage = result.hubspot.message;
        }

        // Check if the error is in the response text
        if (response.status === 400 && result.message === "HubSpot API error") {
          errorMessage = `HubSpot API error: ${
            result.hubspot?.message || "Property validation failed"
          }`;
        }

        // Check if property already exists - be more specific about error patterns
        const isPropertyExists =
          result.message === "Property already exists" ||
          result.message === "Property already exists." ||
          errorMessage.includes("already exists") ||
          (errorMessage.includes("Property") &&
            errorMessage.includes("already exists")) ||
          errorMessage.includes("duplicate") ||
          errorMessage.includes("name already taken") ||
          (errorMessage.includes("property name") &&
            errorMessage.includes("exists")) ||
          errorMessage.includes("conflict") ||
          errorMessage.includes("already been created") ||
          errorMessage.includes("Property with this name already exists") ||
          errorMessage.includes("A property with this name already exists") ||
          errorMessage.includes("Property name already exists") ||
          errorMessage.includes("already exists in HubSpot") ||
          response.status === 409 || // HTTP 409 Conflict typically means resource already exists
          (response.status === 400 &&
            (errorMessage.includes("already exists") ||
              errorMessage.includes("duplicate") ||
              errorMessage.includes("name already taken") ||
              errorMessage.includes("conflict"))); // Only treat HTTP 400 as "already exists" if it contains specific keywords

        if (isPropertyExists) {
          console.log("🔍 [MODAL] Property already exists detected:", {
            propertyName: formData.name,
            objectType: formData.objectType,
            errorMessage,
            resultMessage: result.message,
            hubspotError: result.hubspot,
            responseStatus: response.status,
          });
          setPropertyExists(true);
          toast.warning("⚠️ Property Already Exists", {
            description: `A property named "${formData.name}" already exists in HubSpot ${formData.objectType}. Please choose a different name.`,
            duration: 6000,
            action: {
              label: "Try Again",
              onClick: () => {
                setPropertyExists(false);
                setError(null);
              },
            },
          });
        } else {
          // Provide more specific error messages based on the error type
          let userFriendlyMessage = errorMessage;
          let toastTitle = "Failed to create property";

          if (response.status === 400) {
            if (
              errorMessage.includes("validation") ||
              errorMessage.includes("invalid")
            ) {
              toastTitle = "Property Validation Error";
              userFriendlyMessage = `The property "${formData.name}" has validation issues. Please check the property name format and try again.`;
            } else if (
              errorMessage.includes("group") ||
              errorMessage.includes("category")
            ) {
              toastTitle = "Invalid Property Group";
              userFriendlyMessage = `The selected property group "${formData.groupName}" is not valid for ${formData.objectType}. Please choose a different group.`;
            } else {
              toastTitle = "Property Creation Error";
              userFriendlyMessage = `Unable to create property "${formData.name}". ${errorMessage}`;
            }
          } else if (response.status === 401) {
            toastTitle = "Authentication Error";
            userFriendlyMessage =
              "Your HubSpot connection has expired. Please reconnect your account.";
          } else if (response.status === 403) {
            toastTitle = "Permission Denied";
            userFriendlyMessage =
              "You don't have permission to create properties in this HubSpot account.";
          } else if (response.status >= 500) {
            toastTitle = "Server Error";
            userFriendlyMessage =
              "HubSpot is experiencing issues. Please try again later.";
          }

          toast.error(toastTitle, {
            description: userFriendlyMessage,
            duration: 6000,
          });
          setError(userFriendlyMessage);
        }
        console.error("❌ [MODAL] Property creation failed:", result);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Check if it's an authentication error
      const isAuthError =
        errorMessage.includes("Invalid or expired access token") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("EXPIRED_AUTHENTICATION") ||
        errorMessage.includes("authentication failed");

      if (isAuthError) {
        console.log(
          "🔍 [MODAL] Authentication error detected, attempting token refresh and retry..."
        );
        try {
          const refreshedToken = await refreshHubSpotBToken();

          // Retry property creation with refreshed token
          const requestBody = {
            name: formData.name.trim(),
            label: formData.label.trim(),
            type: formData.type,
            fieldType: formData.fieldType,
            description: formData.description.trim(),
            userId: user.id,
            instance: "b",
            groupName: formData.groupName.trim() || undefined,
          };

          const retryResponse = await fetch(
            `/api/hubspot/schema/${formData.objectType}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshedToken}`,
                "X-User-ID": user.id,
                "X-Portal-ID": hubspotStatusB.portalId.toString(),
              },
              body: JSON.stringify(requestBody),
            }
          );

          const retryResult = await retryResponse.json();

          if (retryResult.ok) {
            console.log(
              "✅ [MODAL] Property created successfully after token refresh"
            );
            setIsSuccess(true);
            toast.success("Property created successfully!", {
              duration: 4000,
            });
            onSuccess();
            setTimeout(() => {
              setFormData({
                objectType: "contacts",
                name: "",
                label: "",
                type: "string",
                fieldType: "text",
                description: "",
                groupName: "contactinformation",
              });
              setIsSuccess(false);
              setError(null);
              setPropertyExists(false);
            }, 3000);
            return; // Exit early on success
          } else {
            throw new Error(
              retryResult.error ||
                retryResult.message ||
                "Failed to create property after token refresh"
            );
          }
        } catch (retryError) {
          console.error(
            "❌ [MODAL] Failed to create property even after token refresh:",
            retryError
          );
          toast.error("Authentication Error", {
            description:
              "Unable to create property due to authentication issues. Please reconnect your HubSpot account.",
            duration: 6000,
          });
          setError(
            "Authentication failed. Please reconnect your HubSpot B account."
          );
        }
      } else {
        // Check if the error message indicates property already exists - be more specific
        const isPropertyExists =
          errorMessage.includes("already exists") ||
          errorMessage.includes("duplicate") ||
          errorMessage.includes("name already taken") ||
          errorMessage.includes("conflict") ||
          errorMessage.includes("already been created") ||
          errorMessage.includes("Property with this name already exists") ||
          errorMessage.includes("A property with this name already exists") ||
          errorMessage.includes("Property name already exists") ||
          errorMessage.includes("already exists in HubSpot");

        if (isPropertyExists) {
          console.log(
            "🔍 [MODAL] Property already exists detected in catch block:",
            {
              propertyName: formData.name,
              objectType: formData.objectType,
              errorMessage,
            }
          );
          setPropertyExists(true);
          toast.warning("⚠️ Property Already Exists", {
            description: `A property named "${formData.name}" already exists in HubSpot ${formData.objectType}. Please choose a different name.`,
            duration: 6000,
            action: {
              label: "Try Again",
              onClick: () => {
                setPropertyExists(false);
                setError(null);
              },
            },
          });
        } else {
          // Provide more specific error messages for catch block errors
          let userFriendlyMessage = errorMessage;
          let toastTitle = "Error creating property";

          if (
            errorMessage.includes("validation") ||
            errorMessage.includes("invalid")
          ) {
            toastTitle = "Property Validation Error";
            userFriendlyMessage = `The property "${formData.name}" has validation issues. Please check the property name format and try again.`;
          } else if (
            errorMessage.includes("network") ||
            errorMessage.includes("fetch")
          ) {
            toastTitle = "Network Error";
            userFriendlyMessage =
              "Unable to connect to HubSpot. Please check your internet connection and try again.";
          } else if (errorMessage.includes("timeout")) {
            toastTitle = "Request Timeout";
            userFriendlyMessage =
              "The request took too long to complete. Please try again.";
          } else {
            userFriendlyMessage = `Unable to create property "${formData.name}". ${errorMessage}`;
          }

          toast.error(toastTitle, {
            description: userFriendlyMessage,
            duration: 6000,
          });
          setError(userFriendlyMessage);
        }
      }
      console.error("❌ [MODAL] Error creating property:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Create Custom Property
            </h2>
            <button
              onClick={() => {
                setIsSuccess(false);
                setError(null);
                setPropertyExists(false);
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isCreating}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Property Exists Warning Banner */}
            {propertyExists && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-800">
                      Property Already Exists
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      A property named <strong>"{formData.name}"</strong>{" "}
                      already exists in HubSpot {formData.objectType}. Please
                      choose a different name to create a new property.
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const autoGenerated = generatePropertyName(
                            formData.label
                          );
                          handleInputChange("name", autoGenerated);
                        }}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded border border-amber-300"
                        disabled={!formData.label.trim()}
                      >
                        Generate New Name
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPropertyExists(false);
                          setError(null);
                        }}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded border border-amber-300"
                      >
                        Clear Warning
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Object Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Object Type *
              </label>
              <select
                value={formData.objectType}
                onChange={(e) => handleObjectTypeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isCreating || isSuccess}
              >
                {OBJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Label */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Property Label *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => {
                  handleInputChange("label", e.target.value);
                  // Auto-generate internal name when label changes
                  if (e.target.value.trim()) {
                    handleInputChange(
                      "name",
                      generatePropertyName(e.target.value)
                    );
                  }
                }}
                placeholder="Enter Label of the property"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                required
                disabled={isCreating || isSuccess}
              />
            </div>

            {/* Property Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Property Name *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const autoGenerated = generatePropertyName(formData.label);
                    handleInputChange("name", autoGenerated);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  disabled={!formData.label.trim() || isCreating || isSuccess}
                >
                  Use auto-generated
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    // Auto-format the input to be lowercase and valid
                    const formatted = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, "")
                      .replace(/^[0-9]/, "prop_$&");
                    handleInputChange("name", formatted);
                  }}
                  placeholder="Enter Internal name of the property"
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:border-blue-500 ${
                    propertyExists
                      ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  required
                  disabled={isCreating || isSuccess}
                />
                {propertyExists && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <p
                className={`text-xs mt-1 ${
                  propertyExists ? "text-red-600" : "text-gray-500"
                }`}
              >
                {propertyExists
                  ? `⚠️ Property "${formData.name}" already exists in HubSpot ${formData.objectType}`
                  : "Internal name (lowercase, letters, numbers, underscores only)"}
              </p>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isCreating || isSuccess}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="bool">Boolean</option>
                <option value="datetime">Date/Time</option>
                <option value="enumeration">Enumeration</option>
                <option value="text">Text</option>
                <option value="phone_number">Phone Number</option>
                <option value="email">Email</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Will be created with fieldType: <b>{formData.fieldType}</b>
              </p>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.groupName}
                  onChange={(e) =>
                    handleInputChange("groupName", e.target.value)
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isCreating || isSuccess}
                >
                  <option value="contactinformation">
                    Contact Information
                  </option>
                  <option value="companyinformation">
                    Company Information
                  </option>
                  <option value="dealinformation">Deal Information</option>
                  <option value="ticketinformation">Ticket Information</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Optional description for this property"
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isCreating || isSuccess}
              />
            </div>

            {/* Connection Status */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      profile?.hubspot_access_token_b && hubspotStatusB.portalId
                        ? "bg-green-400 animate-pulse"
                        : "bg-red-400"
                    }`}
                  ></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {profile?.hubspot_access_token_b &&
                      hubspotStatusB.portalId
                        ? "Connected to HubSpot"
                        : "Not Connected"}
                    </div>
                    <div className="text-xs text-gray-600">
                      {profile?.hubspot_access_token_b &&
                      hubspotStatusB.portalId
                        ? `Portal ID: ${hubspotStatusB.portalId}`
                        : "Please connect your HubSpot account"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {!profile?.hubspot_access_token_b || !hubspotStatusB.portalId ? (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-amber-800">
                      Connect HubSpot
                    </div>
                    <div className="text-xs text-amber-600">
                      Connect your HubSpot account to create properties
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const authUrl = `/api/hubspot/auth?instance=b&userId=${user?.id}`;
                      window.open(authUrl, "_blank");
                      toast.info("HubSpot Connection", {
                        description:
                          "Opened HubSpot connection page. Please connect your account.",
                        duration: 4000,
                      });
                    }}
                    className="px-4 py-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg border border-amber-300 font-medium transition-colors"
                    disabled={!user?.id}
                  >
                    Connect HubSpot
                  </button>
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsSuccess(false);
                  setError(null);
                  setPropertyExists(false);
                  onClose();
                }}
                disabled={isCreating}
                className="flex-1 py-3 text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                {isSuccess ? "Close" : "Cancel"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isCreating ||
                  isSuccess ||
                  !profile?.hubspot_access_token_b ||
                  !hubspotStatusB.portalId
                }
                className="flex-1 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span>✅</span>
                    <span>Created!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Create Property</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
