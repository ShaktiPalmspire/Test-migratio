import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface HubSpotContact {
  id: string;
  properties?: Record<string, string | number | boolean | null>;
  portal?: 'A' | 'B';
}

export interface DealsResponse {
  results?: HubSpotContact[];
  paging?: { next?: { after?: string } };
}

export interface DealsState {
  // Cache for different instances
  cacheA: DealsResponse | null;
  cacheB: DealsResponse | null;
  
  // Timestamps for cache validation
  lastFetchTimeA: number | null;
  lastFetchTimeB: number | null;
  
  // Loading states
  loadingA: boolean;
  loadingB: boolean;
  
  // Error states
  errorA: string | null;
  errorB: string | null;
  
  // Cache duration (5 minutes)
  cacheDuration: number;
}

// Load initial state from localStorage if available
const loadPersistedState = (): DealsState => {
  // ✅ SSR: server pe localStorage nahi hota
  if (typeof window === 'undefined') return initialState;

  try {
    const persistedState = window.localStorage.getItem('hubspotDealsState');
    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      return {
        ...initialState,
        ...parsed,
        loadingA: false,
        loadingB: false,
        errorA: null,
        errorB: null,
      };
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
  return initialState;
};

const initialState: DealsState = {
  cacheA: null,
  cacheB: null,
  lastFetchTimeA: null,
  lastFetchTimeB: null,
  loadingA: false,
  loadingB: false,
  errorA: null,
  errorB: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Async thunk for fetching Deals
export const fetchDealsAsync = createAsyncThunk(
  'Deals/fetchDeals',
  async ({ instance, after, userId, backendBase }: {
    instance: 'A' | 'B';
    after?: string | null;
    userId: string;
    backendBase: string;
  }, { rejectWithValue }) => {
    try {
      // Ensure backend session
      await fetch(`${backendBase}api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      // Fetch Deals
      const url = new URL("hubspot/objects/Deals", backendBase);
      url.searchParams.set("userId", userId);
      url.searchParams.set("instance", instance);
      if (after) url.searchParams.set("after", after);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to load Deals from Portal ${instance} (${res.status}): ${text}`);
      }

      const data = await res.json();
      const payload: DealsResponse = (data as { Deals?: DealsResponse }).Deals ?? (data as DealsResponse);
      
      return { instance, payload, timestamp: Date.now() };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const DealsSlice = createSlice({
  name: 'Deals',
  initialState: loadPersistedState(),
  reducers: {
    // Set cache for specific instance
    setDealsCache: (state, action: PayloadAction<{
      instance: 'A' | 'B';
      data: DealsResponse;
      timestamp: number;
    }>) => {
      const { instance, data, timestamp } = action.payload;
      if (instance === 'A') {
        state.cacheA = data;
        state.lastFetchTimeA = timestamp;
        state.errorA = null;
      } else {
        state.cacheB = data;
        state.lastFetchTimeB = timestamp;
        state.errorB = null;
      }
      
      // Persist to localStorage
      persistState(state);
    },

    // Clear cache for specific instance
    clearDealsCache: (state, action: PayloadAction<'A' | 'B'>) => {
      const instance = action.payload;
      if (instance === 'A') {
        state.cacheA = null;
        state.lastFetchTimeA = null;
        state.errorA = null;
      } else {
        state.cacheB = null;
        state.lastFetchTimeB = null;
        state.errorB = null;
      }
      
      // Persist to localStorage
      persistState(state);
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<{
      instance: 'A' | 'B';
      loading: boolean;
    }>) => {
      const { instance, loading } = action.payload;
      if (instance === 'A') {
        state.loadingA = loading;
      } else {
        state.loadingB = loading;
      }
    },

    // Set error state
    setError: (state, action: PayloadAction<{
      instance: 'A' | 'B';
      error: string | null;
    }>) => {
      const { instance, error } = action.payload;
      if (instance === 'A') {
        state.errorA = error;
      } else {
        state.errorB = error;
      }
      
      // Persist to localStorage
      persistState(state);
    },

    // Update cache duration
    setCacheDuration: (state, action: PayloadAction<number>) => {
      state.cacheDuration = action.payload;
      persistState(state);
    },

    // Clear all cached data
    clearAllCache: (state) => {
      state.cacheA = null;
      state.cacheB = null;
      state.lastFetchTimeA = null;
      state.lastFetchTimeB = null;
      state.errorA = null;
      state.errorB = null;
      
      // Clear from localStorage
      localStorage.removeItem('hubspotDealsState');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDealsAsync.pending, (state, action) => {
        const instance = action.meta.arg.instance;
        if (instance === 'A') {
          state.loadingA = true;
          state.errorA = null;
        } else {
          state.loadingB = true;
          state.errorB = null;
        }
      })
      .addCase(fetchDealsAsync.fulfilled, (state, action) => {
        const { instance, payload, timestamp } = action.payload;
        if (instance === 'A') {
          state.cacheA = payload;
          state.lastFetchTimeA = timestamp;
          state.loadingA = false;
          state.errorA = null;
        } else {
          state.cacheB = payload;
          state.lastFetchTimeB = timestamp;
          state.loadingB = false;
          state.errorB = null;
        }
        
        // Persist to localStorage
        persistState(state);
      })
      .addCase(fetchDealsAsync.rejected, (state, action) => {
        const instance = action.meta.arg.instance;
        if (instance === 'A') {
          state.loadingA = false;
          state.errorA = action.payload as string;
        } else {
          state.loadingB = false;
          state.errorB = action.payload as string;
        }
        
        // Persist to localStorage
        persistState(state);
      });
  },
});

// Helper function to persist state to localStorage
const persistState = (state: DealsState) => {
  try {
    const stateToPersist = {
      cacheA: state.cacheA,
      cacheB: state.cacheB,
      lastFetchTimeA: state.lastFetchTimeA,
      lastFetchTimeB: state.lastFetchTimeB,
      cacheDuration: state.cacheDuration,
      // Don't persist loading and error states
    };
    localStorage.setItem('hubspotDealsState', JSON.stringify(stateToPersist));
  } catch (error) {
    console.error('Failed to persist state to localStorage:', error);
  }
};

// Export actions
export const {
  setDealsCache,
  clearDealsCache,
  setLoading,
  setError,
  setCacheDuration,
  clearAllCache,
} = DealsSlice.actions;

// Export selectors
export const selectCache = (state: { deals: DealsState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.deals.cacheA : state.deals.cacheB;
};

export const selectLastFetchTime = (state: { deals: DealsState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.deals.lastFetchTimeA : state.deals.lastFetchTimeB;
};

export const selectIsLoading = (state: { deals: DealsState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.deals.loadingA : state.deals.loadingB;
};

export const selectDealsCache = (state: { deals: DealsState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.deals.cacheA : state.deals.cacheB;
};

export const selectError = (state: { deals: DealsState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.deals.errorA : state.deals.errorB;
};

export const selectCanUseCache = (state: { deals: DealsState }, instance: 'A' | 'B') => {
  const lastFetchTime = instance === 'A' ? state.deals.lastFetchTimeA : state.deals.lastFetchTimeB;
  if (!lastFetchTime) return false;
  return Date.now() - lastFetchTime < state.deals.cacheDuration;
};

export const selectCacheStatus = (state: { deals: DealsState }, instance: 'A' | 'B') => {
  const lastFetchTime = instance === 'A' ? state.deals.lastFetchTimeA : state.deals.lastFetchTimeB;
  if (!lastFetchTime) return 'no-cache';
  const timeSinceLastFetch = Date.now() - lastFetchTime;
  if (timeSinceLastFetch < state.deals.cacheDuration) return 'fresh';
  return 'expired';
};

export default DealsSlice.reducer;