import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  
  // isInitialized prevents the UI from flashing the login screen 
  // for a split second before we know if the user is logged in
  isInitialized: false, 

  // Actions to update the state
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user, 
    isInitialized: true 
  }),
  
  clearUser: () => set({ 
    user: null, 
    isAuthenticated: false, 
    isInitialized: true 
  }),

  // Used to manually say "we checked the auth status, stop loading"
  setInitialized: (status) => set({ isInitialized: status }),
}));