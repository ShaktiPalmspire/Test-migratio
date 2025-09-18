/**
 * Utility functions for managing localStorage cache
 */

// Define the user profile interface to replace 'any' types
interface UserProfile {
  hubspot_portal_id_a?: string | number | null;  // Support both string and number
  hubspot_access_token_a?: string | null;
  hubspot_access_token_expires_at_a?: string | null;
  hubspot_refresh_token_a?: string | null;
  hubspot_portal_id_b?: string | number | null;  // Support both string and number
  hubspot_access_token_b?: string | null;
  hubspot_access_token_expires_at_b?: string | null;
  hubspot_refresh_token_b?: string | null;
}

/**
 * Checks if a HubSpot access token is expired
 * @param expiresAt - ISO string timestamp when token expires
 * @returns true if token is expired or will expire within 5 minutes
 */
export function isHubSpotTokenExpired(expiresAt: string | null | undefined): boolean {
  // If no expiration date is set, the token is considered valid (not expired)
  // This is common for HubSpot tokens that don't have expiration dates
  if (!expiresAt) return false;
  
  try {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes buffer
    
    return currentTime >= (expirationTime - fiveMinutesInMs);
  } catch (error) {
    console.error('❌ [UTILS] Error parsing expiration time:', error);
    return true; // If we can't parse, assume expired
  }
}

/**
 * Checks if Portal A is properly connected and has valid token
 * @param profile - User profile object (can be null)
 * @returns true if Portal A is connected and token is valid
 */
export function isPortalAConnected(profile: UserProfile | null): boolean {
  if (!profile) {
    console.log('🔍 [PORTAL_CHECK] Profile is null');
    return false;
  }
  
  // Check if portal ID exists (can be string or number)
  const hasPortalId = profile.hubspot_portal_id_a && 
    (typeof profile.hubspot_portal_id_a === 'string' ? profile.hubspot_portal_id_a.trim() !== '' : true);
  
  const hasToken = profile.hubspot_access_token_a && profile.hubspot_access_token_a.trim() !== '';
  
  // ✅ ADD THIS CHECK: Token should not be expired
  const isTokenValid = !isHubSpotTokenExpired(profile.hubspot_access_token_expires_at_a);
  
  console.log('🔍 [PORTAL_CHECK] Portal A Status:', {
    hasPortalId,
    portalId: profile.hubspot_portal_id_a,
    hasToken: !!hasToken,
    isTokenValid,
    expiresAt: profile.hubspot_access_token_expires_at_a
  });
  
  return !!(hasPortalId && hasToken && isTokenValid);
}

/**
 * Checks if Portal B is properly connected and has valid token
 * @param profile - User profile object (can be null)
 * @returns true if Portal B is connected and token is valid
 */
export function isPortalBConnected(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  // Check if portal ID exists (can be string or number)
  const hasPortalId = profile.hubspot_portal_id_b && 
    (typeof profile.hubspot_portal_id_b === 'string' ? profile.hubspot_portal_id_b.trim() !== '' : true);
  
  const hasToken = profile.hubspot_access_token_b && profile.hubspot_access_token_b.trim() !== '';
  
  // ✅ ADD THIS CHECK: Token should not be expired
  const isTokenValid = !isHubSpotTokenExpired(profile.hubspot_access_token_expires_at_b);
  
  return !!(hasPortalId && hasToken && isTokenValid);
}

/**
 * Gets the time until token expires in a human-readable format
 * @param expiresAt - ISO string timestamp when token expires
 * @returns Human-readable string like "2 hours", "30 minutes", or "Expired"
 */
export function getTimeUntilExpiry(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "No expiration date";
  
  try {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = expirationTime - currentTime;
    
    if (timeDiff <= 0) return "Expired";
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return "Less than 1 minute";
    }
  } catch (error) {
    console.error('❌ [UTILS] Error calculating time until expiry:', error);
    return "Unknown";
  }
}

/**
 * Validates cache data integrity
 * @returns true if cache is valid, false if corrupted
 */
export function validateHubSpotCache(): boolean {
  if (typeof window === "undefined") return true;
  
  try {
    const cachedContacts = localStorage.getItem('cached_contacts_a');
    if (cachedContacts) {
      const parsed = JSON.parse(cachedContacts);
      if (!Array.isArray(parsed)) {
        console.warn('⚠️ [CACHE] Corrupted contacts cache - not an array');
        return false;
      }
    }
    
    const cachedNextAfter = localStorage.getItem('cached_next_after_a');
    if (cachedNextAfter && typeof cachedNextAfter !== 'string') {
      console.warn('⚠️ [CACHE] Corrupted nextAfter cache - not a string');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ [CACHE] Cache validation failed:', error);
    return false;
  }
}

/**
 * Clears all cached HubSpot data from localStorage
 * This should be called when a user logs out for security
 */
export function clearHubSpotCache(): void {
  if (typeof window === "undefined") return;
  
  console.log('🧹 [CACHE] Starting HubSpot cache cleanup...');
  
  // Clear contacts cache
  localStorage.removeItem('cached_contacts_a');
  localStorage.removeItem('cached_contacts_next_after_a');
  localStorage.removeItem('cached_next_after_a'); // Also clear the alternative key used in contacts page
  
  // Clear companies cache
  localStorage.removeItem('cached_companies_a');
  localStorage.removeItem('cached_companies_next_after_a');
  
  // Clear deals cache
  localStorage.removeItem('cached_deals_a');
  localStorage.removeItem('cached_deals_next_after_a');
  
  // Clear tickets cache
  localStorage.removeItem('cached_tickets_a');
  localStorage.removeItem('cached_tickets_next_after_a');
  
  // Clear leads cache
  localStorage.removeItem('cached_leads_a');
  localStorage.removeItem('cached_leads_next_after_a');
  localStorage.removeItem('cached_leads_b');
  localStorage.removeItem('cached_leads_next_after_b');
  
  // Clear custom properties cache
  clearCustomPropertiesCache();
  
  // Debug: Log what's left in localStorage
  const remainingKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('cached_') || key.includes('hubspot') || key.includes('next_after'))) {
      remainingKeys.push(key);
    }
  }
  
  if (remainingKeys.length > 0) {
    console.warn('⚠️ [CACHE] Remaining cache keys after cleanup:', remainingKeys);
  }
  
  console.log('🧹 [CACHE] Cleared all cached HubSpot data from localStorage');
}

/**
 * Checks if the current user is an admin
 * @param userEmail - User's email address
 * @returns true if user is admin
 */
export function isUserAdmin(userEmail: string | undefined | null): boolean {
  if (!userEmail) return false;
  
  // Get admin emails from environment variable
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "shakti@palmspire.com")
    .split(',')
    .map(email => email.trim().toLowerCase());
  
  return adminEmails.includes(userEmail.toLowerCase());
}

/**
 * Clears all custom properties cache from localStorage
 * This should be called when a user logs out for security
 */
export function clearCustomPropertiesCache(): void {
  if (typeof window === "undefined") return;
  
  console.log('🧹 [CACHE] Starting custom properties cache cleanup...');
  
  // Clear custom properties for all object types
  const objectTypes = ['contacts', 'companies', 'deals', 'tickets'];
  
  objectTypes.forEach(objectType => {
    const customPropsKey = `customProperties_${objectType}`;
    localStorage.removeItem(customPropsKey);
    console.log(`🧹 [CACHE] Cleared custom properties for ${objectType}`);
  });
  
  // Also clear any other custom properties that might exist
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('customProperties_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('🧹 [CACHE] Cleared all custom properties cache from localStorage');
}

/**
 * Clears all user-related cache data from localStorage and sessionStorage
 * This includes HubSpot data, custom properties, mappings, and any other user-specific cache
 */
export function clearAllUserCache(): void {
  if (typeof window === "undefined") return;
  
  // Clear HubSpot cache
  clearHubSpotCache();
  
  // Clear dashboard cache
  localStorage.removeItem('selectedIntegration');
  localStorage.removeItem('selectedStep');
  localStorage.removeItem('selectedObjects');
  // Note: selectedObjects_last is NOT cleared here - it's used for logout save
  
  // Clear all user-related keys from localStorage (except theme and selectedObjects_last)
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key !== 'theme' && key !== 'selectedObjects_last') { // Keep theme and selectedObjects_last
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear sessionStorage completely
  sessionStorage.clear();

  console.log('🧹 [CACHE] Cleared all user cache data from localStorage and sessionStorage (kept theme and selectedObjects_last)');
}

/**
 * Automatically refreshes expired HubSpot tokens
 * This should be called before making API calls to ensure tokens are valid
 */
export async function refreshExpiredToken(instance: 'a' | 'b', refreshToken: string | null, userId: string): Promise<boolean> {
  if (!refreshToken) {
    console.log('❌ [TOKEN_REFRESH] No refresh token available for instance', instance);
    return false;
  }

  try {
    console.log('🔄 [TOKEN_REFRESH] Refreshing expired token for instance', instance);
    
    const backendBase = (process.env.NEXT_PUBLIC_DOMAIN_BACKEND || "").replace(/\/?$/, "/");
    const response = await fetch(`${backendBase}hubspot/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        refreshToken,
        userId,
        instance 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [TOKEN_REFRESH] Failed to refresh token:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ [TOKEN_REFRESH] Token refreshed successfully for instance', instance);
    
    // Clear cache to force fresh data fetch with new token
    clearHubSpotCache();
    
    return true;
  } catch (error) {
    console.error('❌ [TOKEN_REFRESH] Error refreshing token:', error);
    return false;
  }
}

/**
 * Checks if token needs refresh and automatically refreshes it
 * Returns true if token is valid (either was valid or was refreshed)
 */
export async function ensureValidToken(
  profile: UserProfile | null, 
  userId: string, 
  instance: 'a' | 'b' = 'a'
): Promise<boolean> {
  if (!profile) return false;

  // Check if token is expired
  const expiresAt = instance === 'a' 
    ? profile.hubspot_access_token_expires_at_a 
    : profile.hubspot_access_token_expires_at_b;
  
  if (!isHubSpotTokenExpired(expiresAt)) {
    console.log('✅ [TOKEN_CHECK] Token is still valid for instance', instance);
    return true;
  }

  console.log('⚠️ [TOKEN_CHECK] Token expired for instance', instance, 'attempting refresh...');
  
  // Get refresh token
  const refreshToken = instance === 'a' 
    ? profile.hubspot_refresh_token_a 
    : profile.hubspot_refresh_token_b;

  if (!refreshToken) {
    console.error('❌ [TOKEN_CHECK] No refresh token available for instance', instance);
    return false;
  }

  // Attempt to refresh token
  const refreshSuccess = await refreshExpiredToken(instance, refreshToken, userId);
  
  if (refreshSuccess) {
    console.log('✅ [TOKEN_CHECK] Token refreshed successfully for instance', instance);
    // Don't reload the page - let the calling component handle the profile refresh
    return true;
  } else {
    console.error('❌ [TOKEN_CHECK] Failed to refresh token for instance', instance);
    return false;
  }
}

/**
 * Clears cache when a new user logs in to prevent seeing previous user's data
 * This should be called when a user successfully logs in
 */
export function clearCacheOnNewUserLogin(): void {
  if (typeof window === "undefined") return;
  
  // Clear all cached data to prevent data leakage between users
  clearHubSpotCache();
  
  // Clear dashboard cache
  localStorage.removeItem('selectedIntegration');
  localStorage.removeItem('selectedStep');
  localStorage.removeItem('selectedObjects');
  // Note: selectedObjects_last is preserved for logout save functionality
  
  // Clear mapping cache
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('mappings:')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear custom properties cache
  clearCustomPropertiesCache();
  
  console.log('🧹 [CACHE] Cleared cache for new user login to prevent data leakage');
}

/**
 * Clears custom properties cache when user is inactive or session expires
 * This provides an additional security layer
 */
export function clearCustomPropertiesOnInactivity(): void {
  if (typeof window === "undefined") return;
  
  // Set a timestamp for when custom properties should expire
  const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  localStorage.setItem('customPropertiesExpiration', expirationTime.toString());
  
  // Check if custom properties have expired
  const checkExpiration = () => {
    const expiration = localStorage.getItem('customPropertiesExpiration');
    if (expiration && Date.now() > parseInt(expiration)) {
      console.log('🧹 [CACHE] Custom properties expired due to inactivity, clearing...');
      clearCustomPropertiesCache();
      localStorage.removeItem('customPropertiesExpiration');
    }
  };
  
  // Check expiration every hour
  setInterval(checkExpiration, 60 * 60 * 1000);
  
  // Also check when the page becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkExpiration();
    }
  });
}

/**
 * Sets up automatic cleanup of custom properties cache
 * This should be called when the app initializes
 */
export function setupCustomPropertiesCleanup(): void {
  if (typeof window === "undefined") return;
  
  // Clear custom properties on page unload
  window.addEventListener('beforeunload', () => {
    // Don't clear on normal navigation, only on actual page unload
    if (performance.navigation.type === 1) { // TYPE_RELOAD
      clearCustomPropertiesCache();
    }
  });
  
  // Clear custom properties when storage is cleared manually
  window.addEventListener('storage', (event) => {
    if (event.key === null && event.newValue === null) {
      // localStorage was cleared manually
      console.log('🧹 [CACHE] localStorage cleared manually, clearing custom properties...');
      clearCustomPropertiesCache();
    }
  });
}
