"use client";

import React from "react";
import { useUser } from "@/context/UserContext";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getTimeUntilExpiry, isUserAdmin, isHubSpotTokenExpired } from "@/utils/cacheUtils";
import { hubspotContactProperties } from "@/context/hubspotdefaultproperties";

type HubSpotLead = {
  id: string;
  properties?: Record<string, string | number | boolean | null>;
  portal?: 'A' | 'B';
};

type LeadsResponse = {
  success?: boolean;
  object?: string;
  results?: HubSpotLead[];
  paging?: { next?: { after?: string } };
};

export default function LeadsPage() {
  const { user, profile, isLoading } = useUser();
  const [leadsA, setLeadsA] = React.useState<HubSpotLead[]>([]);
  const [leadsB, setLeadsB] = React.useState<HubSpotLead[]>([]);
  const [loadingA, setLoadingA] = React.useState(false);
  const [loadingB, setLoadingB] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [nextAfterA, setNextAfterA] = React.useState<string | null>(null);
  const [nextAfterB, setNextAfterB] = React.useState<string | null>(null);

  const backendBase = (process.env.NEXT_PUBLIC_DOMAIN_BACKEND || "").replace(/\/?$/, "/");

  // Function to get the label for a property name
  const getPropertyLabel = (propertyName: string): string => {
    const property = hubspotContactProperties.find(p => p.name === propertyName);
    return property ? property.label : propertyName;
  };

  const fetchLeads = React.useCallback(
    async (instance: 'a' | 'b', after?: string | null) => {
      try {
        if (instance === 'a') setLoadingA(true); else setLoadingB(true);
        setError(null);
        
        // First, set up backend session
        if (user?.id) {
          console.log('🔧 [LEADS] Setting up backend session for user:', user.id);
          await fetch(`${backendBase}api/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userId: user.id })
          });
        }
        
        const url = new URL("hubspot/objects/leads", backendBase);
        url.searchParams.set("limit", "25");
        // Ask for common-ish properties; UI gracefully handles missing ones
        url.searchParams.set("properties", "name,firstname,lastname,email,hs_lead_status,lead_status,createdate");
        if (user?.id) url.searchParams.set("userId", user.id);
        url.searchParams.set("instance", instance);
        if (after) url.searchParams.set("after", after);

        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load leads from Portal ${instance.toUpperCase()} (${res.status}): ${text}`);
        }
        const data = (await res.json()) as LeadsResponse;
        const items = (data.results || []).map(l => ({ ...l, portal: instance.toUpperCase() as 'A' | 'B' }));
        if (instance === 'a') {
          setLeadsA(prev => (after ? [...prev, ...items] : items));
          setNextAfterA(data.paging?.next?.after || null);
        } else {
          setLeadsB(prev => (after ? [...prev, ...items] : items));
          setNextAfterB(data.paging?.next?.after || null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (instance === 'a') setLoadingA(false); else setLoadingB(false);
      }
    },
    [backendBase, user?.id]
  );

  const portalAConnected = !!profile?.hubspot_access_token_a;
  const portalBConnected = !!profile?.hubspot_access_token_b;

  React.useEffect(() => {
    if (isLoading) return;
    if (portalAConnected) fetchLeads('a', null);
    if (portalBConnected) fetchLeads('b', null);
  }, [isLoading, profile, fetchLeads, portalAConnected, portalBConnected, fetchLeads]);

  const allLeads = [...leadsA, ...leadsB];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="!h-6 mx-2" />
          <h2 className="text-2xl font-semibold">Leads (All Portals)</h2>
        </header>

        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          ) : !portalAConnected && !portalBConnected ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connect at least one HubSpot portal to view leads.</p>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 text-red-600">{error}</div>}

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${portalAConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="font-semibold text-green-800">Portal A</h3>
                  <p className="text-sm text-green-600">{portalAConnected ? `Connected (ID: ${profile?.hubspot_portal_id_a})` : 'Not Connected'}</p>
                  {portalAConnected && profile?.hubspot_access_token_expires_at_a && isUserAdmin(user?.email) && (
                    <p className={`text-xs mt-1 ${isHubSpotTokenExpired(profile.hubspot_access_token_expires_at_a) ? 'text-red-500' : 'text-green-500'}`}>
                      Token expires in: {getTimeUntilExpiry(profile.hubspot_access_token_expires_at_a)}
                      {isHubSpotTokenExpired(profile.hubspot_access_token_expires_at_a) && (
                        <span className="ml-2 font-semibold">⚠️ Token Expired - Will refresh automatically</span>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-green-500 mt-1">{loadingA ? 'Loading...' : `${leadsA.length} leads loaded`}</p>
                </div>
                <div className={`p-4 rounded-lg border ${portalBConnected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="font-semibold text-blue-800">Portal B</h3>
                  <p className="text-sm text-blue-600">{portalBConnected ? `Connected (ID: ${profile?.hubspot_portal_id_b})` : 'Not Connected'}</p>
                  {portalBConnected && profile?.hubspot_access_token_expires_at_b && isUserAdmin(user?.email) && (
                    <p className={`text-xs mt-1 ${isHubSpotTokenExpired(profile.hubspot_access_token_expires_at_b) ? 'text-red-500' : 'text-blue-500'}`}>
                      Token expires in: {getTimeUntilExpiry(profile.hubspot_access_token_expires_at_b)}
                      {isHubSpotTokenExpired(profile.hubspot_access_token_expires_at_b) && (
                        <span className="ml-2 font-semibold">⚠️ Token Expired - Will refresh automatically</span>
                      )}
                    </p>
                  )}
                  <p className="text-xs text-blue-500 mt-1">{loadingB ? 'Loading...' : `${leadsB.length} leads loaded`}</p>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                          <th className="text-left px-4 py-2">Portal</th>
                          <th className="text-left px-4 py-2">{getPropertyLabel('firstname')} / {getPropertyLabel('lastname')}</th>
                          <th className="text-left px-4 py-2">{getPropertyLabel('email')}</th>
                          <th className="text-left px-4 py-2">{getPropertyLabel('hs_lead_status')}</th>
                          <th className="text-left px-4 py-2">ID</th>
                        </tr>
                  </thead>
                  <tbody>
                    {allLeads.map((l) => {
                      const first = (l.properties?.["firstname"] as string) || "";
                      const last = (l.properties?.["lastname"] as string) || "";
                      const displayName = (l.properties?.["name"] as string) || `${first} ${last}`.trim();
                      const email = (l.properties?.["email"] as string) || "";
                      const status = (l.properties?.["hs_lead_status"] as string) || (l.properties?.["lead_status"] as string) || "";
                      const portalColor = l.portal === 'A' ? 'text-green-600' : 'text-blue-600';
                      const portalBg = l.portal === 'A' ? 'bg-green-100' : 'bg-blue-100';
                      return (
                        <tr key={`${l.portal}-${l.id}`} className="border-t">
                          <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${portalBg} ${portalColor}`}>Portal {l.portal}</span></td>
                          <td className="px-4 py-2">{displayName || "—"}</td>
                          <td className="px-4 py-2">{email || "—"}</td>
                          <td className="px-4 py-2">{status || "—"}</td>
                          <td className="px-4 py-2 text-gray-500">{l.id}</td>
                        </tr>
                      );
                    })}
                    {allLeads.length === 0 && !loadingA && !loadingB && (
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No leads found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {portalAConnected && (
                  <button
                    className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-50"
                    onClick={() => fetchLeads('a', nextAfterA)}
                    disabled={!nextAfterA || loadingA}
                  >
                    {loadingA ? "Loading Portal A..." : nextAfterA ? "Load More Portal A" : "Portal A Complete"}
                  </button>
                )}
                {portalBConnected && (
                  <button
                    className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
                    onClick={() => fetchLeads('b', nextAfterB)}
                    disabled={!nextAfterB || loadingB}
                  >
                    {loadingB ? "Loading Portal B..." : nextAfterB ? "Load More Portal B" : "Portal B Complete"}
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
