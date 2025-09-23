import { useState, useCallback, useRef, useEffect } from "react";
import type { 
  CrmId, 
  StepIndex, 
  HubSpotStatus, 
  DashboardState 
} from "../types";
import type { ObjectKey } from "@/components/Mapping/MappingModal";
import type { MappingRow } from "@/components/Mapping/MappingContent";
import { STORAGE_KEYS } from "../types/constants";

// Initial state
const initialHubSpotStatus: HubSpotStatus = {
  connected: false,
  portalId: null,
};

// Error boundary for localStorage operations
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${error}`);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`Failed to set item in localStorage: ${error}`);
      throw new Error("Storage quota exceeded or storage is disabled");
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to remove item from localStorage: ${error}`);
    }
  }
};

// Validation functions
const isValidCrmId = (id: string | null): id is CrmId => {
  return id !== null && ["hubspot", "pipedrive", "zoho", "zendesk"].includes(id);
};

const isValidStepIndex = (step: number | null): step is StepIndex => {
  return step !== null && step >= 0 && step <= 3; // Adjust based on your actual step range
};

/**
 * Custom hook for managing dashboard state with improved error handling and performance
 */
export function useDashboardState() {
  // Core state
  const [step, setStep] = useState<StepIndex | null>(null);
  const [selectedId, setSelectedId] = useState<CrmId | null>(null);
  const [error, setError] = useState<string | null>(null);

  // HubSpot connection states
  const [hubspotStatusA, setHubspotStatusA] = useState<HubSpotStatus>(initialHubSpotStatus);
  const [hubspotStatusB, setHubspotStatusB] = useState<HubSpotStatus>(initialHubSpotStatus);
  const [connectionLoading, setConnectionLoading] = useState(false);

  // Step 3 selections (which data types are ticked)
  const [selectedObjects, setSelectedObjects] = useState<Set<ObjectKey>>(new Set());

  // Mapping modal state
  const [mappingOpen, setMappingOpen] = useState(false);
  const [modalObject, setModalObject] = useState<ObjectKey | null>(null);
  const [objectRows, setObjectRows] = useState<Record<ObjectKey, MappingRow[]>>({} as Record<ObjectKey, MappingRow[]>);
  
  // Track if we've loaded initial data
  const hasLoadedRef = useRef(false);

  // Error handler utility
  const handleError = useCallback((operation: string, error: unknown, userMessage?: string) => {
    console.error(`❌ Error during ${operation}:`, error);
    setError(userMessage || `Failed to complete ${operation}. Please try again.`);
    
    // For production, you might want to send this to an error reporting service
    // logErrorToService(operation, error);
  }, []);

  // CRM selection handler
  const handleSelectCrm = useCallback((id: CrmId) => {
    try {
      setSelectedId(id);
      safeLocalStorage.setItem(STORAGE_KEYS.SELECTED_INTEGRATION, id);
    } catch (error) {
      handleError("CRM selection", error);
    }
  }, [handleError]);

  // Step change handler
  const handleStepChange = useCallback((next: StepIndex) => {
    try {
      setStep(next);
      safeLocalStorage.setItem(STORAGE_KEYS.SELECTED_STEP, String(next));
    } catch (error) {
      handleError("step change", error);
    }
  }, [handleError]);

  // Object selection toggle
  const toggleObject = useCallback((key: ObjectKey) => {
    try {
      setSelectedObjects((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        
        safeLocalStorage.setItem(STORAGE_KEYS.SELECTED_OBJECTS, JSON.stringify([...next]));
        return next;
      });
    } catch (error) {
      handleError("object toggle", error);
    }
  }, [handleError]);

  // Batch object selection
  const setSelectedObjectsBatch = useCallback((keys: ObjectKey[]) => {
    try {
      setSelectedObjects(new Set(keys));
      safeLocalStorage.setItem(STORAGE_KEYS.SELECTED_OBJECTS, JSON.stringify(keys));
    } catch (error) {
      handleError("batch object selection", error);
    }
  }, [handleError]);

  // Modal object switching
  const handleSwitchObject = useCallback((next: ObjectKey, currentRows: MappingRow[]) => {
    try {
      if (modalObject) {
        setObjectRows((prev) => ({ ...prev, [modalObject]: currentRows }));
      }
      setModalObject(next);
    } catch (error) {
      handleError("object switch", error);
    }
  }, [modalObject, handleError]);

  // Save mappings
  const handleSaveMappings = useCallback(async (rows: MappingRow[]) => {
    try {
      if (!modalObject) return;
      
      const key = `${STORAGE_KEYS.MAPPINGS_PREFIX}${modalObject}`;
      safeLocalStorage.setItem(key, JSON.stringify(rows));
      
      setObjectRows((prev) => ({ ...prev, [modalObject]: rows }));
      setMappingOpen(false);
    } catch (error) {
      handleError("mapping save", error);
    }
  }, [modalObject, handleError]);

  // Load saved data from localStorage
  const loadSavedData = useCallback(() => {
    try {
      if (hasLoadedRef.current) return;
      
      // Load saved CRM selection
      const savedCrm = safeLocalStorage.getItem(STORAGE_KEYS.SELECTED_INTEGRATION);
      if (isValidCrmId(savedCrm)) {
        setSelectedId(savedCrm);
      }

      // Load saved step
      const savedStep = safeLocalStorage.getItem(STORAGE_KEYS.SELECTED_STEP);
      const stepNum = savedStep ? parseInt(savedStep, 10) : null;
      if (isValidStepIndex(stepNum)) {
        setStep(stepNum);
      }

      // Load saved objects for Step 3
      const savedObjects = safeLocalStorage.getItem(STORAGE_KEYS.SELECTED_OBJECTS);
      if (savedObjects) {
        try {
          const parsed = JSON.parse(savedObjects) as ObjectKey[];
          setSelectedObjects(new Set(parsed));
        } catch (parseError) {
          console.warn("Failed to parse saved objects:", parseError);
          safeLocalStorage.removeItem(STORAGE_KEYS.SELECTED_OBJECTS);
        }
      }

      // Load saved mappings for all objects
      const mappingKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(STORAGE_KEYS.MAPPINGS_PREFIX)
      );
      
      const loadedMappings: Record<ObjectKey, MappingRow[]> = {} as Record<ObjectKey, MappingRow[]>;
      
      mappingKeys.forEach(key => {
        try {
          const objectKey = key.replace(STORAGE_KEYS.MAPPINGS_PREFIX, '') as ObjectKey;
          const storedValue = safeLocalStorage.getItem(key);
          if (storedValue) {
            loadedMappings[objectKey] = JSON.parse(storedValue);
          }
        } catch (error) {
          console.warn(`Failed to parse mapping for key ${key}:`, error);
          safeLocalStorage.removeItem(key);
        }
      });
      
      setObjectRows(loadedMappings);
      
      hasLoadedRef.current = true;
    } catch (error) {
      handleError("data loading", error, "Failed to load saved data");
    }
  }, [handleError]);

  // Clear all saved data
  const clearAllData = useCallback(() => {
    try {
      // Clear state
      setStep(null);
      setSelectedId(null);
      setSelectedObjects(new Set());
      setObjectRows({} as Record<ObjectKey, MappingRow[]>);
      
      // Clear localStorage
      safeLocalStorage.removeItem(STORAGE_KEYS.SELECTED_INTEGRATION);
      safeLocalStorage.removeItem(STORAGE_KEYS.SELECTED_STEP);
      safeLocalStorage.removeItem(STORAGE_KEYS.SELECTED_OBJECTS);
      
      // Clear all mappings
      const mappingKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(STORAGE_KEYS.MAPPINGS_PREFIX)
      );
      
      mappingKeys.forEach(key => {
        safeLocalStorage.removeItem(key);
      });
    } catch (error) {
      handleError("data clearance", error);
    }
  }, [handleError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect to load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  return {
    // State
    step,
    selectedId,
    error,
    hubspotStatusA,
    hubspotStatusB,
    connectionLoading,
    selectedObjects,
    mappingOpen,
    modalObject,
    objectRows,

    // State setters (for external updates like from API calls)
    setStep,
    setError,
    setHubspotStatusA,
    setHubspotStatusB,
    setConnectionLoading,
    setMappingOpen,
    setModalObject,
    setSelectedObjects,

    // Handlers
    handleSelectCrm,
    handleStepChange,
    toggleObject,
    setSelectedObjectsBatch,
    handleSwitchObject,
    handleSaveMappings,
    loadSavedData,
    clearAllData,
    clearError,
  };
}