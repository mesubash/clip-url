import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { authService } from "@/lib/auth";
import type { User } from "@/lib/types";

const USER_CACHE_KEY = "clipurl_user_cache";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get cached user from localStorage
const getCachedUser = (): User | null => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is not too old (24 hours)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.user;
      }
      // Clear expired cache
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {
    localStorage.removeItem(USER_CACHE_KEY);
  }
  return null;
};

// Helper to cache user in localStorage
const setCachedUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ user, timestamp: Date.now() }));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with cached user for instant loading
  const [user, setUserState] = useState<User | null>(() => getCachedUser());
  const [isLoading, setIsLoading] = useState(() => !getCachedUser()); // Only show loading if no cache
  const initRef = useRef(false);

  // Wrapper to also update cache when setting user
  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    setCachedUser(newUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      // Try to get current user - if cookie exists and is valid, this will work
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch {
      // No valid session - clear cache
      setUser(null);
      return null;
    }
  }, [setUser]);

  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      const cachedUser = getCachedUser();
      
      if (cachedUser) {
        // We have cached user - show UI immediately, validate in background
        setIsLoading(false);
        // Silently refresh to validate session (don't await)
        refreshUser();
      } else {
        // No cache - must wait for API
        await refreshUser();
        setIsLoading(false);
      }
    };
    initAuth();
  }, []); // Empty deps - run once on mount

  const login = async (email: string, password: string) => {
    const userData = await authService.login({ email, password });
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const userData = await authService.register({ name, email, password });
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors on logout
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
