import React from "react";
import Card from "@/components/DashboardCards/cards";
import Button from "@/components/Buttons/button";
import Heading from "@/components/Headings/heading";
import { CRM_DATA } from "../types/constants";
import type { Step2Props } from "../types";
import { useUser } from "@/context/UserContext";

/**
 * Step 2: Configuration Component
 * Handles HubSpot instance connections and displays connection status
 */
export function Step2Configuration({
  selectedId,
  hubspotStatusA,
  hubspotStatusB,
  connectionLoading,
  isAdmin,
  onConnect,
  onRefreshProfile,
  onBack,
  onNext,
  canProceed,
}: Step2Props) {
  const { profile } = useUser();
  const crmData = selectedId ? CRM_DATA[selectedId] : null;

  if (!crmData) {
    return (
      <div className="text-center">
        <p>No CRM selected. Please go back and select a CRM.</p>
        <Button variant="with_arrow" onClick={onBack}>
          Back to Step 1
        </Button>
      </div>
    );
  }

  return (
    <>
      <Heading as="h2" className="mt-8">
        Connected Integrations
      </Heading>
      
      <div className="mt-4 flex gap-2">
        <Button variant="with_arrow" onClick={onBack}>
          Back
        </Button>
        
        {/* Admin-only: Refresh Status button */}
        {isAdmin && (
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                console.log('🔄 [MANUAL REFRESH] Refreshing profile manually...');
                await onRefreshProfile();
                console.log('✅ [MANUAL REFRESH] Profile refreshed manually');
              } catch (error) {
                console.error("❌ Error refreshing profile:", error);
              }
            }}
          >
            🔄 Refresh Status
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-8 max-[1100px]:max-w-[336px] max-[1100px]:justify-center">
        {connectionLoading ? (
          <div
            className="w-full flex justify-center items-center"
            style={{ minHeight: 200 }}
          >
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></span>
          </div>
        ) : (
          <>
            {/* Left card: selected CRM (HubSpot A, Pipedrive, Zoho, Zendesk) */}
            {selectedId === "hubspot" ? (
              <Card
                logo={crmData.logo}
                title="Hubspot CRM A"
                subtitle={crmData.subtitle}
                status={hubspotStatusA.connected ? "Connected" : "Not Connected"}
                connected={hubspotStatusA.connected}
                connectedDate={
                  hubspotStatusA.portalId ? String(hubspotStatusA.portalId) : "-"
                }
                dataSyncStatus={hubspotStatusA.connected ? "Active" : "Inactive"}
                portalId={
                  hubspotStatusA.portalId ? String(hubspotStatusA.portalId) : undefined
                }
                onDisconnect={async () => {
                  const handleDisconnect = (await import("../hooks/useHubSpotStatus")).useHubSpotStatus;
                  // This will be properly implemented in the main component
                }}
                onReconnect={() => onConnect("a")}
                redirect={() => onConnect("a")}
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

            {/* Arrow indicator */}
            <div
              className="flex items-center justify-center max-[1100px]:rotate-90"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
              connectedDate={
                hubspotStatusB.portalId ? String(hubspotStatusB.portalId) : "-"
              }
              dataSyncStatus={hubspotStatusB.connected ? "Active" : "Inactive"}
              portalId={
                hubspotStatusB.portalId ? String(hubspotStatusB.portalId) : undefined
              }
              onDisconnect={async () => {
                // This will be properly implemented in the main component
              }}
              onReconnect={() => onConnect("b")}
              redirect={() => onConnect("b")}
            />
          </>
        )}
      </div>

      <div className="mt-6">
        <Button
          variant="primary"
          disabled={!canProceed}
          onClick={onNext}
        >
          Next
        </Button>
        
        {/* Admin-only: Debug Info Panel */}
        {isAdmin && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">🔍 Debug Info:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Instance A:</strong><br/>
                Portal ID: {profile?.hubspot_portal_id_a || 'NULL'}<br/>
                Access Token: {profile?.hubspot_access_token_a ? '✅ Present' : '❌ Missing'}<br/>
                Status: {hubspotStatusA.connected ? '🟢 Connected' : '🔴 Not Connected'}
              </div>
              <div>
                <strong>Instance B:</strong><br/>
                Portal ID: {profile?.hubspot_portal_id_b || 'NULL'}<br/>
                Access Token: {profile?.hubspot_access_token_b ? '✅ Present' : '❌ Missing'}<br/>
                Status: {hubspotStatusB.connected ? '🟢 Connected' : '🔴 Not Connected'}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}