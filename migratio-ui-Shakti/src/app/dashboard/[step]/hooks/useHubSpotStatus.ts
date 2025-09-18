import { useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { hubspotApi } from "@/lib/api";
import type { HubSpotStatus } from "../types";

interface UseHubSpotStatusProps {
  hubspotStatusA: HubSpotStatus;
  hubspotStatusB: HubSpotStatus;
  setHubspotStatusA: (status: HubSpotStatus) => void;
  setHubspotStatusB: (status: HubSpotStatus) => void;
  setError: (error: string | null) => void;
}

/**
 * Custom hook for managing HubSpot connection status
 * Handles syncing status from profile, connecting, and disconnecting
 */
export function useHubSpotStatus({
  hubspotStatusA,
  hubspotStatusB,
  setHubspotStatusA,
  setHubspotStatusB,
  setError,
}: UseHubSpotStatusProps) {
  const { user, profile, refreshProfile } = useUser();

  // Sync HubSpot statuses from profile
  useEffect(() => {
    if (!profile) {
      console.log('🔍 [STATUS SYNC] No profile available');
      return;
    }
    
    console.log('🔍 [STATUS SYNC] Profile updated, syncing HubSpot statuses:', {
      hasProfile: !!profile,
      portalIdA: profile.hubspot_portal_id_a,
      accessTokenA: profile.hubspot_access_token_a ? `${profile.hubspot_access_token_a.slice(0, 20)}...` : 'NULL',
      portalIdB: profile.hubspot_portal_id_b,
      accessTokenB: profile.hubspot_access_token_b ? `${profile.hubspot_access_token_b.slice(0, 20)}...` : 'NULL'
    });
    
    const statusA = {
      connected: !!profile.hubspot_portal_id_a && !!profile.hubspot_access_token_a,
      portalId: profile.hubspot_portal_id_a || null,
    };
    
    const statusB = {
      connected: !!profile.hubspot_portal_id_b && !!profile.hubspot_access_token_b,
      portalId: profile.hubspot_portal_id_b || null,
    };
    
    console.log('🔍 [STATUS SYNC] Setting statuses:', {
      instanceA: statusA,
      instanceB: statusB
    });
    
    setHubspotStatusA(statusA);
    setHubspotStatusB(statusB);
  }, [profile, setHubspotStatusA, setHubspotStatusB]);

  // Connect to HubSpot instance
  const handleConnect = useCallback(async (instance: "a" | "b") => {
    try {
      if (!user?.id) {
        window.location.href = `${process.env.NEXT_PUBLIC_DOMAIN_BACKEND}hubspot/install?instance=${instance}`;
        return;
      }

      const base = new URL(process.env.NEXT_PUBLIC_DOMAIN_BACKEND!);
      const popupUrl = new URL("hubspot/install", base);
      popupUrl.searchParams.set("instance", instance);
      popupUrl.searchParams.set("userId", user.id);

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        popupUrl.toString(),
        "hubspot-oauth",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup || popup.closed) {
        alert("Popup was blocked! Please allow popups for this site and try again.");
        return;
      }

      const onMessage = async (event: MessageEvent) => {
        try {
          // TODO: validate event.origin === base.origin (+ state)
          if (
            event.data &&
            event.data.portalId &&
            event.data.instance &&
            event.data.userId
          ) {
            const { portalId, instance: portalInstance, userId } = event.data;
            const portalNum = Number(portalId) || null;
            const updateData =
              portalInstance === "a"
                ? { hubspot_portal_id_a: portalNum }
                : { hubspot_portal_id_b: portalNum };

            const upsertResult = await supabase
              .from("profiles")
              .upsert([{ id: userId, ...updateData }]);

            if (upsertResult.error) {
              throw new Error(upsertResult.error.message);
            }
            
            console.log('✅ [CONNECT] Database update successful, refreshing profile...');
            
            // Refresh the profile to get the latest data
            if (refreshProfile) {
              await refreshProfile();
              console.log('✅ [CONNECT] Profile refreshed successfully');
            }
            
            // Update local state
            if (portalInstance === "a") {
              setHubspotStatusA({
                connected: !!portalNum,
                portalId: portalNum,
              });
            } else {
              setHubspotStatusB({
                connected: !!portalNum,
                portalId: portalNum,
              });
            }
            
            console.log('✅ [CONNECT] Local state updated for instance:', portalInstance);
            
            try {
              popup.close();
            } catch {
              /* noop */
            }
            window.removeEventListener("message", onMessage);
          }
        } catch (error) {
          console.error("❌ Error processing connection message:", error);
          alert("Failed to save HubSpot connection: " + (error instanceof Error ? error.message : String(error)));
        }
      };

      window.addEventListener("message", onMessage);
      
      // Cleanup timeout
      setTimeout(() => {
        try {
          if (popup && !popup.closed) popup.close();
        } catch {
          /* noop */
        }
        window.removeEventListener("message", onMessage);
      }, 300000); // 5 minutes

    } catch (error) {
      console.error("❌ Error in handleConnect:", error);
      setError("Failed to initiate connection. Please try again.");
    }
  }, [user, refreshProfile, setHubspotStatusA, setHubspotStatusB, setError]);

  // Disconnect from HubSpot instance
  const handleDisconnect = useCallback(async (instance: "a" | "b") => {
    try {
      console.log(`🔴 [DISCONNECT ${instance.toUpperCase()}] Disconnect button clicked for HubSpot CRM ${instance.toUpperCase()}`);
      
      if (!user?.id) {
        console.log(`❌ [DISCONNECT ${instance.toUpperCase()}] No user ID available`);
        return;
      }
      
      console.log(`👤 [DISCONNECT ${instance.toUpperCase()}] User ID:`, user.id);
      
      // Set up backend session
      console.log(`🔧 [DISCONNECT ${instance.toUpperCase()}] Setting up backend session...`);
      const backendBase = process.env.NEXT_PUBLIC_DOMAIN_BACKEND || 'http://localhost:3000/';
      await fetch(`${backendBase}api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id })
      });
      
      console.log(`🌐 [DISCONNECT ${instance.toUpperCase()}] Calling HubSpot uninstall API...`);
      
      // Call HubSpot API to uninstall the app
      const uninstallResult = await hubspotApi.uninstallApp(instance, user.id);
      console.log(`📊 [DISCONNECT ${instance.toUpperCase()}] Uninstall API result:`, uninstallResult);
      
      if (uninstallResult.success) {
        console.log(`✅ [DISCONNECT ${instance.toUpperCase()}] Uninstall successful, cleaning up local database...`);
        
        // Clean up local database
        const updateData = instance === "a" 
          ? { 
              hubspot_portal_id_a: null,
              hubspot_refresh_token_a: null,
              hubspot_access_token_a: null
            }
          : { 
              hubspot_portal_id_b: null,
              hubspot_refresh_token_b: null,
              hubspot_access_token_b: null
            };

        const result = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);
        
        if (!result.error) {
          console.log(`✅ [DISCONNECT ${instance.toUpperCase()}] Database cleanup successful`);
          
          // Update local state
          if (instance === "a") {
            setHubspotStatusA({ connected: false, portalId: null });
          } else {
            setHubspotStatusB({ connected: false, portalId: null });
          }
          
          await refreshProfile?.();
          alert(`HubSpot CRM ${instance.toUpperCase()} successfully disconnected and app uninstalled!`);
        } else {
          console.log(`❌ [DISCONNECT ${instance.toUpperCase()}] Database cleanup failed:`, result.error);
          alert("App uninstalled from HubSpot but failed to update local data: " + result.error.message);
        }
      } else {
        console.log(`❌ [DISCONNECT ${instance.toUpperCase()}] Uninstall failed:`, uninstallResult.message);
        alert("Failed to uninstall HubSpot app: " + uninstallResult.message);
      }
    } catch (error) {
      console.error(`💥 [DISCONNECT ${instance.toUpperCase()}] Unexpected error:`, error);
      setError("Error during disconnect: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [user, refreshProfile, setHubspotStatusA, setHubspotStatusB, setError]);

  return {
    handleConnect,
    handleDisconnect,
  };
}