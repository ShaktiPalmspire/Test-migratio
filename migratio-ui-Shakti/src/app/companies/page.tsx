"use client";

import React from "react";
import { useUser } from "@/context/UserContext";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { getTimeUntilExpiry, isUserAdmin, isHubSpotTokenExpired } from "@/utils/cacheUtils";
import { hubspotDealProperties } from "@/context/hubspotdefaultproperties";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, ColDef } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { resetApp } from "@/store";

ModuleRegistry.registerModules([AllCommunityModule]);

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCompaniesAsync,
  selectCompaniesCache,
  selectLastFetchTime,
  selectIsLoading,
  selectError,
  selectCanUseCache,
  selectCacheStatus,
  setCompaniesCache,
  clearCompaniesCache,
  setError,
} from "@/store/slices/companiesSlice";

export default function CompaniesPage() {
  const { user, profile, isLoading, refreshProfile } = useUser();
  const router = useRouter();

  // 🔐 single place to check admin
  const showAdmin = isUserAdmin(user?.email);

  // Redux
  const dispatch = useAppDispatch();
  const CompaniesCache = useAppSelector((s) => selectCompaniesCache(s, "A"));
  const lastFetchTime = useAppSelector((s) => selectLastFetchTime(s, "A"));
  const loadingA = useAppSelector((s) => selectIsLoading(s, "A"));
  const error = useAppSelector((s) => selectError(s, "A"));
  const canUseCache = useAppSelector((s) => selectCanUseCache(s, "A"));
  const cacheStatus = useAppSelector((s) => selectCacheStatus(s, "A"));

  // UI state
  const [CompaniesA, setCompaniesA] = React.useState<any[]>([]);
  const [nextAfterA, setNextAfterA] = React.useState<string | null>(null);
  const [dataSource, setDataSource] = React.useState<"cache" | "api" | "none">("none");
  const [isRefreshingToken, setIsRefreshingToken] = React.useState(false);
  const [autoRefreshing, setAutoRefreshing] = React.useState(false);

  // 🔹 label map (name -> label) so custom headers show display label
  const [dealLabelMap, setDealLabelMap] = React.useState<Record<string, string>>({});

  const backendBase = (process.env.NEXT_PUBLIC_DOMAIN_BACKEND || "http://localhost:3000/").replace(/\/?$/, "/");
  const profileRef = React.useRef(profile);

  // -------- user/portal-scoped LS keys --------
  const lsKey = (base: string, userId?: string | null, portalId?: string | number | null) =>
    `${base}::user=${userId ?? "anon"}::portalA=${portalId ?? "none"}`;

  const LS_Companies_KEY = React.useMemo(
    () => lsKey("cached_Companies_a", user?.id ?? null, (profile?.hubspot_portal_id_a as any) ?? null),
    [user?.id, profile?.hubspot_portal_id_a]
  );
  const LS_Companies_TIME_KEY = React.useMemo(
    () => lsKey("cached_Companies_time_a", user?.id ?? null, (profile?.hubspot_portal_id_a as any) ?? null),
    [user?.id, profile?.hubspot_portal_id_a]
  );

  // ⚡ FAST AUTO-FETCH
  const fastFetchFired = React.useRef(false);

  React.useEffect(() => {
    if (fastFetchFired.current) return;
    if (!user?.id || !profile?.hubspot_access_token_a) return;

    const hasRedux = !!CompaniesCache?.results?.length;
    const hasLS = !!localStorage.getItem(LS_Companies_KEY);

    if (!hasRedux && !hasLS) {
      fastFetchFired.current = true;
      setDataSource("api");
      dispatch(
        fetchCompaniesAsync({
          instance: "A",
          after: null,
          userId: user.id,
          backendBase,
        })
      )
        .unwrap()
        .catch(() => {});
    }
  }, [user?.id, profile?.hubspot_access_token_a, LS_Companies_KEY, CompaniesCache, dispatch, backendBase]);

  // keep latest profile in a ref
  React.useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // -------- build default label map once
  const buildDefaultLabelMap = React.useCallback(() => {
    const m: Record<string, string> = {};
    for (const p of hubspotDealProperties) {
      m[p.name] = p.label || p.name;
    }
    return m;
  }, []);

  // -------- fetch + cache custom labels for this portal, but only if not already cached --------
  const fetchDealPropertyLabels = React.useCallback(async () => {
    const base = buildDefaultLabelMap();
    const cacheKey = `schema:Companies:labels:${profile?.hubspot_portal_id_a}`;

    // Try Redux first
    if (Object.keys(dealLabelMap).length > 0) return; // Already loaded

    // Try LS cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as Record<string, string>;
      setDealLabelMap({ ...base, ...parsed });
      return;
    }

    // Only fetch if not cached
    if (!user?.id || !profile?.hubspot_access_token_a) {
      setDealLabelMap(base);
      return;
    }

    try {
      // prefer 'all', fall back to 'custom'
      const urls = [
        `/api/hubspot/schema/Companies?propertyType=all&userId=${user.id}&instance=a`,
        `/api/hubspot/schema/Companies?propertyType=custom&userId=${user.id}&instance=a`,
      ];

      let results: any[] = [];
      for (const url of urls) {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          results = data?.data?.results ?? data?.results ?? data?.properties ?? [];
          if (Array.isArray(results) && results.length) break;
        }
      }

      const customMap: Record<string, string> = {};
      for (const p of results) {
        if (!p?.name) continue;
        customMap[p.name] = p.label || p.name;
      }

      const finalMap = { ...base, ...customMap };
      setDealLabelMap(finalMap);
      localStorage.setItem(cacheKey, JSON.stringify(customMap));
    } catch (e) {
      console.warn("[Companies] property label fetch failed", e);
      setDealLabelMap(base);
    }
  }, [buildDefaultLabelMap, profile?.hubspot_portal_id_a, user?.id, dealLabelMap, profile?.hubspot_access_token_a]);

  React.useEffect(() => {
    // Only fetch if not already loaded
    if (Object.keys(dealLabelMap).length === 0 && profile?.hubspot_access_token_a) {
      fetchDealPropertyLabels();
    }
  }, [profile?.hubspot_access_token_a, fetchDealPropertyLabels, dealLabelMap]);

  // -------- REAL account/portal switch detection --------
  const prevKeyRef = React.useRef<{ uid: string | null; portal: string | number | null }>({ uid: null, portal: null });
  const prevUserRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const currUid = user?.id ?? null;
    const currPortal = (profile?.hubspot_portal_id_a ?? null) as string | number | null;

    if (prevUserRef.current !== null && prevUserRef.current !== currUid) {
      // Full reset on user change
      setCompaniesA([]);
      setNextAfterA(null);
      setDataSource("none");
      dispatch(clearCompaniesCache("A"));
      localStorage.clear();
    }
    prevUserRef.current = currUid;

    const switched =
      prevKeyRef.current.uid !== null &&
      (prevKeyRef.current.uid !== currUid || prevKeyRef.current.portal !== currPortal);

    if (switched) {
      setCompaniesA([]);
      setNextAfterA(null);
      setDataSource("none");
      dispatch(clearCompaniesCache("A"));
      const oldDataKey = lsKey("cached_Companies_a", prevKeyRef.current.uid, prevKeyRef.current.portal);
      const oldTimeKey = lsKey("cached_Companies_time_a", prevKeyRef.current.uid, prevKeyRef.current.portal);
      localStorage.removeItem(oldDataKey);
      localStorage.removeItem(oldTimeKey);
      // labels bhi re-fetch
      fetchDealPropertyLabels();
    }

    prevKeyRef.current = { uid: currUid, portal: currPortal };
  }, [user?.id, profile?.hubspot_portal_id_a, dispatch, fetchDealPropertyLabels]);

  // -------- SWR: show cache immediately, then background refresh if needed --------
  const smartRefresh = React.useCallback(async () => {
    if (!profile || !user?.id) return;
    try {
      dispatch(setError({ instance: "A", error: null }));
      await dispatch(
        fetchCompaniesAsync({
          instance: "A",
          after: null,
          userId: user.id,
          backendBase,
        })
      ).unwrap();
      setDataSource("api");
    } catch (e) {
      console.error("[Companies] smartRefresh failed", e);
      dispatch(setError({ instance: "A", error: "Failed to refresh Companies. Please try again." }));
    }
  }, [profile, user?.id, dispatch, backendBase]);

  React.useEffect(() => {
    if (!user?.id) return;

    try {
      const cachedData = localStorage.getItem(LS_Companies_KEY);
      const cachedTime = localStorage.getItem(LS_Companies_TIME_KEY);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);

        setCompaniesA(parsed?.results ?? []);
        setNextAfterA(parsed?.paging?.next?.after ?? null);
        setDataSource("cache");

        if (!CompaniesCache?.results?.length) {
          const t = cachedTime ? parseInt(cachedTime, 10) : Date.now();
          dispatch(setCompaniesCache({ instance: "A", data: parsed, timestamp: t }));
        }

        const expired = !cachedTime || Date.now() - parseInt(cachedTime, 10) > 5 * 60 * 1000;
        if (expired && profile?.hubspot_access_token_a) {
          setAutoRefreshing(true);
          smartRefresh().finally(() => setAutoRefreshing(false));
        }
      } else if (profile?.hubspot_access_token_a) {
        setAutoRefreshing(true);
        smartRefresh().finally(() => setAutoRefreshing(false));
      }
    } catch (e) {
      console.error("[Companies] SWR load failed", e);
      if (profile?.hubspot_access_token_a) {
        setAutoRefreshing(true);
        smartRefresh().finally(() => setAutoRefreshing(false));
      }
    }
  }, [
    user?.id,
    profile?.hubspot_access_token_a,
    LS_Companies_KEY,
    LS_Companies_TIME_KEY,
    CompaniesCache?.results?.length,
    dispatch,
    smartRefresh,
  ]);

  // -------- persist redux -> LS (for next reload) --------
  React.useEffect(() => {
    if (CompaniesCache && lastFetchTime) {
      try {
        localStorage.setItem(LS_Companies_KEY, JSON.stringify(CompaniesCache));
        localStorage.setItem(LS_Companies_TIME_KEY, lastFetchTime.toString());
      } catch (e) {
        console.error("[Companies] save LS failed", e);
      }
    }
  }, [CompaniesCache, lastFetchTime, LS_Companies_KEY, LS_Companies_TIME_KEY]);

  const getTimeUntilExpiryInMinutes = (expiryDate: string): number => {
    const expiry = new Date(expiryDate).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiry - now) / (1000 * 60)));
  };

  const refreshExpiredToken = React.useCallback(async (): Promise<boolean> => {
    if (!user?.id || !profileRef.current?.hubspot_refresh_token_a) {
      dispatch(setError({ instance: "A", error: "Cannot refresh token. Please reconnect your HubSpot account." }));
      return false;
    }
    try {
      setIsRefreshingToken(true);

      const res = await fetch(`${backendBase}hubspot/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          refreshToken: profileRef.current.hubspot_refresh_token_a,
          userId: user.id,
          instance: "a",
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Token refresh failed:", errorText);
        dispatch(setError({ instance: "A", error: "Refresh token invalid or expired. Please reconnect your account." }));
        return false;
      }

      await res.json();
      await refreshProfile();
      dispatch(setError({ instance: "A", error: null }));
      return true;
    } catch (e) {
      console.error("Token refresh failed:", e);
      dispatch(setError({ instance: "A", error: "Failed to refresh token. Please try again." }));
      return false;
    } finally {
      setIsRefreshingToken(false);
    }
  }, [backendBase, user?.id, refreshProfile, dispatch]);

  const fetchCompanies = React.useCallback(
    async (after?: string | null) => {
      if (!profile || !user?.id) {
        dispatch(setError({ instance: "A", error: "No user profile available. Please refresh the page." }));
        return;
      }

      try {
        const isExpired =
          profileRef.current?.hubspot_access_token_expires_at_a &&
          isHubSpotTokenExpired(profileRef.current.hubspot_access_token_expires_at_a);

        const minutesLeft = profileRef.current?.hubspot_access_token_expires_at_a
          ? getTimeUntilExpiryInMinutes(profileRef.current.hubspot_access_token_expires_at_a)
          : Infinity;

        if (isExpired || minutesLeft < 1) {
          const ok = await refreshExpiredToken();
          if (!ok) {
            dispatch(setError({ instance: "A", error: "Failed to refresh token. Cannot fetch Companies." }));
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        await dispatch(fetchCompaniesAsync({ instance: "A", after, userId: user.id, backendBase })).unwrap();
        setDataSource("api");
      } catch (e: any) {
        console.error("Error fetching Companies:", e);
        if (e.message?.includes("401") || e.message?.includes("Unauthorized")) {
          const ok = await refreshExpiredToken();
          if (ok) {
            await dispatch(fetchCompaniesAsync({ instance: "A", after, userId: user.id, backendBase })).unwrap();
            setDataSource("api");
          }
        } else {
          dispatch(setError({ instance: "A", error: e instanceof Error ? e.message : "Unknown error" }));
        }
      }
    },
    [profile, user?.id, refreshExpiredToken, dispatch, backendBase]
  );

  // Keep UI in sync with Redux cache
  React.useEffect(() => {
    if (CompaniesCache?.results?.length) {
      setCompaniesA(CompaniesCache.results);
      setNextAfterA(CompaniesCache.paging?.next?.after ?? null);
    }
  }, [CompaniesCache]);

  // Auto-refresh token if it's about to expire
  React.useEffect(() => {
    if (!profile?.hubspot_access_token_expires_at_a || !user?.id || isRefreshingToken) return;

    const minutesUntilExpiry = getTimeUntilExpiryInMinutes(profile.hubspot_access_token_expires_at_a);
    const isExpired = isHubSpotTokenExpired(profile.hubspot_access_token_expires_at_a);

    if ((isExpired || minutesUntilExpiry < 2) && minutesUntilExpiry >= 0) {
      refreshExpiredToken();
    }
  }, [profile?.hubspot_access_token_expires_at_a, user?.id, isRefreshingToken, refreshExpiredToken]);

  // Table helpers
  const EmailRenderer = (p: any) =>
    p.value ? (
      <a className="text-blue-600 underline" href={`mailto:${p.value}`}>
        {p.value}
      </a>
    ) : (
      "—"
    );

  // 🔹 use merged label map (default + custom)
  const getPropertyLabel = React.useCallback((name: string): string => dealLabelMap[name] ?? name, [dealLabelMap]);

  const rowData = React.useMemo(() => CompaniesA.map((c: any) => ({ id: c.id, ...c.properties })), [CompaniesA]);

  const columnDefs = React.useMemo((): ColDef[] => {
    if (CompaniesA.length === 0) return [];
    const allKeys = Array.from(new Set(CompaniesA.flatMap((c) => Object.keys(c.properties || {}))));
    const cols: ColDef[] = [
      { field: "id", headerName: "ID", width: 120, pinned: true, sortable: true, filter: true, filterParams: { filter: "agTextColumnFilter" } },
    ];
    allKeys.forEach((k) =>
      cols.push({
        field: k,
        headerName: getPropertyLabel(k), // <- dynamic label
        headerTooltip: k,
        filter: true,
        filterParams: { filter: "agTextColumnFilter" },
        resizable: true,
        editable: true,
        cellRenderer: k === "email" ? EmailRenderer : undefined,
        floatingFilter: false,
        width: 150,
      })
    );
    return cols;
  }, [CompaniesA, getPropertyLabel]);

  // Token expiry display component (admin-only parent decides visibility)
  const TokenExpiryDisplay = () => {
    if (!profile?.hubspot_access_token_expires_at_a) return null;

    const isExpired = isHubSpotTokenExpired(profile.hubspot_access_token_expires_at_a);
    const minutesLeft = getTimeUntilExpiryInMinutes(profile.hubspot_access_token_expires_at_a);

    return (
      <p className={`text-xs mt-1 ${isExpired ? "text-red-500" : minutesLeft < 5 ? "text-yellow-500" : "text-green-500"}`}>
        Token {isExpired ? "expired" : `expires in: ${minutesLeft} minutes`}
        {isExpired && " (EXPIRED)"}
        {isRefreshingToken && " 🔄 Refreshing..."}
      </p>
    );
  };

  // 🏷️ tiny badge that shows where data came from (admin only)
  const DataSourceBadge: React.FC<{ source: "cache" | "api" | "none" }> = ({ source }) => {
    if (source === "none") return null;
    const label = source === "cache" ? "Loaded from cache" : "Loaded from HubSpot API";
    const cls =
      source === "cache"
        ? "bg-sky-50 text-sky-700 border-sky-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    return <span className={`inline-block text-xs mt-1 px-2 py-0.5 rounded border ${cls}`}>{label}</span>;
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="!h-6 mx-2" />
          <h2 className="text-2xl font-semibold">Companies (HubSpot Portal A)</h2>
        </header>

        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-sm text-gray-600">Loading user profile...</p>
              </div>
            </div>
          ) : !profile?.hubspot_access_token_a ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect CRM First</h3>
                <p className="text-sm text-gray-600 mb-6">Please connect your HubSpot CRM A to view and manage Companies.</p>
                <button
                  onClick={() => router.push("/dashboard/1")}
                  className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Connect CRM A
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 text-red-600">{error}</div>}

              <div className="mb-6">
                <div
                  className={`p-4 rounded-lg border ${
                    profile?.hubspot_access_token_a ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h3 className="font-semibold text-green-800">HubSpot Portal A</h3>
                  <p className="text-sm text-green-600">
                    {profile?.hubspot_access_token_a ? `Connected (ID: ${profile.hubspot_portal_id_a})` : "Not Connected"}
                  </p>

                  {/* Admin-only token expiry info */}
                  {profile?.hubspot_access_token_a &&
                    profile?.hubspot_access_token_expires_at_a &&
                    showAdmin && <TokenExpiryDisplay />}

                  <p className="text-xs text-green-500 mt-1">{loadingA ? "Loading..." : `${CompaniesA.length} Companies loaded`}</p>

                  {/* 🔐 Admin-only source badge */}
                  {showAdmin && CompaniesA.length > 0 && <DataSourceBadge source={dataSource} />}

                  {profile?.hubspot_access_token_a && profile?.hubspot_portal_id_a && (
                    <div className="mt-3">
                      {CompaniesA.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={smartRefresh}
                              disabled={loadingA || isRefreshingToken || autoRefreshing}
                              className="px-3 py-1.5 rounded-md bg-orange-600 text-white text-sm hover:bg-orange-700 disabled:opacity-50"
                            >
                              {loadingA || autoRefreshing ? "Refreshing..." : "🔄 Refresh Companies"}
                            </button>
                            <span className="text-xs text-gray-600">📊 {CompaniesA.length} Companies loaded</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => fetchCompanies(null)}
                              disabled={loadingA || autoRefreshing}
                              className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              {loadingA || autoRefreshing ? "Loading..." : "📥 Load Companies"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 🔐 Admin-only Redux cache debug block */}
              {showAdmin && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    🔍 Redux Cache Debug Information (Admin Only)
                  </h4>
                  <div className="text-left text-xs text-gray-600 dark:text-gray-400 space-y-2">
                    <div>
                      <strong>Cache Status:</strong> {cacheStatus}
                    </div>
                    <div>
                      <strong>Can Use Cache:</strong> {canUseCache ? "✅ Yes" : "❌ No"}
                    </div>
                    <div>
                      <strong>Companies Cache:</strong>{" "}
                      {CompaniesCache ? `✅ ${CompaniesCache.results?.length || 0} Companies` : "❌ None"}
                    </div>
                    <div>
                      <strong>Last Fetch Time:</strong> {lastFetchTime ? new Date(lastFetchTime).toLocaleString() : "Never"}
                    </div>
                    <div>
                      <strong>Cache Duration:</strong> 5 minutes
                    </div>
                    <div>
                      <strong>Companies Loaded:</strong> {CompaniesA.length}
                    </div>
                  </div>
                </div>
              )}

              {CompaniesA.length > 0 ? (
                <>
                  <div className="text-xs text-gray-500 mb-2">
                    ROW: {CompaniesA.length}, COLS: {columnDefs.length}
                  </div>
                  <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
                    <AgGridReact
                      rowData={rowData}
                      columnDefs={columnDefs}
                      rowSelection="multiple"
                      pagination
                      paginationPageSize={50}
                    />
                  </div>
                  <div className="mt-4">
                    {profile?.hubspot_access_token_a && (
                      <button
                        className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-50"
                        onClick={() => fetchCompanies(nextAfterA)}
                        disabled={!nextAfterA || loadingA || autoRefreshing}
                      >
                        {loadingA || autoRefreshing ? "Loading..." : nextAfterA ? "Load More" : "All Companies Loaded"}
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
