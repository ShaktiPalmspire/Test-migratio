export type ObjectKey = "contacts" | "companies" | "deals" | "tickets";

export interface PropertyItem {
  name: string;
  label: string;
  type?: string;
  fieldType?: string;
}

export interface PreviewRow {
  object: ObjectKey;
  source: string;
  target: string;
  type: "default" | "custom" | "userdefined";
  isEditing?: boolean;
  originalTarget?: string;
  originalSource?: string;
}

export interface CustomPropertiesState {
  contacts: any[];
  companies: any[];
  deals: any[];
  tickets: any[];
}

export interface PendingJsonState {
  contacts?: Record<string, {
    targetLabel: string;
    targetName?: string;
    sourceLabel?: string;
    newProperty?: boolean;
    type: "custom" | "userdefined";
  }>;
  companies?: Record<string, {
    targetLabel: string;
    targetName?: string;
    sourceLabel?: string;
    newProperty?: boolean;
    type: "custom" | "userdefined";
  }>;
  deals?: Record<string, {
    targetLabel: string;
    targetName?: string;
    sourceLabel?: string;
    newProperty?: boolean;
    type: "custom" | "userdefined";
  }>;
  tickets?: Record<string, {
    targetLabel: string;
    targetName?: string;
    sourceLabel?: string;
    newProperty?: boolean;
    type: "custom" | "userdefined";
  }>;
}

export interface CreateFormState {
  label: string;
  name: string;
}

export interface EditFormState {
  target: string;
}

export interface PropPoolState {
  contacts: PropertyItem[] | null;
  companies: PropertyItem[] | null;
  deals: PropertyItem[] | null;
  tickets: PropertyItem[] | null;
}

export interface LoadedListsState {
  contacts: boolean;
  companies: boolean;
  deals: boolean;
  tickets: boolean;
}

export type CreateStatus = "idle" | "creating" | "created" | "error";
