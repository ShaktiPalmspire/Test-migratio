import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface HubSpotContact {
  id: string;
  properties?: Record<string, string | number | boolean | null>;
  portal?: 'A' | 'B';
}

export interface CompaniesResponse {
  results?: HubSpotContact[];
  paging?: { next?: { after?: string } };
}

export interface CompaniesState {
  // Cache for different instances
  cacheA: CompaniesResponse | null;
  cacheB: CompaniesResponse | null;
  
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
const loadPersistedState = (): CompaniesState => {
  // ✅ SSR: server pe localStorage nahi hota
  if (typeof window === 'undefined') return initialState;

  try {
    const persistedState = window.localStorage.getItem('hubspotCompaniesState');
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

const initialState: CompaniesState = {
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
// Async thunk for fetching Companies
export const fetchCompaniesAsync = createAsyncThunk(
  'Companies/fetchCompanies',
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

      // Fetch Companies
      const url = new URL("hubspot/objects/Companies", backendBase);
      url.searchParams.set("userId", userId);
      url.searchParams.set("instance", instance);
      if (after) url.searchParams.set("after", after);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to load Companies from Portal ${instance} (${res.status}): ${text}`);
      }

      const data = await res.json();
      const payload: CompaniesResponse = (data as { Companies?: CompaniesResponse }).Companies ?? (data as CompaniesResponse);
      
      return { instance, payload, timestamp: Date.now() };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const CompaniesSlice = createSlice({
  name: 'Companies',
  initialState: loadPersistedState(),
  reducers: {
    // Set cache for specific instance
    setCompaniesCache: (state, action: PayloadAction<{
      instance: 'A' | 'B';
      data: CompaniesResponse;
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
    clearCompaniesCache: (state, action: PayloadAction<'A' | 'B'>) => {
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
      localStorage.removeItem('hubspotCompaniesState');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompaniesAsync.pending, (state, action) => {
        const instance = action.meta.arg.instance;
        if (instance === 'A') {
          state.loadingA = true;
          state.errorA = null;
        } else {
          state.loadingB = true;
          state.errorB = null;
        }
      })
      .addCase(fetchCompaniesAsync.fulfilled, (state, action) => {
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
      .addCase(fetchCompaniesAsync.rejected, (state, action) => {
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
const persistState = (state: CompaniesState) => {
  try {
    const stateToPersist = {
      cacheA: state.cacheA,
      cacheB: state.cacheB,
      lastFetchTimeA: state.lastFetchTimeA,
      lastFetchTimeB: state.lastFetchTimeB,
      cacheDuration: state.cacheDuration,
      // Don't persist loading and error states
    };
    localStorage.setItem('hubspotCompaniesState', JSON.stringify(stateToPersist));
  } catch (error) {
    console.error('Failed to persist state to localStorage:', error);
  }
};

// Export actions
export const {
  setCompaniesCache,
  clearCompaniesCache,
  setLoading,
  setError,
  setCacheDuration,
  clearAllCache,
} = CompaniesSlice.actions;

// Export selectors

// Export selectors
export const selectCache = (state: { companies: CompaniesState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.companies.cacheA : state.companies.cacheB;
};

export const selectLastFetchTime = (state: { companies: CompaniesState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.companies.lastFetchTimeA : state.companies.lastFetchTimeB;
};

export const selectIsLoading = (state: { companies: CompaniesState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.companies.loadingA : state.companies.loadingB;
};

export const selectCompaniesCache = (state: { companies: CompaniesState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.companies.cacheA : state.companies.cacheB;
};

export const selectError = (state: { companies: CompaniesState }, instance: 'A' | 'B') => {
  return instance === 'A' ? state.companies.errorA : state.companies.errorB;
};

export const selectCanUseCache = (state: { companies: CompaniesState }, instance: 'A' | 'B') => {
  const lastFetchTime = instance === 'A' ? state.companies.lastFetchTimeA : state.companies.lastFetchTimeB;
  if (!lastFetchTime) return false;
  return Date.now() - lastFetchTime < state.companies.cacheDuration;
};

export const selectCacheStatus = (state: { companies: CompaniesState }, instance: 'A' | 'B') => {
  const lastFetchTime = instance === 'A' ? state.companies.lastFetchTimeA : state.companies.lastFetchTimeB;
  if (!lastFetchTime) return 'no-cache';
  const timeSinceLastFetch = Date.now() - lastFetchTime;
  if (timeSinceLastFetch < state.companies.cacheDuration) return 'fresh';
  return 'expired';
};


export default CompaniesSlice.reducer;