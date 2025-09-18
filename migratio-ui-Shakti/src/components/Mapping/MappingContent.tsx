"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/context/UserContext";
import { isUserAdmin } from "@/utils/cacheUtils";
// IconTrash removed as it's not being used

export type PropertyOption = { 
  value: string; 
  label: string; 
  name?: string;
  type?: string;
  required?: boolean;
  description?: string;
  hubspotDefined?: boolean;
  objectType?: string; // Track which object type this property belongs to
};

export type MappingRow = {
  id: string;
  aFixed?: string;
  a?: string;
  b?: string;
  fixed?: boolean;
  required?: boolean;
  error?: string;
  custom?: boolean;
  customProperty?: PropertyOption;
};

type Props = {
  objectKey: "contacts" | "companies" | "deals" | "tickets";
  propsA: PropertyOption[];
  propsB: PropertyOption[];
  rows: MappingRow[];
  setRows: (rows: MappingRow[]) => void;
  onValidationError?: (errors: string[]) => void;
};

export default function MappingContent({
  objectKey,
  propsA,
  propsB,
  rows,
  setRows,
  onValidationError,
}: Props) {
  const { user, profile, refreshProfile } = useUser();
  const [searchTerm, setSearchTerm] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const [customProperties, setCustomProperties] = React.useState<PropertyOption[]>([]);
  const [loadingCustomProps, setLoadingCustomProps] = React.useState(false);
  const [refreshingToken, setRefreshingToken] = React.useState(false);
  const [customPropsError, setCustomPropsError] = React.useState<string | null>(null);
  

  
  // Function to refresh HubSpot access token
  const refreshHubSpotToken = React.useCallback(async (instance: 'a' | 'b' = 'a') => {
    try {
      setRefreshingToken(true);
      console.log('🔄 [TOKEN_REFRESH] Starting token refresh for instance:', instance);
      
      if (!profile?.hubspot_refresh_token_a) {
        throw new Error('No refresh token available. Please reconnect your HubSpot account.');
      }
      
      const refreshToken = instance === 'a' ? profile.hubspot_refresh_token_a : profile.hubspot_refresh_token_b;
      
      if (!refreshToken) {
        throw new Error(`No refresh token available for instance ${instance}. Please reconnect your HubSpot account.`);
      }
      
      // Use the correct backend URL - remove trailing slash if present
      const backendBase = (process.env.NEXT_PUBLIC_DOMAIN_BACKEND || 'http://localhost:3000').replace(/\/$/, '');
      const refreshUrl = `${backendBase}/hubspot/refresh-token`;
      
      console.log('🔄 [TOKEN_REFRESH] Environment check:', {
        NEXT_PUBLIC_DOMAIN_BACKEND: process.env.NEXT_PUBLIC_DOMAIN_BACKEND,
        backendBase,
        refreshUrl
      });
      console.log('🔄 [TOKEN_REFRESH] Calling refresh endpoint:', refreshUrl);
      console.log('🔄 [TOKEN_REFRESH] Request payload:', {
        refreshToken: refreshToken.substring(0, 20) + '...',
        userId: profile.id,
        instance
      });
      
      let response;
      try {
        response = await fetch(refreshUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken,
            userId: profile.id,
            instance
          })
        });
      } catch (fetchError) {
        console.error('❌ [TOKEN_REFRESH] Fetch error:', fetchError);
        
        // Try fallback URL if the main URL fails
        const fallbackUrl = '/api/hubspot/refresh-token';
        console.log('🔄 [TOKEN_REFRESH] Trying fallback URL:', fallbackUrl);
        
        response = await fetch(fallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken,
            userId: profile.id,
            instance
          })
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Token refresh failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ [TOKEN_REFRESH] Token refresh response:', result);
      
      if (!result.success || !result.access_token) {
        throw new Error(result.message || 'Token refresh failed - invalid response from server');
      }
      
      console.log('✅ [TOKEN_REFRESH] Token refreshed successfully:', {
        hasAccessToken: !!result.access_token,
        hasRefreshToken: !!result.refresh_token,
        expiresIn: result.expires_in
      });
      
      // Update the profile in the frontend context
      // This will trigger a re-render with the new token
      if (refreshProfile) {
        console.log('🔄 [TOKEN_REFRESH] Refreshing user profile...');
        try {
          await refreshProfile();
          console.log('✅ [TOKEN_REFRESH] User profile refreshed');
        } catch (profileError) {
          console.warn('⚠️ [TOKEN_REFRESH] Profile refresh failed, but continuing with new token:', profileError);
          // Continue anyway - we have the new token
        }
      }
      
      return result.access_token;
    } catch (error) {
      console.error('❌ [TOKEN_REFRESH] Failed to refresh token:', error);
      throw error;
    } finally {
      setRefreshingToken(false);
    }
  }, [profile, refreshProfile]);

  // Function to fetch custom properties from HubSpot with automatic token refresh
  const fetchCustomProperties = React.useCallback(async () => {
    try {
      setLoadingCustomProps(true);
      setCustomPropsError(null);
      
      // IMPORTANT: Clear any existing custom properties before fetching new ones
      console.log('🧹 [FETCH] Clearing existing custom properties before fetching for:', objectKey);
      setCustomProperties([]);
      
      // Check if user has HubSpot connected
      if (!profile?.hubspot_access_token_a) {
        throw new Error('HubSpot not connected. Please connect your HubSpot account first.');
      }
      
      if (!profile?.hubspot_portal_id_a) {
        throw new Error('HubSpot portal ID not found. Please reconnect your HubSpot account.');
      }
      
      console.log('🔄 [FETCH] Fetching custom properties for:', objectKey);
      console.log('🔑 Using HubSpot token for user:', profile.id);
      console.log('🏢 Portal ID:', profile.hubspot_portal_id_a);
      console.log('⏰ Token expires at:', profile.hubspot_access_token_expires_at_a || 'No expiration');
      
      // First attempt with current token
      let response = await fetch(`/api/hubspot/schema/${objectKey}?propertyType=custom`, {
        headers: {
          'Authorization': `Bearer ${profile.hubspot_access_token_a}`,
          'X-User-ID': profile.id,
          'X-Portal-ID': profile.hubspot_portal_id_a.toString()
        }
      });
      
      // If token is expired, try to refresh it and retry
      if (response.status === 401) {
        console.log('🔄 [AUTO_REFRESH] Token expired, attempting automatic refresh...');
        
        try {
          const newAccessToken = await refreshHubSpotToken('a');
          console.log('✅ [AUTO_REFRESH] Token refreshed, retrying request with new token...');
          
          // Retry the request with the new token directly
          response = await fetch(`/api/hubspot/schema/${objectKey}?propertyType=custom`, {
            headers: {
              'Authorization': `Bearer ${newAccessToken}`,
              'X-User-ID': profile.id,
              'X-Portal-ID': profile.hubspot_portal_id_a.toString()
            }
          });
        } catch (refreshError) {
          console.error('❌ [AUTO_REFRESH] Failed to refresh token:', refreshError);
          throw new Error('HubSpot access token has expired and could not be refreshed. Please reconnect your HubSpot account.');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        
        if (response.status === 401) {
          if (errorData.hubspot?.category === 'EXPIRED_AUTHENTICATION') {
            throw new Error('HubSpot access token has expired. Please reconnect your HubSpot account.');
          } else if (errorData.hubspot?.message) {
            throw new Error(`HubSpot authentication error: ${errorData.hubspot.message}`);
          } else {
            throw new Error('HubSpot authentication failed. Please check your connection and try again.');
          }
        } else if (response.status === 403) {
          throw new Error('Insufficient permissions to access HubSpot properties. Please check your HubSpot app permissions.');
        } else {
          throw new Error(`HubSpot API error (${response.status}): ${errorData.message || response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (data.ok && data.data?.results) {
        const customProps = data.data.results.map((prop: any) => ({
          value: prop.name,
          label: prop.label || prop.name,
          name: prop.name,
          type: prop.type,
          description: prop.description,
          hubspotDefined: prop.hubspotDefined,
          // IMPORTANT: Add object type validation
          objectType: objectKey
        }));
        
        setCustomProperties(customProps);
      } else {
        throw new Error(data.message || 'Failed to fetch custom properties');
      }
    } catch (error) {
      console.error('❌ Error fetching custom properties:', error);
      setCustomPropsError(error instanceof Error ? error.message : 'Failed to fetch custom properties');
    } finally {
      setLoadingCustomProps(false);
    }
  }, [objectKey, profile, refreshHubSpotToken]);
  
  // Save custom properties to localStorage whenever they change
  React.useEffect(() => {
    if (customProperties.length > 0) {
      const cacheKey = `customProperties_${objectKey}`;
      localStorage.setItem(cacheKey, JSON.stringify(customProperties));
    }
  }, [customProperties, objectKey]);
  
  // Clear cache when component unmounts or object changes
  React.useEffect(() => {
    return () => {
      // Clean up when component unmounts
      console.log('🧹 [CLEANUP] Component unmounting, clearing custom properties for', objectKey);
    };
  }, [objectKey]);
  
  // Clear properties when object type changes
  React.useEffect(() => {
    setCustomProperties([]);
    setCustomPropsError(null);
  }, [objectKey]);
  
  // Maintain focus on search input
  const maintainFocus = React.useCallback(() => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, []);
  
  // Filter properties based on search term and remove technical properties
  const filteredPropsA = React.useMemo(() => {
    if (!searchTerm.trim()) {
      // Show only user-friendly properties when no search
      return (propsA || []).filter(p => {
        // Remove properties where label is same as name (technical properties)
        return p.label !== p.name;
      });
    }
    
    const searchLower = searchTerm.trim().toLowerCase();
    
    return (propsA || []).filter(p => {
      // Remove technical properties
      if (p.label === p.name) return false;
      
      const labelLower = p.label.toLowerCase();
      return labelLower.includes(searchLower);
    });
  }, [propsA, searchTerm]);
  
  const update = React.useCallback((idx: number, side: "a" | "b", value?: string) => {
    try {
      const next = rows.slice();
      const r = { ...next[idx] };
      if (side === "a") {
        r.a = value;
        r.error = undefined; // Clear error when updating
      } else {
        r.b = value;
        r.error = undefined; // Clear error when updating
      }
      next[idx] = r;
      setRows(next);
    } catch (error) {
      console.error("❌ Error updating mapping row:", error);
    }
  }, [rows, setRows]);

  const addRow = React.useCallback(() => {
    try {
      const newRow: MappingRow = { 
        id: `row-${Date.now()}-${Math.random()}`, 
        a: undefined, 
        b: undefined 
      };
      setRows([...rows, newRow]);
    } catch (error) {
      console.error("❌ Error adding mapping row:", error);
    }
  }, [rows, setRows]);

  // removeRow function removed as it's not being used in the current UI

  const validateRows = React.useCallback(() => {
    const errors: string[] = [];
    
    rows.forEach((row, idx) => {
      if (row.required && !row.b && row.b !== "__skip__") {
        errors.push(`Row ${idx + 1}: Required field must be mapped`);
      }
      if (row.fixed && !row.aFixed) {
        errors.push(`Row ${idx + 1}: Fixed field must have a value`);
      }
    });

    if (onValidationError) {
      onValidationError(errors);
    }

    return errors.length === 0;
  }, [rows, onValidationError]);

  const renderFixedSelect = React.useCallback((row: MappingRow, propsA: PropertyOption[]) => {
    try {
      const resolved = propsA.find(
        (p) =>
          p.value === row.aFixed ||
          p.label === row.aFixed ||
          p.value === row.a
      );

      // If not found, use a sentinel so SelectValue can render the label consistently
      const sentinel = "__fixed_a__";
      const valueForSelect = resolved
        ? resolved.value
        : sentinel;

      return (
        <Select value={valueForSelect} disabled>
          <SelectTrigger className="w-full cursor-not-allowed pointer-events-none opacity-80">
            <SelectValue />
          </SelectTrigger>
                                                                       <SelectContent>
                                                        {propsA
                               .filter(p => p.label !== p.name) // Remove technical properties
                               .sort((a, b) => a.label.localeCompare(b.label))
                               .map((p) => (
                                 <SelectItem key={p.value} value={p.value}>
                                   {p.label || p.value}
                                   {p.required && <span className="text-red-500 ml-1">*</span>}
                                 </SelectItem>
                               ))}
                           {!resolved && (
                             <SelectItem value={sentinel} disabled>
                               {row.aFixed ?? "—"}
                             </SelectItem>
                           )}
                         </SelectContent>
        </Select>
      );
    } catch (error) {
      console.error("❌ Error rendering fixed select:", error);
      return <div className="text-red-500">Error rendering field</div>;
    }
  }, []);

  // Validate rows when they change
  React.useEffect(() => {
    validateRows();
  }, [rows, validateRows]);
  
  // Maintain focus on search input when search term changes
  React.useEffect(() => {
    if (searchTerm !== "") {
      maintainFocus();
    }
  }, [searchTerm, maintainFocus]);

  if (!propsA || !propsB) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: Properties not loaded
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-[var(--migratio_white)]">
        <div className="flex items-center justify-center gap-6 px-4 py-3 border-b">
          <div className="font-medium">Field Configuration</div>
        </div>

        <ScrollArea className="max-h-[52vh] overflow-auto">
          <div className="p-4 space-y-3">
            {rows.map((row, idx) => {
              const isFixed = !!row.fixed;
              return (
                <div
                  key={row.id || idx}
                  className={`w-full rounded-md border p-3 ${
                    row.error ? 'border-red-300 bg-red-50' : ''
                  }`}
                >
                  {/* LEFT (A) */}
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm text-[var(--migratio_text)]">
                        Default Properties
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">
                        {propsA.length} properties
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                         Locked
                       </span>
                      {row.required && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                          Required
                        </span>
                      )}
                    </div>

                                         {isFixed ? (
                       // Non-editable Select that still looks like a dropdown
                       renderFixedSelect(row, propsA)
                     ) : (
                                               // Editable when not fixed
                                                 <Select
                           value={row.a && row.a !== "" ? row.a : undefined}
                           onValueChange={(v) => {
                             update(idx, "a", v);
                             setSearchTerm(""); // Clear search when selecting
                           }}
                         >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="See Property List" />
                          </SelectTrigger>
                                                     <SelectContent>
                                                            <div className="sticky top-0 bg-white z-10 p-2 border-b">
                                 <input
                                   ref={searchInputRef}
                                   type="text"
                                   placeholder="Search property..."
                                   value={searchTerm}
                                   onChange={(e) => {
                                     e.stopPropagation();
                                     setSearchTerm(e.target.value);
                                   }}
                                   onKeyDown={(e) => {
                                     e.stopPropagation();
                                     // Prevent dropdown from closing on key press
                                     if (e.key === "Escape") {
                                       e.preventDefault();
                                     }
                                   }}
                                   className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   autoFocus
                                 />
                               </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                                             {filteredPropsA.length > 0 ? (
                                 filteredPropsA
                                   .sort((a, b) => a.label.localeCompare(b.label))
                                   .map((p) => (
                                     <SelectItem key={p.value} value={p.value}>
                                       {p.label || p.value}
                                       {p.required && <span className="text-red-500 ml-1">*</span>}
                                     </SelectItem>
                                   ))
                              ) : (
                                <div className="p-3 text-center text-gray-400 text-sm">
                                  <div className="mb-2">📋 See Property List</div>
                                  <div className="text-xs">Start typing to search properties</div>
                                </div>
                              )}
                            </div>
                          </SelectContent>
                        </Select>
                     )}

                                                              {/* Error display */}
                     {row.error && (
                       <div className="text-red-500 text-xs mt-1">
                         {row.error}
                       </div>
                     )}
                   </div>

                                     </div>
                );
              })}
            </div>
          </ScrollArea>

                                           {/* Fetch Custom Property Button - Only show when no custom properties loaded */}
                      {customProperties.length === 0 && !loadingCustomProps && (
                        <div className="flex justify-center pb-4 space-x-2">
                          <button
                            type="button"
                            className="text-sm text-[var(--migratio_text)] px-4 py-2 rounded border hover:bg-[var(--migratio_bg_light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={fetchCustomProperties}
                            disabled={loadingCustomProps || refreshingToken}
                          >
                            {refreshingToken ? 'Refreshing Token...' : 'Fetch Custom Property'}
                          </button>
                          
                          {/* Show reconnect button if there's an authentication error (Admin Only) */}
                          {customPropsError && !refreshingToken && isUserAdmin(user?.email) && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                ADMIN
                              </span>
                              <button
                                type="button"
                                className="text-sm text-blue-600 px-4 py-2 rounded border border-blue-300 hover:bg-blue-50 transition-colors"
                                onClick={() => {
                                  console.log('🔗 [RECONNECT] Admin reconnecting HubSpot for', objectKey);
                                  // Redirect to dashboard step 2 to reconnect HubSpot
                                  window.location.href = '/dashboard/2';
                                }}
                              >
                                Reconnect HubSpot
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Clear Cache Button - Show when there are custom properties (Admin Only) */}
                      {customProperties.length > 0 && isUserAdmin(user?.email) && (
                        <div className="flex justify-center pb-4 space-x-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              ADMIN
                            </span>
                            <button
                              type="button"
                              className="text-sm text-gray-600 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                console.log('🧹 [MANUAL_CLEAR] Admin clearing cache for', objectKey);
                                localStorage.removeItem(`customProperties_${objectKey}`);
                                setCustomProperties([]);
                                setCustomPropsError(null);
                              }}
                            >
                              Clear Cache
                            </button>
                          </div>
                        </div>
                      )}
                      


                      {/* Loading State */}
                      {loadingCustomProps && (
                        <div className="border-t pt-4">
                          <div className="text-center text-blue-600 text-sm p-4">
                            🔄 Fetching custom properties...
                          </div>
                        </div>
                      )}
                      
                      {/* Token Refresh State */}
                      {refreshingToken && (
                        <div className="border-t pt-4">
                          <div className="text-center text-amber-600 text-sm p-4">
                            🔄 Refreshing HubSpot access token...
                          </div>
                        </div>
                      )}
                      
                                                                    {/* Custom Properties Display */}
                       {!loadingCustomProps && customProperties.length > 0 && (
                        <div className="p-4 space-y-3">
                         <div className="w-full rounded-md border p-3">
                           {/* Custom Property Header */}
                           <div className="flex items-center gap-2 mb-3">
                             <div className="text-sm text-[var(--migratio_text)]">
                               Custom Properties
                             </div>
                                                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                   {customProperties.length} properties
                                 </span>
                                 <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/15 text-gray-400 border border-gray-500/30">
                                   Cached
                                 </span>
                           </div>

                           {/* All Custom Properties in One List */}
                           <div className="space-y-2">
                             {customProperties.map((prop) => (
                               <div
                                 key={prop.value}
                                 className="text-sm font-medium text-[var(--migratio_text)] px-4 py-2 bg-gray-50 rounded border"
                               >
                                 {prop.label || prop.name}
                               </div>
                             ))}
                           </div>
                         </div>
                         </div>
                       )}

                      {/* Error Display for Custom Properties */}
                      {customPropsError && (
                        <div className="text-center text-red-500 text-sm p-2 bg-red-50 rounded border">
                          ❌ {customPropsError}
                        </div>
                      )}
        </div>

              <div className="text-sm text-neutral-500">
         Mapping Summary:{" "}
         {
           rows.filter((r) => r.a && r.a !== "").length
         }{" "}
         properties configured
       </div>
    </div>
  );
}