"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  createdAt?: string;
  data?: any;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncUser = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("user_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.id || parsed._id || parsed.email)) {
          setUser(parsed);
          setIsLoading(false);
          return;
        }
      }
      setUser(null);
    } catch (err) {
      console.error("Failed to parse user session", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncUser();

    // Listen to cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data") syncUser();
    };

    // Listen to same-tab custom auth changes
    const handleCustomAuthChange = () => syncUser();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-change", handleCustomAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleCustomAuthChange);
    };
  }, [syncUser]);

  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user_data");
    window.dispatchEvent(new Event("auth-change"));
    setUser(null);
    router.refresh();
  }, [router]);

  return {
    user,
    userId: user?.id || user?._id || "",
    isAuthenticated: !!user,
    isLoading,
    logout,
    refreshUser: syncUser,
  };
}
