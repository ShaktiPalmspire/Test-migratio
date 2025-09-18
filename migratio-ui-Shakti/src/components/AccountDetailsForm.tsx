"use client";
import { useState, useEffect } from "react";
import { IconCameraFilled, IconUser, IconSettings } from "@tabler/icons-react";
import Image from "next/image";
import Button from "./Buttons/button";

import { createClient } from "@supabase/supabase-js";
import { useUser } from "@/context/UserContext";
import { AccountManagementTab } from "./AccountManagementTab";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function isRealAvatar(url: string | null | undefined) {
  if (!url) return false;
  // Only allow blob: or http(s) URLs that are NOT from ui-avatars.com
  return (
    url.startsWith("blob:") ||
    (url.startsWith("http") && !url.includes("ui-avatars.com"))
  );
}

// Helper to get a real avatar or null
function getRealAvatar(url: string | null | undefined): string | null {
  if (!url) return null;
  return isRealAvatar(url) ? url : null;
}

interface AccountDetailsFormProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountUpdated?: () => void;
}

export function AccountDetailsForm({
  user,
  open,
  onOpenChange,
  onAccountUpdated,
}: AccountDetailsFormProps) {
  const { user: supaUser } = useUser();
  const [activeTab, setActiveTab] = useState<'details' | 'management'>('details');
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState<string | null>(getRealAvatar(user.avatar) ?? null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(getRealAvatar(user.avatar) ?? null);
  const [tempAvatarPreview, setTempAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  useEffect(() => {
    if (!open) {
      setTempAvatarPreview(null);
      setSelectedFile(null);
      setEditName(user.name);
      setAvatarRemoved(false);
      setEditAvatar(getRealAvatar(user.avatar) ?? null);
      setPreviewAvatar(getRealAvatar(user.avatar) ?? null);
      setActiveTab('details');
    }
  }, [open, user.name, user.avatar]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTempAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supaUser) return;
    setUploading(true);
    setUploadError("");
    let signedUrl = editAvatar;
    let avatarChanged = false;
    
    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const avatarPath = `${supaUser.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("user-profile-image")
          .upload(`Profile-Images/${avatarPath}`, selectedFile, {
            contentType: selectedFile.type,
            upsert: true,
          });
        if (uploadError) {
          setUploadError("Upload failed: " + uploadError.message);
          return;
        }
        const { data: signedData, error: signedError } = await supabase.storage
          .from("user-profile-image")
          .createSignedUrl(`Profile-Images/${avatarPath}`, 60 * 60 * 24 * 7);
        if (signedError || !signedData) {
          setUploadError("Failed to get image URL");
          return;
        }
        signedUrl = signedData.signedUrl;
        avatarChanged = true;
      }
      
      let avatarUrlToStore: string | null = null;
      if (avatarRemoved) {
        avatarUrlToStore = null;
        avatarChanged = true;
      } else if (selectedFile && signedUrl && isRealAvatar(signedUrl)) {
        avatarUrlToStore = signedUrl;
      }
      
      const updateFields: {
        full_name: string;
        avatar_url?: string | null;
      } = {
        full_name: editName,
      };
      
      if (avatarChanged) {
        if (avatarRemoved) {
          updateFields.avatar_url = null;
        } else if (avatarUrlToStore && isRealAvatar(avatarUrlToStore)) {
          updateFields.avatar_url = avatarUrlToStore;
        }
      }
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateFields)
        .eq("id", supaUser.id);
      if (updateError) {
        setUploadError("Update failed: " + updateError.message);
        return;
      }
      
      setEditAvatar(getRealAvatar(signedUrl) ?? "");
      setPreviewAvatar(getRealAvatar(signedUrl) ?? "");
      onOpenChange(false);
      
      // Call the callback if provided
      if (onAccountUpdated) {
        onAccountUpdated();
      } else {
        // Fallback to reload if no callback provided
        window.location.reload();
      }
    } catch (err) {
      setUploadError((err as Error).message || "Update failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!supaUser?.id || !(tempAvatarPreview || previewAvatar)) return;
    setRemovingAvatar(true);
    try {
      const folderPath = `Profile-Images/${supaUser.id}`;
      const { data: fileList, error: listError } = await supabase.storage
        .from("user-profile-image")
        .list(folderPath);
      if (listError) {
        console.error("Error listing files:", listError);
        return;
      }
      if (fileList?.length) {
        const filesToRemove = fileList.map(
          (file) => `Profile-Images/${supaUser.id}/${file.name}`
        );
        const { error: removeError } = await supabase.storage
          .from("user-profile-image")
          .remove(filesToRemove);
        if (removeError) {
          console.error("Error deleting avatar:", removeError);
        }
      }
      setTempAvatarPreview(null);
      setAvatarRemoved(true);
    } finally {
      setRemovingAvatar(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-end transition-opacity duration-200 ${
      open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative w-[400px] sm:w-[540px] h-full bg-white shadow-xl overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Account Settings</h2>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <IconUser className="w-4 h-4" />
            <span className="text-sm font-medium">Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'management'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <IconSettings className="w-4 h-4" />
            <span className="text-sm font-medium">Management</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <form onSubmit={handleAccountSave} className="flex flex-col gap-3">
            <label className="fw-600">Name</label>
            <input
              className="border rounded px-3 py-2"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <label className="fw-600">Email</label>
            <div className="relative group w-full">
              <input
                className="border rounded px-3 py-2 cursor-not-allowed w-full"
                value={user.email}
                disabled
              />
              <div className="absolute top-full mt-1 left-0 text-xs text-[var(--migratio_white)] bg-[var(--migratio_gray)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                You can not update your email address
              </div>
            </div>

            <label className="fw-600">Avatar</label>
            <div className="flex flex-col gap-3">
              <div className="relative rounded-full overflow-hidden w-20 h-20">
                {tempAvatarPreview || (!avatarRemoved && previewAvatar) ? (
                  <>
                    <Image
                      src={tempAvatarPreview || previewAvatar || ""}
                      alt="Avatar"
                      width={80}
                      height={80}
                      className="w-full h-full rounded-full object-cover border"
                      onError={(e) => {
                        console.error('Failed to load avatar image');
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.avatar-fallback') as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="avatar-fallback w-full h-full rounded-full bg-[var(--migratio_gray)] flex items-center justify-center text-[var(--migratio_white)] p_small" style={{ display: 'none' }}>
                      <p className="text-margin-zero">{getInitials(user.name)}</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full rounded-full bg-[var(--migratio_gray)] flex items-center justify-center text-[var(--migratio_white)] p_small">
                    <p className="text-margin-zero">No Avatar</p>
                  </div>
                )}

                <label className="absolute bottom-0 left-0 w-full h-1/3 bg-black/40 rounded-b-full !flex items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="!hidden"
                  />
                  <IconCameraFilled className="text-[var(--migratio_white)] dark:text-[var(--migratio_black)] w-5 h-5" />
                </label>
              </div>

              {!avatarRemoved &&
                (isRealAvatar(tempAvatarPreview) ||
                  isRealAvatar(previewAvatar)) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-2 rounded w-max text-[var(--migratio_white)] bg-[var(--migratio_error)] fw-500"
                    disabled={removingAvatar}
                  >
                    {removingAvatar ? "Removing Avatar..." : "Remove Avatar"}
                  </button>
                )}
            </div>

            {uploading && (
              <div className="text-sm text-blue-600">Uploading...</div>
            )}
            {uploadError && (
              <div className="text-sm text-red-600">{uploadError}</div>
            )}

            <div className="flex gap-3 mt-6">
              <Button type="submit" variant="primary" disabled={uploading}>
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <AccountManagementTab user={user} />
        )}
      </div>
    </div>
  );
} 