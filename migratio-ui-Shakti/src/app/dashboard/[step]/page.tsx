"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import Card from "@/components/DashboardCards/cards";
import SelectableCard from "@/components/SelectableCards/SelectableCard";
import DataTypeCard from "@/components/SelectableCards/DataTypeCard";
import Button from "@/components/Buttons/button";
import Heading from "@/components/Headings/heading";
import { IconLayoutSidebar } from "@tabler/icons-react";
import StepperComponent from "@/components/Stepper/StepperComponent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Step4PreviewProperties } from "./components/Step4PreviewProperties";
import type { StepIndex } from "./types/dashboard";
import Step5CustomPropertySetup from "./components/Step5CustomPropertySetup";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { hubspotApi } from "@/lib/api";
import { toast } from "sonner"; // 👈 add

// Types
import type { MappingRow } from "@/components/Mapping/MappingContent";
import type { ObjectKey } from "@/components/Mapping/MappingModal";

// ---------- Types & constants ----------
type CrmId = "pipedrive" | "hubspot" | "zoho" | "zendesk";

const CRM_DATA: Record<
  CrmId,
  { title: string; subtitle: string; logo: string; connectUrl: string }
> = {
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

type DataTypeDef = {
  key: ObjectKey;
  title: string;
  subtitle: string;
  logo: string;
  countBadge?: string;
};

const DATA_TYPES: DataTypeDef[] = [
  { key: "contacts",  title: "Contacts",  subtitle: "Individual contact records", logo: "../Logos/Contacts.svg" },
  { key: "companies", title: "Companies", subtitle: "Organizations / accounts",   logo: "../Logos/Companies.svg" },
  { key: "deals",     title: "Deals",     subtitle: "Pipelines & stages",        logo: "../Logos/Deals.svg" },
  { key: "tickets",   title: "Tickets",   subtitle: "Customer support tickets",  logo: "../Logos/Tickets.svg" },
];

type Mapping = { source: string; target: string };
const mappings: Mapping[] = [
  { source: "Property A", target: "Target X" },
  { source: "Property B", target: "Target Y" },
  { source: "Property C", target: "Target Z" },
];

// ---------- Helpers ----------
async function ensureUserProfile(user: { id: string; email?: string }) {
  if (!user) return;
  try {
    const { error } = await supabase.from("profiles").upsert([{ id: user.id, email: user.email }]);
    if (error) throw error;
  } catch (error) {
    console.error("❌ Error in ensureUserProfile:", error);
    throw error;
  }
}

// ---------- Dashboard Component ----------
function DashboardContent() {
  const params = useParams();
  const router = useRouter();

  const [step, setStep] = useState<StepIndex | null>(null);
  const [selectedId, setSelectedId] = useState<CrmId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hubspotStatusA, setHubspotStatusA] = useState<{ connected: boolean; portalId: number | null; }>({ connected: false, portalId: null });
  const [hubspotStatusB, setHubspotStatusB] = useState<{ connected: boolean; portalId: number | null; }>({ connected: false, portalId: null });

  const [connectionLoading] = useState(false);

  // Step 3 selections (which data types are ticked)
  const [selectedObjects, setSelectedObjects] = useState<Set<ObjectKey>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedObjects");
      console.log('🔄 [INITIAL_STATE] Saved from localStorage:', saved);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ObjectKey[];
          console.log('📥 [INITIAL_STATE] Parsed objects:', parsed);
          return new Set(parsed);
        } catch (error) {
          console.error('❌ [INITIAL_STATE] Parse error:', error);
          localStorage.removeItem("selectedObjects");
        }
      }
    }
    console.log('📝 [INITIAL_STATE] Returning empty Set');
    return new Set();
  });

  // Cache mapping rows per object so switching doesn't lose edits
  const [objectRows, setObjectRows] = useState<Record<ObjectKey, MappingRow[]>>({} as Record<ObjectKey, MappingRow[]>);

  const { user, isLoading, profile, refreshProfile, loadSelectedObjects } = useUser();

  // Check if user is admin based on email
  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
    return adminEmails.some((e) => e.trim().toLowerCase() === user.email!.toLowerCase());
  }, [user?.email]);

  // ----- Redirect deactivated ASAP -----
  useEffect(() => {
    if (profile && (profile.status === "deactivated" || profile.status === "reactivation_requested")) {
      router.replace("/deactivated");
    }
  }, [profile, router]);

  // Ensure profile row exists
  useEffect(() => {
    if (user?.id) {
      ensureUserProfile(user).catch((e) => {
        console.error("❌ Failed to ensure user profile:", e);
        setError("Failed to initialize user profile. Please try refreshing the page.");
      });
    }
  }, [user]);

  // Sync HubSpot statuses from profile
  useEffect(() => {
    if (!profile) return;
    const statusA = { connected: !!profile.hubspot_portal_id_a && !!profile.hubspot_access_token_a, portalId: profile.hubspot_portal_id_a || null };
    const statusB = { connected: !!profile.hubspot_portal_id_b && !!profile.hubspot_access_token_b, portalId: profile.hubspot_portal_id_b || null };
    setHubspotStatusA(statusA);
    setHubspotStatusB(statusB);
  }, [profile]);

  // Debug localStorage on component mount
  useEffect(() => {
    console.log('🔍 [DEBUG] Component mounted');
    console.log('🔍 [DEBUG] localStorage selectedObjects:', localStorage.getItem('selectedObjects'));
    console.log('🔍 [DEBUG] localStorage selectedObjects_last:', localStorage.getItem('selectedObjects_last'));
    console.log('🔍 [DEBUG] Current selectedObjects state:', Array.from(selectedObjects));
  }, []);

  // Load selectedObjects from UserContext when profile loads
  useEffect(() => {
    if (profile && user) {
      console.log('🔄 [DASHBOARD] Profile loaded, loading selectedObjects from UserContext...');
      console.log('🔄 [DASHBOARD] Profile helper_json:', profile.helper_json);
      
      const loadedObjects = loadSelectedObjects();
      console.log('🔄 [DASHBOARD] Loaded objects array:', loadedObjects);
      console.log('🔄 [DASHBOARD] Loaded objects length:', loadedObjects.length);
      
      if (loadedObjects.length > 0) {
        console.log('📥 [DASHBOARD] Setting selectedObjects state:', loadedObjects);
        console.log('📥 [DASHBOARD] Creating Set from:', loadedObjects);
        const newSet = new Set(loadedObjects as ObjectKey[]);
        console.log('📥 [DASHBOARD] New Set size:', newSet.size);
        console.log('📥 [DASHBOARD] New Set values:', Array.from(newSet));
        setSelectedObjects(newSet);
      } else {
        console.log('📝 [DASHBOARD] No objects loaded, keeping current state');
      }
    }
  }, [profile, user, loadSelectedObjects]);

  // Parse step + restore selections
  useEffect(() => {
    try {
      const stepRaw = params?.step;
      const stepNum = Number(Array.isArray(stepRaw) ? stepRaw[0] : stepRaw);
      if (![1,2,3,4,5].includes(stepNum)) { router.replace("/dashboard/1"); return; }
      setStep(stepNum as StepIndex);

      const savedCrm = typeof window !== "undefined" ? localStorage.getItem("selectedIntegration") : null;
      if (savedCrm && savedCrm in CRM_DATA) setSelectedId(savedCrm as CrmId);

      const tryRestore = () => {
        const candidate = (typeof window !== "undefined" && (localStorage.getItem("selectedObjects") ?? localStorage.getItem("selectedObjects_backup")));
        console.log('🔄 [TRY_RESTORE] Step:', stepNum, 'Candidate:', candidate);
        if (!candidate) {
          console.log('📝 [TRY_RESTORE] No candidate found');
          return false;
        }
        try { 
          const parsed = JSON.parse(candidate) as ObjectKey[];
          console.log('📥 [TRY_RESTORE] Parsed objects:', parsed);
          setSelectedObjects(new Set(parsed)); 
          return true; 
        } catch (error) {
          console.error('❌ [TRY_RESTORE] Parse error:', error);
          return false; 
        }
      };
      if (stepNum === 3 || stepNum === 4 || stepNum === 5) tryRestore();
    } catch (e) {
      console.error("❌ Error parsing step:", e);
      setError("Failed to parse dashboard step. Please try refreshing the page.");
    }
  }, [params?.step, router]);

  useEffect(() => {
    const rehydrateFromStorage = () => {
      try {
        const candidate = localStorage.getItem("selectedObjects") ?? localStorage.getItem("selectedObjects_backup");
        if (candidate) setSelectedObjects(new Set(JSON.parse(candidate) as ObjectKey[]));
      } catch {}
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "selectedObjects" || e.key === "selectedObjects_backup") rehydrateFromStorage();
    };
    const onVisibility = () => { if (!document.hidden) rehydrateFromStorage(); };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    const onBeforeUnload = () => {
      try {
        const json = JSON.stringify(Array.from(selectedObjects));
        localStorage.setItem("selectedObjects", json);
        localStorage.setItem("selectedObjects_backup", json);
      } catch {}
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [selectedObjects]);

  // ----- Handlers -----
  const handleSelectCrm = useCallback((id: CrmId) => {
    try {
      setSelectedId(id);
      localStorage.setItem("selectedIntegration", id);
    } catch (e) {
      console.error("❌ Error saving CRM selection:", e);
      setError("Failed to save CRM selection. Please try again.");
    }
  }, []);

  const handleStepChange = useCallback((next: StepIndex) => {
    try {
      setStep(next);
      const json = JSON.stringify(Array.from(selectedObjects));
      localStorage.setItem("selectedObjects", json);
      localStorage.setItem("selectedObjects_last", json);
      localStorage.setItem("selectedStep", String(next));
      router.push(`/dashboard/${next}`);
    } catch (e) {
      console.error("❌ Error changing step:", e);
      setError("Failed to change step. Please try again.");
    }
  }, [router, selectedObjects]);

  const toggleObject = useCallback((key: ObjectKey) => {
    try {
      console.log('🔄 [TOGGLE_OBJECT] Toggling:', key);
      setSelectedObjects((prev) => {
        const next = new Set(prev);
        const wasSelected = next.has(key);
        if (wasSelected) {
          next.delete(key);
          console.log('📝 [TOGGLE_OBJECT] Removed:', key);
        } else {
          next.add(key);
          console.log('📥 [TOGGLE_OBJECT] Added:', key);
        }
        const json = JSON.stringify(Array.from(next));
        console.log('💾 [TOGGLE_OBJECT] Saving to localStorage:', json);
        localStorage.setItem("selectedObjects", json);
        localStorage.setItem("selectedObjects_backup", json);
        console.log('✅ [TOGGLE_OBJECT] Saved successfully');
        return next;
      });
    } catch (e) {
      console.error("❌ Error toggling object:", e);
      setError("Failed to update object selection. Please try again.");
    }
  }, []);

  const clearSelections = useCallback(() => {
    setSelectedObjects(new Set());
    localStorage.removeItem("selectedObjects");
  }, []);

  const selectAll = useCallback(() => {
    const allObjects: ObjectKey[] = ["contacts", "companies", "deals", "tickets"];
    setSelectedObjects(new Set(allObjects));
    localStorage.setItem("selectedObjects", JSON.stringify(allObjects));
  }, []);

  const handleConnect = async (instance: "a" | "b") => {
    try {
      if (user?.id) {
        const base = new URL(process.env.NEXT_PUBLIC_DOMAIN_BACKEND!);
        const popupUrl = new URL("hubspot/install", base);
        popupUrl.searchParams.set("instance", instance);
        popupUrl.searchParams.set("userId", user.id);

        const width = 600, height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top  = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          popupUrl.toString(),
          "hubspot-oauth",
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
        if (!popup || popup.closed) {
          toast.error("Popup was blocked! Please allow popups and try again.");
          return;
        }

        const onMessage = async (event: MessageEvent) => {
          try {
            if (event.data && event.data.portalId && event.data.instance && event.data.userId) {
              const { portalId, instance: portalInstance, userId } = event.data;
              const portalNum = Number(portalId) || null;
              const updateData =
                portalInstance === "a" ? { hubspot_portal_id_a: portalNum } : { hubspot_portal_id_b: portalNum };

              const upsertResult = await supabase.from("profiles").upsert([{ id: userId, ...updateData }]);
              if (upsertResult.error) throw new Error(upsertResult.error.message);

              if (refreshProfile) await refreshProfile();

              if (portalInstance === "a") {
                setHubspotStatusA({ connected: !!portalNum, portalId: portalNum });
              } else {
                setHubspotStatusB({ connected: !!portalNum, portalId: portalNum });
              }

              try { popup.close(); } catch {}
              window.removeEventListener("message", onMessage);
            }
          } catch (e: any) {
            console.error("❌ Error processing connection message:", e);
            toast.error(e?.message || "Failed to save HubSpot connection");
          }
        };

        window.addEventListener("message", onMessage);
        setTimeout(() => {
          try { if (popup && !popup.closed) popup.close(); } catch {}
          window.removeEventListener("message", onMessage);
        }, 300000);
      } else {
        window.location.href = `${CRM_DATA.hubspot.connectUrl}?instance=${instance}`;
      }
    } catch (e) {
      console.error("❌ Error in handleConnect:", e);
      setError("Failed to initiate connection. Please try again.");
    }
  };

  // 🔧 Core uninstall logic (no alerts) — returns success message
  const disconnectInstance = useCallback(
    async (instance: "a" | "b"): Promise<string> => {
      if (!user?.id) throw new Error("No user ID");
      const backendBase = process.env.NEXT_PUBLIC_DOMAIN_BACKEND || "http://localhost:3000/";

      // ensure backend session
      await fetch(`${backendBase}api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user.id }),
      });

      // uninstall via API helper
      const uninstallResult = await hubspotApi.uninstallApp(instance, user.id);
      if (!uninstallResult.success) throw new Error(uninstallResult.message || "Uninstall failed");

      // DB cleanup
      const update =
        instance === "a"
          ? { hubspot_portal_id_a: null, hubspot_refresh_token_a: null, hubspot_access_token_a: null }
          : { hubspot_portal_id_b: null, hubspot_refresh_token_b: null, hubspot_access_token_b: null };

      const result = await supabase.from("profiles").update(update).eq("id", user.id);
      if (result.error) throw new Error(result.error.message);

      // update local state + profile
      if (instance === "a") setHubspotStatusA({ connected: false, portalId: null });
      else setHubspotStatusB({ connected: false, portalId: null });
      await refreshProfile?.();

      return `HubSpot CRM ${instance.toUpperCase()} successfully disconnected and app uninstalled!`;
    },
    [user?.id, refreshProfile]
  );

  // 🔔 Allow/Deny toast wrapper
  const confirmAndDisconnect = useCallback(
    (instance: "a" | "b") => {
      const name = instance === "a" ? "HubSpot CRM A" : "HubSpot CRM B";
      const tid = toast(`Confirm Disconnect`, {
        description: `Disconnect ${name}?`,
        duration: 15000,
        action: {
          label: "Allow",
          onClick: async () => {
            const loadingId = toast.loading("Disconnecting…");
            try {
              const msg = await disconnectInstance(instance);
              toast.success(msg, { id: loadingId });
            } catch (e: any) {
              toast.error(e?.message || "Failed to disconnect", { id: loadingId });
            } finally {
              toast.dismiss(tid);
            }
          },
        },
        cancel: { label: "Deny", onClick: () => toast.dismiss(tid) },
      });
    },
    [disconnectInstance]
  );

  // Modal helpers
  const selectedList = useMemo(() => Array.from(selectedObjects) as ObjectKey[], [selectedObjects]);
  const hasAnyObjectSelected = selectedObjects.size > 0;

  const canProceedToStep3 = useMemo(
    () => selectedId === "hubspot" && hubspotStatusA.connected && hubspotStatusB.connected,
    [selectedId, hubspotStatusA.connected, hubspotStatusB.connected]
  );

  // ----- Error Display -----
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Something went wrong</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => { setError(null); window.location.reload(); }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- Loading guard -----
  if (step === null || isLoading || (profile && (profile.status === "deactivated" || profile.status === "reactivation_requested"))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const crmData = selectedId ? CRM_DATA[selectedId] : null;

  // ---------- UI ----------
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 p-4">
          <SidebarTrigger className="-ml-1">
            <IconLayoutSidebar size={20} stroke={1.5} />
          </SidebarTrigger>
          <Separator orientation="vertical" className="!h-6 mx-2" />
          <Heading as="h3" className="text-margin-zero">Migratio</Heading>
        </header>

        <main className="flex-1 py-10 px-4 md:px-6">
          {(step === 1 || step === 2 || step === 3 || step === 4 || step === 5) && (
            <StepperComponent
              currentStep={step}
              selectedCrmName={selectedId ? CRM_DATA[selectedId].title : undefined}
              onStepClick={(s) => handleStepChange(s as StepIndex)}
            />
          )}

          <Heading as="h1">Welcome to Migratio Dashboard!</Heading>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <Heading as="h2" className="mt-8">Select CRM</Heading>
              <div className="flex flex-wrap gap-4">
                {Object.entries(CRM_DATA).map(([id, data]) => (
                  <SelectableCard
                    key={id}
                    title={data.title}
                    subtitle={data.subtitle}
                    logo={data.logo}
                    isSelected={selectedId === id}
                    onSelect={() => handleSelectCrm(id as CrmId)}
                    comingSoon={["zoho", "zendesk", "pipedrive"].includes(id)}
                  />
                ))}
              </div>
              {selectedId === "hubspot" && (
                <div className="mt-6">
                  <Button variant="primary" onClick={() => handleStepChange(2)}>Next</Button>
                </div>
              )}
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && crmData && (
            <>
              <Heading as="h2" className="mt-8">Connected Integrations</Heading>
              <div className="mt-4 flex gap-2">
                <Button variant="with_arrow" onClick={() => handleStepChange(1)}>Back</Button>
                {isAdmin && (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try { await refreshProfile?.(); } catch (e) { setError("Failed to refresh profile. Please try again."); }
                    }}
                  >
                    🔄 Refresh Status
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-8 max-[1100px]:max-w-[336px] max-[1100px]:justify-center">
                {connectionLoading ? (
                  <div className="w-full flex justify-center items-center" style={{ minHeight: 200 }}>
                    <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></span>
                  </div>
                ) : (
                  <>
                    {/* Left card: HubSpot A */}
                    {selectedId === "hubspot" ? (
                      <Card
                        logo={crmData.logo}
                        title="Hubspot CRM A"
                        subtitle={crmData.subtitle}
                        status={hubspotStatusA.connected ? "Connected" : "Not Connected"}
                        connected={hubspotStatusA.connected}
                        connectedDate={hubspotStatusA.portalId ? String(hubspotStatusA.portalId) : "-"}
                        dataSyncStatus={hubspotStatusA.connected ? "Active" : "Inactive"}
                        portalId={hubspotStatusA.portalId ? String(hubspotStatusA.portalId) : undefined}
                        onDisconnect={() => confirmAndDisconnect("a")}   // 👈 Allow/Deny + side toast
                        onReconnect={() => handleConnect("a")}
                        redirect={() => handleConnect("a")}
                      />
                    ) : (
                      <Card
                        logo={crmData.logo}
                        title={crmData.title}
                        subtitle={crmData.subtitle}
                        status="Not Connected"
                        connected={false}
                        connectedDate="-"
                        dataSyncStatus="Inactive"
                        onReconnect={() => (window.location.href = crmData.connectUrl)}
                        redirect={() => (window.location.href = crmData.connectUrl)}
                      />
                    )}

                    <div className="flex items-center justify-center max-[1100px]:rotate-90" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>

                    {/* Right card: HubSpot B */}
                    <Card
                      logo={CRM_DATA.hubspot.logo}
                      title={selectedId === "hubspot" ? "Hubspot CRM B" : "Hubspot CRM"}
                      subtitle={CRM_DATA.hubspot.subtitle}
                      status={hubspotStatusB.connected ? "Connected" : "Not Connected"}
                      connected={hubspotStatusB.connected}
                      connectedDate={hubspotStatusB.portalId ? String(hubspotStatusB.portalId) : "-"}
                      dataSyncStatus={hubspotStatusB.connected ? "Active" : "Inactive"}
                      portalId={hubspotStatusB.portalId ? String(hubspotStatusB.portalId) : undefined}
                      onDisconnect={() => confirmAndDisconnect("b")}   // 👈 Allow/Deny + side toast
                      onReconnect={() => handleConnect("b")}
                      redirect={() => handleConnect("b")}
                    />
                  </>
                )}
              </div>

              <div className="mt-6">
                <Button variant="primary" disabled={!canProceedToStep3} onClick={() => handleStepChange(3)}>Next</Button>

                {isAdmin && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2">🔍 Debug Info:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Instance A:</strong><br />
                        Portal ID: {profile?.hubspot_portal_id_a || "NULL"}<br />
                        Access Token: {profile?.hubspot_access_token_a ? "✅ Present" : "❌ Missing"}<br />
                        Status: {hubspotStatusA.connected ? "🟢 Connected" : "🔴 Not Connected"}
                      </div>
                      <div>
                        <strong>Instance B:</strong><br />
                        Portal ID: {profile?.hubspot_portal_id_b || "NULL"}<br />
                        Access Token: {profile?.hubspot_access_token_b ? "✅ Present" : "❌ Missing"}<br />
                        Status: {hubspotStatusB.connected ? "🟢 Connected" : "🔴 Not Connected"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <Heading as="h2" className="mt-8">Select Data to Migrate</Heading>
              <p className="text-[var(--migratio_text)] mt-2">
                Choose the data types you want to migrate from HubSpot CRM A to HubSpot CRM B.
              </p>
              <Button variant="with_arrow" onClick={() => handleStepChange(2)}>Back</Button>
              <div className="flex flex-wrap gap-4 mt-6">
                {DATA_TYPES.map((t) => (
                  <DataTypeCard
                    key={t.key}
                    title={t.title}
                    subtitle={t.subtitle}
                    isSelected={selectedObjects.has(t.key)}
                    onSelect={() => toggleObject(t.key)}
                  />
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Button variant="primary" disabled={!hasAnyObjectSelected} onClick={() => handleStepChange(4)}>
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <Step4PreviewProperties onStepChange={handleStepChange} selectedObjects={selectedObjects} />
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <Step5CustomPropertySetup
              onBack={handleStepChange}
              selectedObjects={selectedObjects}
              hubspotStatusA={hubspotStatusA}
              hubspotStatusB={hubspotStatusB}
            />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ---------- Page with Error Boundary ----------
export default function Page() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
