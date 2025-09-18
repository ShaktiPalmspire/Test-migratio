"use client";
import {
  IconRosetteDiscountCheck,
  IconCreditCard,
  IconBell,
  IconLogout,
} from "@tabler/icons-react";
import Button from "../components/Buttons/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AccountDetailsForm } from "./AccountDetailsForm";
import { clearAllUserCache } from "@/utils/cacheUtils";

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

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [showConfirmLogout, setshowConfirmLogout] = useState(false);

  const handleLogout = async () => {
    setshowConfirmLogout(true);
    
    // Get user ID from session before logout
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    console.log('🔍 [DEBUG] Session User ID:', userId);
    console.log('🔍 [DEBUG] localStorage selectedObjects:', localStorage.getItem('selectedObjects'));
    console.log('🔍 [DEBUG] localStorage selectedObjects_backup:', localStorage.getItem('selectedObjects_backup'));
    
    // Save selectedObjects before clearing cache
    try {
      console.log('🔄 [NAV_LOGOUT] Starting logout process...');
      
      // Try multiple localStorage keys to find selectedObjects
      let selectedObjects = [];
      
      // First try selectedObjects (primary key)
      const currentSaved = localStorage.getItem('selectedObjects');
      if (currentSaved) {
        selectedObjects = JSON.parse(currentSaved);
        console.log('🔄 [NAV_LOGOUT] Found selectedObjects:', selectedObjects);
      } else {
        // Try selectedObjects_backup (fallback key)
        const backupSaved = localStorage.getItem('selectedObjects_backup');
        if (backupSaved) {
          selectedObjects = JSON.parse(backupSaved);
          console.log('🔄 [NAV_LOGOUT] Found selectedObjects_backup:', selectedObjects);
        } else {
          console.log('📝 [NAV_LOGOUT] No selectedObjects found in localStorage');
        }
      }
      
      console.log('🔄 [NAV_LOGOUT] Attempting to save selectedObjects:', selectedObjects);
      
      if (selectedObjects.length > 0 && userId) {
        // Get current profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('helper_json')
          .eq('id', userId)
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

            console.log('🔄 [NAV_LOGOUT] Saving payload:', payload);

            const { error } = await supabase
              .from('profiles')
              .update({ helper_json: payload })
              .eq('id', userId);

            if (error) {
              console.error('❌ [NAV_LOGOUT] Supabase error:', error);
            } else {
              console.log('✅ [NAV_LOGOUT] Successfully saved selectedObjects to database');
            }
          } else {
            console.log('📝 [NAV_LOGOUT] No change detected, skipping save');
          }
        } else {
          console.log('❌ [NAV_LOGOUT] No profile data found');
        }
      } else {
        console.log('📝 [NAV_LOGOUT] No selectedObjects to save or missing user ID');
      }
    } catch (error) {
      console.warn('⚠️ [NAV_LOGOUT] Error saving selectedObjects:', error);
    }
    
    // Clear all cached user data from localStorage AFTER saving
    clearAllUserCache();
    
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleAccountUpdated = () => {
    // Reload the page to reflect changes
    window.location.reload();
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-sm">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setAccountOpen(true)}
              >
                <IconRosetteDiscountCheck />
                <p className="text-margin-zero hover-right">Account</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <IconCreditCard />
                <p className="text-margin-zero hover-right">Billing</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <IconBell />
                <p className="text-margin-zero hover-right">Notifications</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setLogoutDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <IconLogout />
                   <p className="text-margin-zero hover-right">Log Out</p>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-[var(--migratio_bg_light)] text-[var(--migratio_text)] card_border">
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to log out?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={handleLogout} tabIndex={-1}>
                    {showConfirmLogout ? "Logging out..." : "Log Out"}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="primary" tabIndex={-1}>Cancel</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <AccountDetailsForm
          user={user}
          open={accountOpen}
          onOpenChange={setAccountOpen}
          onAccountUpdated={handleAccountUpdated}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
