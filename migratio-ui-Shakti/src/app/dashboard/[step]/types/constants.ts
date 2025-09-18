import type { CrmId, CrmConfig, DataTypeDef } from "./dashboard";

// CRM configuration data
export const CRM_DATA: Record<CrmId, CrmConfig> = {
  hubspot: {
    title: "Hubspot CRM",
    subtitle: "Sales CRM Platform",
    logo: "../Logos/Hubspot.svg",
    connectUrl: `${process.env.NEXT_PUBLIC_DOMAIN_BACKEND}hubspot/install`,
  },
  pipedrive: {
    title: "Pipedrive",
    subtitle: "Sales CRM Platform",
    logo: "../Logos/Pipedrive.svg",
    connectUrl: `${process.env.NEXT_PUBLIC_DOMAIN_BACKEND}pipedrive/install`,
  },
  zoho: {
    title: "Zoho CRM",
    subtitle: "Sales CRM Platform",
    logo: "../Logos/Zoho.svg",
    connectUrl: `${process.env.NEXT_PUBLIC_DOMAIN_BACKEND}zoho/install`,
  },
  zendesk: {
    title: "Zendesk CRM",
    subtitle: "Sales CRM Platform",
    logo: "../Logos/Zendesk.svg",
    connectUrl: `${process.env.NEXT_PUBLIC_DOMAIN_BACKEND}zendesk/install`,
  },
};

// Data types for Step 3 selection
export const DATA_TYPES: DataTypeDef[] = [
  {
    key: "contacts",
    title: "Contacts",
    subtitle: "Individual contact records",
    logo: "../Logos/Contacts.svg",
  },
  {
    key: "companies",
    title: "Companies",
    subtitle: "Organizations / accounts",
    logo: "../Logos/Companies.svg",
  },
  {
    key: "deals",
    title: "Deals",
    subtitle: "Pipelines & stages",
    logo: "../Logos/Deals.svg",
  },
  {
    key: "tickets",
    title: "Tickets",
    subtitle: "Customer support tickets",
    logo: "../Logos/Tickets.svg",
  },
];

// Default admin emails (can be overridden by environment variable)
export const DEFAULT_ADMIN_EMAILS = ["admin@example.com"];

// Connection popup configuration
export const POPUP_CONFIG = {
  width: 600,
  height: 700,
  features: "scrollbars=yes,resizable=yes",
  timeout: 300000, // 5 minutes
};

// Local storage keys
export const STORAGE_KEYS = {
  SELECTED_INTEGRATION: "selectedIntegration",
  SELECTED_STEP: "selectedStep",
  SELECTED_OBJECTS: "selectedObjects",
  MAPPINGS_PREFIX: "mappings:",
} as const;