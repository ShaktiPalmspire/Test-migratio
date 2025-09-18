import type { ObjectKey } from "@/components/Mapping/MappingModal";

// Dashboard-specific types
export type CrmId = "pipedrive" | "hubspot" | "zoho" | "zendesk";
export type StepIndex = 1 | 2 | 3 | 4 | 5;

// CRM configuration interface
export interface CrmConfig {
  title: string;
  subtitle: string;
  logo: string;
  connectUrl: string;
}

// Data type definition for Step 3
export interface DataTypeDef {
  key: ObjectKey;
  title: string;
  subtitle: string;
  logo: string;
  countBadge?: string;
}

// HubSpot status interface
export interface HubSpotStatus {
  connected: boolean;
  portalId: number | null;
}

// Dashboard state interface
export interface DashboardState {
  step: StepIndex | null;
  selectedId: CrmId | null;
  error: string | null;
  hubspotStatusA: HubSpotStatus;
  hubspotStatusB: HubSpotStatus;
  connectionLoading: boolean;
  selectedObjects: Set<ObjectKey>;
  mappingOpen: boolean;
  modalObject: ObjectKey | null;
  objectRows: Record<ObjectKey, any[]>;
}

// Props interfaces for components
export interface Step1Props {
  selectedId: CrmId | null;
  onSelectCrm: (id: CrmId) => void;
  onNext: () => void;
}

export interface Step2Props {
  selectedId: CrmId | null;
  hubspotStatusA: HubSpotStatus;
  hubspotStatusB: HubSpotStatus;
  connectionLoading: boolean;
  isAdmin: boolean;
  onConnect: (instance: "a" | "b") => Promise<void>;
  onRefreshProfile: () => Promise<void>;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export interface Step3Props {
  selectedObjects: Set<ObjectKey>;
  onToggleObject: (key: ObjectKey) => void;
  onBack: () => void;
  onConfigureMapping: () => void;
  hasAnyObjectSelected: boolean;
}

// Error state interface
export interface ErrorState {
  hasError: boolean;
  error: string | null;
  onRetry: () => void;
}