"use client";
import { useState } from "react";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import Button from "./Buttons/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { clearAllUserCache } from "@/utils/cacheUtils";

// Regular client for user operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AccountManagementTabProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AccountManagementTab({ user }: AccountManagementTabProps) {
  const { user: supaUser } = useUser();
  const router = useRouter();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("AccountManagementTab rendered", user);
  const handleDeactivateAccount = async () => {
    if (!supaUser) {
      return;
    }
    
    setIsDeactivating(true);
    setError(null);
    
    try {
      const requestBody = { userId: supaUser.id };
      
      // Call the secure API endpoint for deactivation
      const response = await fetch('/api/users/deactivate', {
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

      // Clear all cached user data from localStorage
      clearAllUserCache();
      
      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsDeactivating(false);
      setDeactivateDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!supaUser) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const requestBody = { userId: supaUser.id };
      
      // Call the secure API endpoint for deletion
      const response = await fetch('/api/users/delete', {
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

      // Clear all cached user data from localStorage
      clearAllUserCache();
      
      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-[var(--migratio_text)]">
          Account Management
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and data
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Deactivate Account */}
        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-start space-x-3">
            <IconAlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-[var(--migratio_text)]">
                Deactivate Account
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Temporarily disable your account. You can reactivate it later by contacting support.
              </p>
              <div className="mt-3">
                <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => {}}
                    >
                      Deactivate Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[var(--migratio_bg_light)] text-[var(--migratio_text)] card_border">
                    <DialogHeader>
                      <DialogTitle>Deactivate Account</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to deactivate your account? You can reactivate it later by contacting support.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={handleDeactivateAccount}
                        disabled={isDeactivating}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {isDeactivating ? "Deactivating..." : "Deactivate"}
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={() => setDeactivateDialogOpen(false)}
                        disabled={isDeactivating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start space-x-3">
            <IconTrash className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-[var(--migratio_text)]">
                Delete Account
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="mt-3">
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => {}}
                    >
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[var(--migratio_bg_light)] text-[var(--migratio_text)] card_border">
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        This action will permanently delete your account and all associated data. 
                        This cannot be undone. Are you absolutely sure?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 