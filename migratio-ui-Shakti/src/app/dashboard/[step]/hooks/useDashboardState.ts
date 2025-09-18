import { useState, useCallback } from "react";
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

/**
 * Custom hook for managing dashboard state
 * Handles all state management for the dashboard including steps, selections, and HubSpot status
 */
export function useDashboardState() {
  // Core state
  const [step, setStep] = useState<StepIndex | null>(null);
  const [selectedId, setSelectedId] = useState<CrmId | null>(null);
  const [error, setError] = useState<string | null>(null);

  // HubSpot connection states
  const [hubspotStatusA, setHubspotStatusA] = useState<HubSpotStatus>(initialHubSpotStatus);
  const [hubspotStatusB, setHubspotStatusB] = useState<HubSpotStatus>(initialHubSpotStatus);
  const [connectionLoading] = useState(false);

  // Step 3 selections (which data types are ticked)
  const [selectedObjects, setSelectedObjects] = useState<Set<ObjectKey>>(new Set());

  // Mapping modal state
  const [mappingOpen, setMappingOpen] = useState(false);
  const [modalObject, setModalObject] = useState<ObjectKey | null>(null);
  const [objectRows, setObjectRows] = useState<Record<ObjectKey, MappingRow[]>>({} as Record<ObjectKey, MappingRow[]>);

  // CRM selection handler
  const handleSelectCrm = useCallback((id: CrmId) => {
    try {
      setSelectedId(id);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SELECTED_INTEGRATION, id);
      }
    } catch (error) {
      console.error("❌ Error saving CRM selection:", error);
      setError("Failed to save CRM selection. Please try again.");
    }
  }, []);

  // Step change handler
  const handleStepChange = useCallback((next: StepIndex) => {
    try {
      setStep(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SELECTED_STEP, String(next));
      }
    } catch (error) {
      console.error("❌ Error changing step:", error);
      setError("Failed to change step. Please try again.");
    }
  }, []);

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
        
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.SELECTED_OBJECTS, JSON.stringify([...next]));
        }
        return next;
      });
    } catch (error) {
      console.error("❌ Error toggling object:", error);
      setError("Failed to update object selection. Please try again.");
    }
  }, []);

  // Modal object switching
  const handleSwitchObject = useCallback((next: ObjectKey, currentRows: MappingRow[]) => {
    try {
      if (modalObject) {
        setObjectRows((prev) => ({ ...prev, [modalObject]: currentRows }));
      }
      setModalObject(next);
    } catch (error) {
      console.error("❌ Error switching object:", error);
      setError("Failed to switch object. Please try again.");
    }
  }, [modalObject]);

  // Save mappings
  const handleSaveMappings = useCallback(async (rows: MappingRow[]) => {
    try {
      if (!modalObject) return;
      
      const key = `${STORAGE_KEYS.MAPPINGS_PREFIX}${modalObject}`;
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(rows));
      }
      
      setObjectRows((prev) => ({ ...prev, [modalObject]: rows }));
      setMappingOpen(false);
    } catch (error) {
      console.error("❌ Error saving mappings:", error);
      setError("Failed to save mappings. Please try again.");
    }
  }, [modalObject]);

  // Load saved data from localStorage
  const loadSavedData = useCallback(() => {
    try {
      if (typeof window === "undefined") return;

      // Load saved CRM selection
      const savedCrm = localStorage.getItem(STORAGE_KEYS.SELECTED_INTEGRATION);
      if (savedCrm && ["hubspot", "pipedrive", "zoho", "zendesk"].includes(savedCrm)) {
        setSelectedId(savedCrm as CrmId);
      }

      // Load saved objects for Step 3
      const savedObjects = localStorage.getItem(STORAGE_KEYS.SELECTED_OBJECTS);
      if (savedObjects) {
        try {
          const parsed = JSON.parse(savedObjects) as ObjectKey[];
          setSelectedObjects(new Set(parsed));
        } catch (parseError) {
          console.warn("Failed to parse saved objects:", parseError);
          localStorage.removeItem(STORAGE_KEYS.SELECTED_OBJECTS);
        }
      }
    } catch (error) {
      console.error("❌ Error loading saved data:", error);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
    setMappingOpen,
    setModalObject,

    // Handlers
    handleSelectCrm,
    handleStepChange,
    toggleObject,
    handleSwitchObject,
    handleSaveMappings,
    loadSavedData,
    clearError,
  };
}