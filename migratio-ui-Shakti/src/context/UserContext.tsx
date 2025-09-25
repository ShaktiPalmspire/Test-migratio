'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'
import { clearHubSpotCache, clearCacheOnNewUserLogin, setupCustomPropertiesCleanup, clearAllUserCache } from '@/utils/cacheUtils'

export type Profile = {
  id: string
  full_name: string
  avatar_url: string
  hubspot_portal_id_b?: number | null
  hubspot_portal_id_a?: number | null
  hubspot_access_token_a?: string | null
  hubspot_access_token_b?: string | null
  hubspot_access_token_expires_at_a?: string | null
  hubspot_access_token_expires_at_b?: string | null
  hubspot_refresh_token_a?: string | null
  hubspot_refresh_token_b?: string | null
  status?: string
  deactivated_at?: string
  reactivation_requested_at?: string
  hubspot_crm_a_mapped_json?: any
  helper_json?: any
}

export type UserContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
  refreshProfileWithRetry: (maxRetries?: number) => Promise<void>
  upsertMappedJson: (changes: Partial<Record<"contacts" | "companies" | "deals" | "tickets", Record<string, any>>>) => Promise<void>
  saveSelectedObjects: (selectedObjects: string[]) => Promise<void>
  loadSelectedObjects: () => string[]
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)

  const fetchProfile = async (userId: string) => {
    setIsProfileLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, hubspot_portal_id_b, hubspot_portal_id_a, hubspot_access_token_a, hubspot_access_token_b, hubspot_access_token_expires_at_a, hubspot_access_token_expires_at_b, hubspot_refresh_token_a, hubspot_refresh_token_b, status, deactivated_at, reactivation_requested_at, hubspot_crm_a_mapped_json, helper_json')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError)
      } else {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error)
    } finally {
      setIsProfileLoading(false);
    }
  }

  // Load selectedObjects from localStorage first, then database
  const loadSelectedObjects = () => {
    console.log('🔄 [LOAD_SELECTED_OBJECTS] Function called');
    console.log('🔄 [LOAD_SELECTED_OBJECTS] Profile exists:', !!profile);
    console.log('🔄 [LOAD_SELECTED_OBJECTS] Profile helper_json:', profile?.helper_json);
    
    try {
      // First, try to load from localStorage (most recent)
      const localStorageObjects = localStorage.getItem('selectedObjects');
      console.log('🔍 [LOAD_SELECTED_OBJECTS] localStorage selectedObjects:', localStorageObjects);
      
      if (localStorageObjects) {
        const parsedObjects = JSON.parse(localStorageObjects);
        console.log('📥 [LOAD_SELECTED_OBJECTS] Loaded from localStorage:', parsedObjects);
        if (Array.isArray(parsedObjects) && parsedObjects.length > 0) {
          console.log('✅ [LOAD_SELECTED_OBJECTS] Returning localStorage data');
          return parsedObjects;
        }
      }
      
      // If localStorage is empty, try database
      const savedObjects = profile?.helper_json?.selectedObjects;
      console.log('🔄 [LOAD_SELECTED_OBJECTS] Saved objects from DB:', savedObjects);
      
      if (savedObjects && Array.isArray(savedObjects) && savedObjects.length > 0) {
        // IMPORTANT: Also save to localStorage for future use
        localStorage.setItem('selectedObjects', JSON.stringify(savedObjects));
        localStorage.setItem('selectedObjects_backup', JSON.stringify(savedObjects));
        console.log('📥 [LOAD_SELECTED_OBJECTS] Loaded selectedObjects from database and saved to localStorage:', savedObjects);
        return savedObjects;
      } else {
        console.log('📝 [LOAD_SELECTED_OBJECTS] No saved objects found in database');
      }
    } catch (error) {
      console.warn('⚠️ [LOAD_SELECTED_OBJECTS] Error loading selectedObjects:', error);
    }
    return [];
  };


  // Save selectedObjects to database with explicit user data (for logout)
  const saveSelectedObjectsWithUserData = async (selectedObjects: string[], userId: string, userProfile: Profile) => {
    console.log('🔄 [SAVE_SELECTED_OBJECTS_WITH_DATA] Function called with:', selectedObjects);
    console.log('🔄 [SAVE_SELECTED_OBJECTS_WITH_DATA] User ID:', userId);
    console.log('🔄 [SAVE_SELECTED_OBJECTS_WITH_DATA] Profile exists:', !!userProfile);
    
    try {
      const existingHelperJson = userProfile?.helper_json || {};
      const lastSavedObjects = existingHelperJson.selectedObjects || [];
      
      console.log('🔄 [SAVE_SELECTED_OBJECTS_WITH_DATA] Existing helper_json:', existingHelperJson);
      console.log('🔄 [SAVE_SELECTED_OBJECTS_WITH_DATA] Last saved objects:', lastSavedObjects);
      
      // Check if value actually changed from last saved value
      const hasChanged = JSON.stringify(lastSavedObjects.sort()) !== JSON.stringify(selectedObjects.sort());
      
      console.log('🔄 [SAVE_SELECTED_OBJECTS_WITH_DATA] Has changed:', hasChanged);
      
      if (!hasChanged) {
        console.log('📝 [SAVE_SELECTED_OBJECTS_WITH_DATA] No change detected, skipping save');
        return;
      }
      
      const payload = {
        ...existingHelperJson,
        selectedObjects: selectedObjects,
        updatedAt: new Date().toISOString(),
      };

      console.log('🔄 [SAVE_SELECTED_OBJECTS_WITH_DATA] Payload to save:', payload);

      const { data, error } = await supabase
        .from('profiles')
        .update({ helper_json: payload })
        .eq('id', userId);

      if (error) {
        console.error('❌ [SAVE_SELECTED_OBJECTS_WITH_DATA] Supabase error:', error);
        throw error;
      }

      console.log('✅ [SAVE_SELECTED_OBJECTS_WITH_DATA] Successfully saved to database');
      
      console.log('💾 [SAVE_SELECTED_OBJECTS_WITH_DATA] Saved selectedObjects to helper_json (changed):', selectedObjects);
    } catch (err) {
      console.error('❌ [SAVE_SELECTED_OBJECTS_WITH_DATA] Error saving selectedObjects:', err);
    }
  };

  // Save selectedObjects to database (only if changed from last saved value)
  const saveSelectedObjects = async (selectedObjects: string[]) => {
    console.log('🔄 [SAVE_SELECTED_OBJECTS] Function called with:', selectedObjects);
    console.log('🔄 [SAVE_SELECTED_OBJECTS] User ID:', user?.id);
    console.log('🔄 [SAVE_SELECTED_OBJECTS] Profile exists:', !!profile);
    
    if (!user?.id) {
      console.log('❌ [SAVE_SELECTED_OBJECTS] No user ID, returning');
      return;
    }
    
    try {
      const existingHelperJson = profile?.helper_json || {};
      const lastSavedObjects = existingHelperJson.selectedObjects || [];
      
      console.log('🔄 [SAVE_SELECTED_OBJECTS] Existing helper_json:', existingHelperJson);
      console.log('🔄 [SAVE_SELECTED_OBJECTS] Last saved objects:', lastSavedObjects);
      
      // Check if value actually changed from last saved value
      const hasChanged = JSON.stringify(lastSavedObjects.sort()) !== JSON.stringify(selectedObjects.sort());
      
      console.log('🔄 [SAVE_SELECTED_OBJECTS] Has changed:', hasChanged);
      
      if (!hasChanged) {
        console.log('📝 [SAVE_SELECTED_OBJECTS] No change detected, skipping save');
        return;
      }
      
      const payload = {
        ...existingHelperJson,
        selectedObjects: selectedObjects,
        updatedAt: new Date().toISOString(),
      };

      console.log('🔄 [SAVE_SELECTED_OBJECTS] Payload to save:', payload);

      const { data, error } = await supabase
        .from('profiles')
        .update({ helper_json: payload })
        .eq('id', user.id);

      if (error) {
        console.error('❌ [SAVE_SELECTED_OBJECTS] Supabase error:', error);
        throw error;
      }

      console.log('✅ [SAVE_SELECTED_OBJECTS] Successfully saved to database');

      // Update local state
      setProfile((p) => (p ? { ...p, helper_json: payload } as Profile : p));
      
      console.log('💾 [SAVE_SELECTED_OBJECTS] Saved selectedObjects to helper_json (changed):', selectedObjects);
    } catch (err) {
      console.error('❌ [SAVE_SELECTED_OBJECTS] Error saving selectedObjects:', err);
    }
  };

  // Merge and persist new mappings into existing profile JSON
  const upsertMappedJson = async (
    changes: Partial<Record<'contacts' | 'companies' | 'deals' | 'tickets', Record<string, any>>>
  ) => {
    if (!user?.id) return;
    try {
      const existing = profile?.hubspot_crm_a_mapped_json || {};
      const existingChanges = (existing?.changes || {}) as Partial<Record<'contacts' | 'companies' | 'deals' | 'tickets', Record<string, any>>>;
      const merged: Partial<Record<'contacts' | 'companies' | 'deals' | 'tickets', Record<string, any>>> = { ...existingChanges };
      (Object.keys(changes) as Array<'contacts' | 'companies' | 'deals' | 'tickets'>).forEach((key) => {
        merged[key] = { ...(existingChanges[key] || {}), ...(changes as any)[key] };
      });

      const payload = {
        instance: existing.instance || 'a',
        updatedAt: new Date().toISOString(),
        changes: merged,
      };

      await supabase
        .from('profiles')
        .update({ hubspot_crm_a_mapped_json: payload })
        .eq('id', user.id);

      // Update local state
      setProfile((p) => (p ? { ...p, hubspot_crm_a_mapped_json: payload } as Profile : p));
    } catch (err) {
      console.error('❌ upsertMappedJson failed:', err);
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      try {
        console.log('🔄 [USER_CONTEXT] Refreshing user profile...');
        await fetchProfile(user.id);
        console.log('✅ [USER_CONTEXT] Profile refreshed successfully');
      } catch (error) {
        console.error('❌ [USER_CONTEXT] Error refreshing profile:', error);
      }
    }
  }

  // Enhanced profile refresh with retry logic
  const refreshProfileWithRetry = async (maxRetries = 3) => {
    if (!user?.id) return;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [USER_CONTEXT] Profile refresh attempt ${attempt}/${maxRetries}`);
        await fetchProfile(user.id);
        console.log('✅ [USER_CONTEXT] Profile refreshed successfully');
        return; // Success, exit retry loop
      } catch (error) {
        console.error(`❌ [USER_CONTEXT] Profile refresh attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          console.error('❌ [USER_CONTEXT] All profile refresh attempts failed');
          break;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  // Add to window for debugging - Only in development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).debugSelectedObjects = {
        load: loadSelectedObjects,
        checkLocalStorage: () => {
          console.log('🔍 [DEBUG] selectedObjects:', localStorage.getItem('selectedObjects'));
          console.log('🔍 [DEBUG] selectedObjects_last:', localStorage.getItem('selectedObjects_last'));
        },
        checkDatabase: async () => {
          if (user?.id) {
            const { data, error } = await supabase
              .from('profiles')
              .select('helper_json')
              .eq('id', user.id)
              .single();
            
            if (error) {
              console.error('❌ [DEBUG] Database error:', error);
            } else {
              console.log('🔍 [DEBUG] Database helper_json:', data?.helper_json);
              console.log('🔍 [DEBUG] Database selectedObjects:', data?.helper_json?.selectedObjects);
            }
          }
        },
        saveCurrent: async () => {
          const current = JSON.parse(localStorage.getItem('selectedObjects_last') || '[]');
          console.log('🔄 [DEBUG] Saving current localStorage:', current);
          await saveSelectedObjects(current);
        }
      };
    }
  }, [loadSelectedObjects, user, saveSelectedObjects]);

  // Load selectedObjects when profile changes
  useEffect(() => {
    if (profile && user) {
      loadSelectedObjects();
    }
  }, [profile, user]);

  useEffect(() => {
    // Set up custom properties cleanup
    setupCustomPropertiesCleanup();
    
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ Error getting session:', error)
          setIsLoading(false)
          return
        }

        const currentSession = data.session
        
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          // Clear caches only if a NEW user logs in compared to last stored user
          try {
            const lastUserId = session?.user?.id;
            if (lastUserId !== currentSession.user.id) {
              clearCacheOnNewUserLogin();
            }
          } catch {}
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null)
          setIsProfileLoading(false);
        }
      } catch (error) {
        console.error('❌ Unexpected error in UserContext:', error);
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AUTH_STATE_CHANGE] Event:', event);
        console.log('🔄 [AUTH_STATE_CHANGE] Session:', !!session);
        console.log('🔄 [AUTH_STATE_CHANGE] Current user:', !!user);
        console.log('🔄 [AUTH_STATE_CHANGE] Current profile:', !!profile);
        
        // Save selectedObjects BEFORE any state changes if user is signing out
        if (event === 'SIGNED_OUT' && user && profile) {
          try {
            console.log('🔄 [LOGOUT] Saving selectedObjects before state clear...');
            console.log('🔄 [LOGOUT] Current user ID:', user.id);
            console.log('🔄 [LOGOUT] Current profile exists:', !!profile);
            
            // Try multiple localStorage keys to find selectedObjects
            let selectedObjects = [];
            
            // First try selectedObjects_last
            const lastSaved = localStorage.getItem('selectedObjects_last');
            if (lastSaved) {
              selectedObjects = JSON.parse(lastSaved);
              console.log('🔄 [LOGOUT] Found selectedObjects_last:', selectedObjects);
            } else {
              // Try selectedObjects (without _last)
              const currentSaved = localStorage.getItem('selectedObjects');
              if (currentSaved) {
                selectedObjects = JSON.parse(currentSaved);
                console.log('🔄 [LOGOUT] Found selectedObjects:', selectedObjects);
              } else {
                console.log('📝 [LOGOUT] No selectedObjects found in localStorage');
              }
            }
            
            console.log('🔄 [LOGOUT] Attempting to save selectedObjects:', selectedObjects);
            console.log('🔄 [LOGOUT] Raw localStorage values:');
            console.log('  - selectedObjects:', localStorage.getItem('selectedObjects'));
            console.log('  - selectedObjects_last:', localStorage.getItem('selectedObjects_last'));
            
            if (selectedObjects.length > 0) {
              await saveSelectedObjectsWithUserData(selectedObjects, user.id, profile);
              console.log('✅ [LOGOUT] Successfully saved selectedObjects to database');
            } else {
              console.log('📝 [LOGOUT] No selectedObjects to save');
            }
          } catch (error) {
            console.warn('⚠️ [LOGOUT] Error saving selectedObjects:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('📝 [LOGOUT] SIGNED_OUT event but no user/profile data available');
        }

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Clear caches only if user truly changed
          try {
            const lastUserId = user?.id;
            if (lastUserId !== session.user.id) {
              clearCacheOnNewUserLogin();
            }
          } catch {}
          fetchProfile(session.user.id);
        } else {
          // User signed out - clear cache AFTER saving
          clearAllUserCache();
          setProfile(null)
          setIsProfileLoading(false);
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Consider loading complete only when both session and profile are resolved
  const isFullyLoaded = !isLoading && !isProfileLoading;

  const value = {
    session,
    user,
    profile,
    isLoading: !isFullyLoaded, // Use combined loading state
    refreshProfile,
    refreshProfileWithRetry,
    upsertMappedJson,
    saveSelectedObjects,
    loadSelectedObjects
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 