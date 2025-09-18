import { useState, useEffect, useRef } from 'react';
import { ObjectKey, CustomPropertiesState, PropPoolState, LoadedListsState } from '../types/propertyTypes';
import { useUser } from '@/context/UserContext';
import { PropertyItem } from '../types/propertyTypes';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const useCustomProperties = (selectedObjects: Set<ObjectKey>) => {
  const [customProperties, setCustomProperties] = useState<CustomPropertiesState>({
    contacts: [],
    companies: [],
    deals: [],
    tickets: [],
  });
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const fetchedInSessionRef = useRef<Set<ObjectKey>>(new Set());
  const { user, profile, refreshProfile } = useUser();

  // Restore session-fetched set across remounts
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("fetchedInSessionObjects");
      if (raw) {
        const arr: ObjectKey[] = JSON.parse(raw);
        fetchedInSessionRef.current = new Set(arr);
      }
    } catch (error) {
      console.warn('⚠️ [CUSTOM_PROPERTIES] Error restoring session data:', error);
    }
  }, []);

  const persistFetchedSession = () => {
    try {
      sessionStorage.setItem(
        "fetchedInSessionObjects",
        JSON.stringify(Array.from(fetchedInSessionRef.current))
      );
    } catch (error) {
      console.warn('⚠️ [CUSTOM_PROPERTIES] Error persisting session data:', error);
    }
  };

  const fetchCustomProperties = async (objectType: ObjectKey) => {
    try {
      
      // Check if already fetched in this session
      if (fetchedInSessionRef.current.has(objectType) && (customProperties[objectType]?.length ?? 0) > 0) {
        return customProperties[objectType];
      }
      
      // Check localStorage cache
      const cacheKey = `customProperties_${objectType}`;
      const cachedRaw = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          if (Array.isArray(cached?.data) && typeof cached?.timestamp === "number") {
            const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
            if (isFresh) {
              fetchedInSessionRef.current.add(objectType);
              persistFetchedSession();
              setCustomProperties(prev => ({ ...prev, [objectType]: cached.data }));
              return cached.data;
            }
          }
        } catch (error) {
          console.warn('⚠️ [FETCH_CUSTOM] Error parsing cached data:', error);
          localStorage.removeItem(cacheKey);
        }
      }
      
      // Validate user and profile
      if (!user?.id || !profile) {
        return [];
      }
      
      // Check if token is expired and refresh if needed
      const isExpired = profile.hubspot_access_token_expires_at_a && 
        new Date(profile.hubspot_access_token_expires_at_a) <= new Date();
      
      if (isExpired) {
        console.log('🔄 [FETCH_CUSTOM] Token expired, refreshing...');
        try {
          const backendBase = (process.env.NEXT_PUBLIC_DOMAIN_BACKEND || "http://localhost:3000/").replace(/\/?$/, "/");
          const res = await fetch(`${backendBase}hubspot/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              refreshToken: profile.hubspot_refresh_token_a,
              userId: user.id,
              instance: "a",
            }),
          });

          if (!res.ok) {
            console.log('❌ [FETCH_CUSTOM] Token refresh failed, skipping fetch');
            return [];
          }

          await res.json();
          await refreshProfile();
          console.log('✅ [FETCH_CUSTOM] Token refreshed successfully');
        } catch (error) {
          console.warn('⚠️ [FETCH_CUSTOM] Error refreshing token:', error);
          return [];
        }
      }
      
      // Fetch from API
      const url = `/api/hubspot/schema/${objectType}?propertyType=custom&userId=${user.id}&instance=a`;
      
      console.log('🔄 [FETCH_CUSTOM] Fetching custom properties for:', objectType);
      console.log('🔄 [FETCH_CUSTOM] URL:', url);
      console.log('🔄 [FETCH_CUSTOM] User ID:', user.id);
      console.log('🔄 [FETCH_CUSTOM] Profile token exists:', !!profile.hubspot_access_token_a);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${profile.hubspot_access_token_a}`,
          'X-User-ID': user.id,
          'X-Portal-ID': String(profile.hubspot_portal_id_a || '')
        }
      });
      
      console.log('🔄 [FETCH_CUSTOM] Response status:', response.status);
      console.log('🔄 [FETCH_CUSTOM] Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FETCH_CUSTOM] Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('🔄 [FETCH_CUSTOM] Response data:', data);
      console.log('🔄 [FETCH_CUSTOM] Data ok:', data.ok);
      console.log('🔄 [FETCH_CUSTOM] Data results:', data.data?.results?.length || 0);
      
      // Extract properties from response
      const properties = (data.ok && data.data?.results) ? data.data.results :
                        data.results ? data.results :
                        data.properties ? data.properties : [];
      
      console.log('🔄 [FETCH_CUSTOM] Extracted properties:', properties.length);
      
      // Filter out default properties to ensure only custom properties
      const customOnlyProperties = properties.filter((prop: any) => !prop.hubspotDefined);
      
      console.log('🔄 [FETCH_CUSTOM] Custom only properties:', customOnlyProperties.length);
      console.log('🔄 [FETCH_CUSTOM] Sample custom property:', customOnlyProperties[0]);
      
      // Cache the result
      try {
        const payload = { data: customOnlyProperties, timestamp: Date.now() };
        localStorage.setItem(cacheKey, JSON.stringify(payload));
        setCustomProperties(prev => ({ ...prev, [objectType]: customOnlyProperties }));
      } catch (error) {
        console.warn('⚠️ [FETCH_CUSTOM] Error caching data:', error);
      }
      
      fetchedInSessionRef.current.add(objectType);
      persistFetchedSession();
      return customOnlyProperties;
      
    } catch (error) {
      console.error('❌ [FETCH_CUSTOM] Error fetching custom properties:', error);
      return [];
    }
  };

  const fetchAllCustomProperties = async () => {
    if (selectedObjects.size === 0) return;
    
    setIsLoadingCustom(true);
    const customProps: CustomPropertiesState = { contacts: [], companies: [], deals: [], tickets: [] };
    
    try {
      await Promise.all(
        Array.from(selectedObjects).map(async (objectType) => {
          const props = await fetchCustomProperties(objectType);
          customProps[objectType] = props;
        })
      );
      setCustomProperties(customProps);
    } catch (error) {
      console.error('❌ [FETCH_ALL_CUSTOM] Error fetching all custom properties:', error);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  return {
    customProperties,
    isLoadingCustom,
    fetchCustomProperties,
    fetchAllCustomProperties,
  };
};

export const usePropertyPool = () => {
  const [propPool, setPropPool] = useState<PropPoolState>({
    contacts: null,
    companies: null,
    deals: null,
    tickets: null,
  });
  const [loadedLists, setLoadedLists] = useState<LoadedListsState>({
    contacts: false,
    companies: false,
    deals: false,
    tickets: false,
  });
  const { user, profile, refreshProfile } = useUser();

  const mergeWithDefaults = (obj: ObjectKey, list: PropertyItem[], defaultMetaByName: Record<ObjectKey, Record<string, { type?: string; fieldType?: string }>>) => {
    const meta = defaultMetaByName[obj];
    return list.map((p) => ({
      ...p,
      type: p.type ?? meta[p.name]?.type,
      fieldType: p.fieldType ?? meta[p.name]?.fieldType,
    }));
  };

  const loadProps = async (obj: ObjectKey, defaultMapModal: Record<ObjectKey, PropertyItem[]>, defaultMetaByName: Record<ObjectKey, Record<string, { type?: string; fieldType?: string }>>) => {
    if (loadedLists[obj]) {
      return;
    }
    
    let arr: PropertyItem[] = [];
    
    try {
      if (user?.id && profile) {
                  // Check if token is expired and refresh if needed
                  const isExpired = profile.hubspot_access_token_expires_at_a && 
                    new Date(profile.hubspot_access_token_expires_at_a) <= new Date();
                  
                  if (isExpired) {
                    console.log('🔄 [LOAD_PROPS] Token expired, refreshing...');
                    try {
                      const backendBase = (process.env.NEXT_PUBLIC_DOMAIN_BACKEND || "http://localhost:3000/").replace(/\/?$/, "/");
                      const res = await fetch(`${backendBase}hubspot/refresh-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          refreshToken: profile.hubspot_refresh_token_a,
                          userId: user.id,
                          instance: "a",
                        }),
                      });

                      if (!res.ok) {
                        console.log('❌ [LOAD_PROPS] Token refresh failed, skipping load');
                        return;
                      }

                      await res.json();
                      await refreshProfile();
                      console.log('✅ [LOAD_PROPS] Token refreshed successfully');
                    } catch (error) {
                      console.warn('⚠️ [LOAD_PROPS] Error refreshing token:', error);
                      return;
                    }
                  }
        
        // Fetch from API
        const res = await fetch(`/api/hubspot/schema/${obj}?userId=${user.id}&instance=a`);
        
        if (res.ok) {
          const data = await res.json();
          const list = data?.data?.results || data?.results || data?.properties || [];
          
          arr = (list as any[]).map((p) => ({
            name: p.name || p.internalName,
            label: p.label || p.name || p.internalName,
            type: p.type,
            fieldType: p.fieldType,
          }));
          
        } else {
          console.warn('⚠️ [LOAD_PROPS] API response not ok for:', obj, 'status:', res.status);
        }
      }
    } catch (error) {
      console.error('❌ [LOAD_PROPS] Error loading properties for:', obj, error);
    }
    
    // Fallback to defaults if no data loaded
    if (!arr.length) {
      arr = defaultMapModal[obj];
    } else {
      // Merge with defaults to ensure all properties have type and fieldType
      arr = mergeWithDefaults(obj, arr, defaultMetaByName);
    }
    
    setPropPool((s) => ({ ...s, [obj]: arr }));
    setLoadedLists((s) => ({ ...s, [obj]: true }));
  };

  return {
    propPool,
    loadedLists,
    loadProps,
    setPropPool,
  };
};

