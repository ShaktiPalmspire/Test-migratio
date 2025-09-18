import React, { useEffect, useState } from "react";
import DataTypeCard from "@/components/SelectableCards/DataTypeCard";
import Button from "@/components/Buttons/button";
import Heading from "@/components/Headings/heading";
import { DATA_TYPES } from "../types/constants";
import type { Step3Props } from "../types";
import { useUser } from "@/context/UserContext";
import { ensureValidToken } from "@/utils/cacheUtils";

// Import default properties
import { 
  hubspotContactProperties, 
  hubspotCompanyProperties, 
  hubspotDealProperties, 
  hubspotTicketProperties 
} from "@/context/hubspotdefaultproperties";

// Types for properties
interface PropertyOption {
  value: string;
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
  description?: string;
  hubspotDefined?: boolean;
  objectType?: string;
}

interface PropertyCategory {
  name: string;
  properties: PropertyOption[];
}

/**
 * Step 3: Data Selection Component
 * Allows users to select which data types to migrate and shows all properties
 */
export function Step3DataSelection({
  selectedObjects,
  onToggleObject,
  onBack,
  onConfigureMapping,
  hasAnyObjectSelected,
}: Step3Props) {
  const { profile } = useUser();
  const [propertiesData, setPropertiesData] = useState<Record<string, PropertyCategory[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Default properties mapping
  const defaultPropertiesMap = {
    contacts: hubspotContactProperties,
    companies: hubspotCompanyProperties,
    deals: hubspotDealProperties,
    tickets: hubspotTicketProperties,
  };

  // Fetch custom properties for a specific object type
  const fetchCustomProperties = async (objectType: string) => {
    if (!profile?.hubspot_access_token_a) {
      console.log('No HubSpot token available for', objectType);
      return [];
    }

    try {
      setLoading(prev => ({ ...prev, [objectType]: true }));
      
      // Use the frontend API route to fetch custom properties
      // Ensure token validity (auto-refresh if needed)
      try {
        if (profile?.id) {
          await ensureValidToken(profile as any, profile.id as any, 'a');
        }
      } catch {}
      const response = await fetch(`/api/hubspot/schema/${objectType}?propertyType=custom`, {
        headers: {
          'Authorization': `Bearer ${profile.hubspot_access_token_a}`,
          'X-User-ID': profile.id,
          'X-Portal-ID': String(profile.hubspot_portal_id_a || '')
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.properties) {
        // Filter out default properties and only keep custom ones
        const customProps = data.properties
          .filter((prop: any) => !prop.hubspotDefined)
          .map((prop: any) => ({
            value: prop.name,
            label: prop.label || prop.name,
            name: prop.name,
            type: prop.type,
            required: prop.required || false,
            description: prop.description,
            hubspotDefined: false,
            objectType
          }));
        
        return customProps;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching custom properties for ${objectType}:`, error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, [objectType]: false }));
    }
  };

  // Load properties when selectedObjects change
  useEffect(() => {
    const loadProperties = async () => {
      const newPropertiesData: Record<string, PropertyCategory[]> = {};
      
      for (const objectType of selectedObjects) {
        const defaultProps = defaultPropertiesMap[objectType as keyof typeof defaultPropertiesMap] || [];
        
        // Convert default properties to PropertyOption format
        const defaultProperties: PropertyOption[] = defaultProps.map(prop => ({
          value: prop.name,
          label: prop.label,
          name: prop.name,
          type: 'string', // Default type
          required: false,
          hubspotDefined: true,
          objectType
        }));

        // Fetch custom properties
        const customProperties = await fetchCustomProperties(objectType);
        
        newPropertiesData[objectType] = [
          {
            name: 'Default Properties',
            properties: defaultProperties
          },
          {
            name: 'Custom Properties',
            properties: customProperties
          }
        ];
      }
      
      setPropertiesData(newPropertiesData);
    };

    if (selectedObjects.size > 0) {
      loadProperties();
    } else {
      setPropertiesData({});
    }
  }, [selectedObjects, profile?.hubspot_access_token_a, profile?.id, profile?.hubspot_portal_id_a]);

  return (
    <>
      <Heading as="h2" className="mt-8">
        Select Data to Migrate
      </Heading>
      
      <p className="text-[var(--migratio_text)] mt-2">
        Choose the data types you want to migrate from HubSpot CRM A to HubSpot CRM B.
      </p>
      
      <Button variant="with_arrow" onClick={onBack}>
        Back
      </Button>
      
      <div className="flex flex-wrap gap-4 mt-6">
        {DATA_TYPES.map((dataType) => (
          <DataTypeCard
            key={dataType.key}
            title={dataType.title}
            subtitle={dataType.subtitle}
            isSelected={selectedObjects.has(dataType.key)}
            onSelect={() => onToggleObject(dataType.key)}
          />
        ))}
      </div>

      {/* Properties Display Section */}
      {selectedObjects.size > 0 && (
        <div className="mt-8">
          <Heading as="h3" className="text-lg font-semibold mb-4">
            Available Properties for Selected Objects
          </Heading>
          
          {Object.entries(propertiesData).map(([objectType, categories]) => (
            <div key={objectType} className="mb-8">
              <h4 className="text-md font-medium text-gray-700 mb-3 capitalize">
                {objectType} Properties
              </h4>
              
              {categories.map((category, index) => (
                <div key={index} className="mb-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">
                    {category.name} ({category.properties.length})
                  </h5>
                  
                  {loading[objectType] ? (
                    <div className="text-sm text-gray-500">Loading properties...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {category.properties.map((prop) => (
                        <div 
                          key={prop.value} 
                          className="p-2 bg-gray-50 rounded border text-xs"
                        >
                          <div className="font-medium">{prop.label}</div>
                          <div className="text-gray-500">{prop.name}</div>
                          {prop.type && (
                            <div className="text-gray-400">Type: {prop.type}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Button
          variant="primary"
          disabled={!hasAnyObjectSelected}
          onClick={onConfigureMapping}
        >
          Next
        </Button>
      </div>
    </>
  );
}