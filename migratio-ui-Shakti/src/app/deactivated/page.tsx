"use client";
import { useState, useEffect } from "react";
import { IconAlertTriangle, IconMail, IconClock } from "@tabler/icons-react";
import { clearAllUserCache } from "@/utils/cacheUtils";
import Button from "../../components/Buttons/button";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function DeactivatedPage() {
  const { user, profile, isLoading } = useUser();
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'requested' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [forceShow, setForceShow] = useState(false);
  const router = useRouter();

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceShow(true);
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // If still loading, wait
    if (isLoading && !forceShow) {
      return;
    }

    // If no user after loading is complete, redirect to login
    if (!user && !forceShow) {
      router.push("/auth/login");
      return;
    }

    // Store the session user ID
    if (user) {
      setSessionUserId(user.id);
    }

    // If we have a profile, process it
    if (profile) {
      // If user is active, redirect to dashboard
      if (profile.status === 'active') {
        router.push("/dashboard/1");
        return;
      }

      // If user has requested reactivation, set the status to show the submitted message
      if (profile.status === 'reactivation_requested') {
        setRequestStatus('requested');
      }
    }
  }, [user, profile, isLoading, router, forceShow]);

  const handleReactivationRequest = async () => {
    if (!user) {
      setError("No user data available");
      return;
    }
    
    if (!sessionUserId) {
      setError("Session user ID is required");
      return;
    }
    
    setIsRequesting(true);
    setError(null);
    
    try {
      const requestBody = { userId: sessionUserId };
      
      const response = await fetch('/api/users/reactivate-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("[ERROR] Invalid JSON response:", e);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setRequestStatus('requested');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      setRequestStatus('error');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Save selectedObjects before clearing cache
      try {
        console.log('🔄 [DEACTIVATED_LOGOUT] Starting logout process...');
        
        // Try multiple localStorage keys to find selectedObjects
        let selectedObjects = [];
        
        // First try selectedObjects (primary key)
        const currentSaved = localStorage.getItem('selectedObjects');
        if (currentSaved) {
          selectedObjects = JSON.parse(currentSaved);
          console.log('🔄 [DEACTIVATED_LOGOUT] Found selectedObjects:', selectedObjects);
        } else {
          // Try selectedObjects_backup (fallback key)
          const backupSaved = localStorage.getItem('selectedObjects_backup');
          if (backupSaved) {
            selectedObjects = JSON.parse(backupSaved);
            console.log('🔄 [DEACTIVATED_LOGOUT] Found selectedObjects_backup:', selectedObjects);
          } else {
            console.log('📝 [DEACTIVATED_LOGOUT] No selectedObjects found in localStorage');
          }
        }
        
        console.log('🔄 [DEACTIVATED_LOGOUT] Attempting to save selectedObjects:', selectedObjects);
        
        if (selectedObjects.length > 0 && user?.id) {
          // Get current profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('helper_json')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            const existingHelperJson = profileData.helper_json || {};
            const lastSavedObjects = existingHelperJson.selectedObjects || [];
            
            // Check if value actually changed
            const hasChanged = JSON.stringify(lastSavedObjects.sort()) !== JSON.stringify(selectedObjects.sort());
            
            if (hasChanged) {
              const payload = {
                ...existingHelperJson,
                selectedObjects: selectedObjects,
                updatedAt: new Date().toISOString(),
              };

              const { error } = await supabase
                .from('profiles')
                .update({ helper_json: payload })
                .eq('id', user.id);

              if (error) {
                console.error('❌ [DEACTIVATED_LOGOUT] Supabase error:', error);
              } else {
                console.log('✅ [DEACTIVATED_LOGOUT] Successfully saved selectedObjects to database');
              }
            } else {
              console.log('📝 [DEACTIVATED_LOGOUT] No change detected, skipping save');
            }
          }
        } else {
          console.log('📝 [DEACTIVATED_LOGOUT] No selectedObjects to save or missing user ID');
        }
      } catch (error) {
        console.warn('⚠️ [DEACTIVATED_LOGOUT] Error saving selectedObjects:', error);
      }
      
      // Clear all cached user data from localStorage AFTER saving
      clearAllUserCache();
      
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("[ERROR] Error signing out:", error);
      router.push("/auth/login");
    }
  };

  // Show loading only if UserContext is still loading and we haven't forced show
  if (isLoading && !forceShow) {
    return (
      <div className="min-h-screen bg-[var(--migratio_bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-[var(--migratio_text)]">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">If this takes too long, the page will load automatically</p>
        </div>
      </div>
    );
  }

  // If no user after loading, show loading while redirecting
  if (!user && !forceShow) {
    return (
      <div className="min-h-screen bg-[var(--migratio_bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-[var(--migratio_text)]">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If user is active, show loading while redirecting
  if (profile && profile.status === 'active') {
    return (
      <div className="min-h-screen bg-[var(--migratio_bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-[var(--migratio_text)]">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show deactivated page content (even if profile is null due to force show)
  return (
    <div className="min-h-screen bg-[var(--migratio_bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[var(--migratio_bg_light)] rounded-lg p-8 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconAlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--migratio_text)] mb-2">
              Account Deactivated
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your account has been temporarily deactivated
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <IconMail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-[var(--migratio_text)]">
                  {profile?.full_name || user?.email || 'User'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email || 'No email available'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <IconClock className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-[var(--migratio_text)] mb-1">
                  Account Status
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile?.status === 'reactivation_requested' 
                    ? (profile?.reactivation_requested_at
                        ? `Reactivation requested on ${new Date(profile.reactivation_requested_at).toLocaleDateString()}`
                        : 'Reactivation requested')
                    : profile?.deactivated_at 
                      ? `Deactivated on ${new Date(profile.deactivated_at).toLocaleDateString()}`
                      : 'Account deactivated'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Reactivation Request - Only show if status is 'deactivated' */}
          {profile?.status === 'deactivated' && requestStatus === 'idle' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  To reactivate your account, please submit a request. Our support team will review and process your request.
                </p>
                <Button
                  onClick={handleReactivationRequest}
                  disabled={isRequesting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isRequesting ? "Submitting Request..." : "Request Reactivation"}
                </Button>
              </div>
            </div>
          )}

          {/* Request Submitted - Show if status is 'reactivation_requested' or request was just submitted */}
          {(profile?.status === 'reactivation_requested' || requestStatus === 'requested') && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--migratio_text)] mb-1">
                    Request Submitted
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your reactivation request has been submitted. You will be notified once your account is reactivated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {requestStatus === 'error' && error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Logout Button */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 