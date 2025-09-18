import { useState, useEffect } from 'react';
import { ObjectKey, PreviewRow, PendingJsonState } from '../types/propertyTypes';
import { supabase } from '@/lib/supabaseClient';
import {
  hubspotContactProperties,
  hubspotCompanyProperties,
  hubspotDealProperties,
  hubspotTicketProperties,
} from '@/context/hubspotdefaultproperties';
import { getInternalNameForLabel } from '../utils/propertyUtils';

export const usePropertyMappings = (selectedObjects: Set<ObjectKey>, profile: any) => {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [pendingJson, setPendingJson] = useState<PendingJsonState>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

      // Debug: Log the actual structure of mappedChangesAll
      console.log('🔍 [LOAD_MAPPINGS] mappedChangesAll structure:', JSON.stringify(mappedChangesAll, null, 2));
      console.log('🔍 [LOAD_MAPPINGS] Profile data:', JSON.stringify(profile?.hubspot_crm_a_mapped_json, null, 2));

      Array.from(selectedObjects).sort((a, b) => {
        const order = { contacts: 0, companies: 1, deals: 2, tickets: 3 };
        return order[a] - order[b];
      }).forEach((objectType) => {
        // defaults
        let defaultProps: any[] = [];
        switch (objectType) {
          case "contacts":
            defaultProps = hubspotContactProperties;
            break;
          case "companies":
            defaultProps = hubspotCompanyProperties;
            break;
          case "deals":
            defaultProps = hubspotDealProperties;
            break;
          case "tickets":
            defaultProps = hubspotTicketProperties;
            break;
        }
        const mappedForObject: Record<string, any> = mappedChangesAll[objectType] || {};
        
        console.log('🔍 [LOAD_MAPPINGS] Processing objectType:', objectType);
        console.log('🔍 [LOAD_MAPPINGS] defaultProps count:', defaultProps.length);
        console.log('🔍 [LOAD_MAPPINGS] mappedForObject keys:', Object.keys(mappedForObject));
        console.log('🔍 [LOAD_MAPPINGS] mappedForObject for', objectType, ':', JSON.stringify(mappedForObject, null, 2));
        
        // First, load user-defined and custom properties (these should appear first)
        Object.entries(mappedForObject).forEach(([targetName, mapping]: [string, any]) => {
          console.log('🔍 [LOAD_MAPPINGS] Checking mapping:', { targetName, mapping });
          console.log('🔍 [LOAD_MAPPINGS] mapping type check:', mapping.type === "userdefined");
          console.log('🔍 [LOAD_MAPPINGS] mapping.type:', mapping.type);
          console.log('🔍 [LOAD_MAPPINGS] typeof mapping.type:', typeof mapping.type);
          console.log('🔍 [LOAD_MAPPINGS] mapping.newProperty:', mapping.newProperty);
          
          // Skip if this is already a default property mapping
          const isDefaultProperty = defaultProps.some(prop => 
            prop.name === targetName || 
            prop.label === targetName
          );
          
          // Additional check: if the source is a default property, but target is user-defined, still load it
          const isSourceDefaultProperty = defaultProps.some(prop => 
            mapping.sourceLabel === (prop.label || prop.name) ||
            mapping.sourceName === (prop.label || prop.name)
          );
          
          console.log('🔍 [LOAD_MAPPINGS] isDefaultProperty:', isDefaultProperty);
          console.log('🔍 [LOAD_MAPPINGS] isSourceDefaultProperty:', isSourceDefaultProperty);
          
          // Check if this is a user-defined property (either by type or by newProperty flag)
          const isUserDefined = mapping.type === "userdefined" || mapping.newProperty === true;
          
          console.log('🔍 [LOAD_MAPPINGS] isUserDefined check:', {
            typeCheck: mapping.type === "userdefined",
            newPropertyCheck: mapping.newProperty === true,
            finalResult: isUserDefined
          });
          
          // Load user-defined properties regardless of whether target is a default property
          if (isUserDefined) {
            console.log('🔍 [LOAD_MAPPINGS] Loading user-defined property:', { targetName, mapping });
            collected.push({
              object: objectType,
              source: mapping.sourceLabel || mapping.sourceName || targetName,
              target: mapping.targetLabel || mapping.targetName || targetName,
              type: "userdefined",
            });
          } else if (mapping.type === "custom") {
            // Load custom properties (these are existing properties with changed labels)
            console.log('🔍 [LOAD_MAPPINGS] Loading custom property:', { targetName, mapping });
            console.log('🔍 [LOAD_MAPPINGS] Custom property details:', {
              sourceLabel: mapping.sourceLabel,
              targetLabel: mapping.targetLabel,
              sourceName: mapping.sourceName,
              targetName: mapping.targetName,
              finalSource: mapping.sourceLabel || mapping.sourceName || targetName,
              finalTarget: mapping.targetLabel || mapping.sourceLabel || targetName
            });
            
            // Special check for test_property_contact
            if (targetName === 'test_property_contact') {
              console.log('🎯 [LOAD_MAPPINGS] Found test_property_contact!', {
                targetName,
                mapping,
                targetLabel: mapping.targetLabel,
                sourceLabel: mapping.sourceLabel
              });
            }
            
            collected.push({
              object: objectType,
              source: mapping.sourceLabel || mapping.sourceName || targetName,
              target: mapping.targetLabel || mapping.sourceLabel || targetName, // Prioritize targetLabel for display
              type: "custom",
            });
          } else {
            console.log('🔍 [LOAD_MAPPINGS] Skipping non-userdefined/custom property:', { targetName, mapping });
          }
        });

        // Then, load default properties (these should appear last)
        defaultProps.forEach((prop) => {
          const sourceLabel = prop.label || prop.name;
          const byLabel = mappedForObject[sourceLabel];
          const byName = Object.values(mappedForObject).find((m: any) => m?.sourceName === prop.name);
          const mapped = byLabel || byName;

          // Skip if this property is already loaded as custom or user-defined
          const alreadyLoaded = collected.some(row =>
            row.object === objectType &&
            (row.source === sourceLabel || row.source === prop.name) &&
            (row.type === 'custom' || row.type === 'userdefined')
          );

          if (alreadyLoaded) {
            console.log('🔍 [LOAD_MAPPINGS] Skipping default property (already loaded):', sourceLabel);
            return;
          }

          // Handle targetLabel: if it's explicitly false (dropdown selection), use the targetName or sourceLabel
          // If it's a string (custom property), use that string
          let targetDisplay = sourceLabel; // default fallback
          if (mapped) {
            if (mapped.targetLabel === false) {
              // For dropdown selections, use targetName if available, otherwise sourceLabel
              targetDisplay = mapped.targetName || sourceLabel;
            } else if (mapped.targetLabel) {
              // For custom properties, use the actual label
              targetDisplay = mapped.targetLabel;
            }
          }

          collected.push({
            object: objectType,
            source: sourceLabel,
            target: targetDisplay,
            type: mapped?.type === "userdefined" ? "userdefined" : mapped?.type === "custom" ? "custom" : "default",
          });
        });
      });

      console.log('🔍 [LOAD_MAPPINGS] Total rows loaded:', collected.length);
      console.log('🔍 [LOAD_MAPPINGS] Userdefined rows:', collected.filter(r => r.type === 'userdefined'));
      console.log('🔍 [LOAD_MAPPINGS] Custom rows:', collected.filter(r => r.type === 'custom'));
      console.log('🔍 [LOAD_MAPPINGS] Default rows:', collected.filter(r => r.type === 'default'));
      
      // Remove any duplicates based on source and object, but prioritize custom/userdefined over default
      const uniqueRows = collected.filter((row, index, self) => {
        const existingIndex = self.findIndex(r => r.source === row.source && r.object === row.object);
        if (existingIndex === index) return true; // First occurrence, keep it
        
        const existingRow = self[existingIndex];
        // If current row is custom/userdefined and existing is default, replace it
        if ((row.type === 'custom' || row.type === 'userdefined') && existingRow.type === 'default') {
          console.log('🔄 [LOAD_MAPPINGS] Replacing default with custom/userdefined:', {
            source: row.source,
            object: row.object,
            newType: row.type,
            oldType: existingRow.type
          });
          // Remove the default row and keep the custom/userdefined one
          self.splice(existingIndex, 1);
          return true;
        }
        
        // If both are same type, keep the first one
        if (row.type === existingRow.type) {
          return existingIndex === index;
        }
        
        // Otherwise, keep the current row
        return true;
      });
      
      console.log('🔍 [LOAD_MAPPINGS] After deduplication:', uniqueRows.length);
      console.log('🔍 [LOAD_MAPPINGS] Final rows to be set:', JSON.stringify(uniqueRows, null, 2));
      
      // Check if test_property_contact is in the final rows
      const testPropertyRow = uniqueRows.find(row => 
        row.source === 'Test Property Contact' || 
        row.target === 'Test Property Contact' ||
        row.source === 'test_property_contact' ||
        row.target === 'test_property_contact'
      );
      if (testPropertyRow) {
        console.log('🎯 [LOAD_MAPPINGS] test_property_contact found in final rows:', testPropertyRow);
      } else {
        console.log('❌ [LOAD_MAPPINGS] test_property_contact NOT found in final rows!');
      }
      
      setRows(uniqueRows);
    } catch (error) {
      console.error('❌ [LOAD_MAPPINGS] Error loading mappings:', error);
    }
  };

  return {
    rows,
    setRows,
    pendingJson,
    setPendingJson,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    loadMappings
  };
};
