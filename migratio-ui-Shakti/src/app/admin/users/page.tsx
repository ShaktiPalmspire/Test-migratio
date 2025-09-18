"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconCheck, IconX, IconRefresh } from "@tabler/icons-react";
import Button from "@/components/Buttons/button";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  deactivated_at?: string;
  reactivation_requested_at?: string;
  updated_at: string;
};

// Normalize admin emails from env (trim + lowercase). Fallback includes all default admins.
const NEXT_PUBLIC_ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "shakti@palmspire.com")
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
export default function AdminUsersPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is admin
  useEffect(() => {
    if (!isLoading && (!user || !NEXT_PUBLIC_ADMIN_EMAILS.includes((user.email || "").toLowerCase()))) {
      router.replace("/dashboard/1");
      return;
    }
  }, [user, isLoading, router]);

  // Fetch all users
  useEffect(() => {
    if (!user || !NEXT_PUBLIC_ADMIN_EMAILS.includes((user.email || "").toLowerCase())) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current session token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('No session token available');
        }
        
        const response = await fetch('/api/admin/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch users";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'deactivated') => {
    try {
      setUpdatingStatus(userId);
      setError(null);

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session token available');
      }

      const response = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      setError(errorMessage);
      console.error("❌ Admin: Error updating status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdatingStatus(userId);
      setError(null);

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session token available');
      }

      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
      setError(errorMessage);
      console.error("❌ Admin: Error deleting user:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <IconCheck className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'deactivated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <IconX className="w-3 h-3 mr-1" />
            Deactivated
          </span>
        );
      case 'reactivation_requested':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <IconAlertTriangle className="w-3 h-3 mr-1" />
            Reactivation Requested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Show loading while checking admin access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--migratio_bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-[var(--migratio_text)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (!user || !NEXT_PUBLIC_ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
    return (
      <div className="min-h-screen bg-[var(--migratio_bg)] flex items-center justify-center">
        <div className="text-center">
          <IconAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[var(--migratio_text)] mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--migratio_bg)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--migratio_text)] mb-2">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user accounts and their status</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-[var(--migratio_bg_light)] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-[var(--migratio_text)]">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--migratio_bg_light)] divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-[var(--migratio_text)]">
                            {user.full_name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                         {formatDate(user.updated_at)}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user.status === 'active' ? (
                                                         <Button
                               onClick={() => handleStatusChange(user.id, 'deactivated')}
                               disabled={updatingStatus === user.id}
                               variant="secondary"
                               className="text-red-600 hover:text-red-700"
                             >
                              {updatingStatus === user.id ? (
                                <IconRefresh className="w-4 h-4 animate-spin" />
                              ) : (
                                "Deactivate"
                              )}
                            </Button>
                          ) : (
                                                         <Button
                               onClick={() => handleStatusChange(user.id, 'active')}
                               disabled={updatingStatus === user.id}
                               variant="secondary"
                               className="text-green-600 hover:text-green-700"
                             >
                              {updatingStatus === user.id ? (
                                <IconRefresh className="w-4 h-4 animate-spin" />
                              ) : (
                                "Activate"
                              )}
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={updatingStatus === user.id}
                            variant="secondary"
                            className="text-red-600 hover:text-red-700"
                          >
                            {updatingStatus === user.id ? (
                              <IconRefresh className="w-4 h-4 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Total Users: {users.length} | 
          Active: {users.filter(u => u.status === 'active').length} | 
          Deactivated: {users.filter(u => u.status === 'deactivated').length} | 
          Reactivation Requested: {users.filter(u => u.status === 'reactivation_requested').length}
        </div>
      </div>
    </div>
  );
}
