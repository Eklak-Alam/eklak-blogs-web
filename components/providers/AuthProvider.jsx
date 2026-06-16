"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/useAuthStore";
import { userApi } from "@/lib/api/user.api";

export default function AuthProvider({ children }) {
  const { setUser, clearUser, setInitialized } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");

      // If no tokens exist, they are definitely logged out. 
      // Stop loading and show the public pages (like Register/Login).
      if (!accessToken && !refreshToken) {
        clearUser();
        setInitialized(true);
        return;
      }

      // If they have a token, fetch their profile data silently in the background
      try {
        const response = await userApi.getMe();
        // Adjust this based on your exact API response structure (e.g., response.data.user)
        const userData = response?.user || response?.data?.user || response?.data;
        
        if (userData) {
          setUser(userData);
        } else {
          clearUser();
        }
      } catch (error) {
        // If the token is totally invalid and refresh failed, clear them out
        console.error("Auth check failed:", error);
        clearUser();
      } finally {
        // ALWAYS set initialized to true so the UI finally renders!
        setInitialized(true);
      }
    };

    initAuth();
  }, [setUser, clearUser, setInitialized]);

  return <>{children}</>;
}