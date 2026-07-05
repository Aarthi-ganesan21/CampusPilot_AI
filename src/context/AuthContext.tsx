import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { syncWithBackend } from "../services/mockData";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  register: (userData: Omit<User, "id">, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("cp_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("cp_user");
      }
    }
    
    // Sync cache with MongoDB / JSON fallback database
    syncWithBackend().then(() => {
      const refreshedUser = localStorage.getItem("cp_user");
      if (refreshedUser) {
        try {
          setUser(JSON.parse(refreshedUser));
        } catch {}
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Strip password from stored user object for security
        const { password: _pw, ...userWithoutPassword } = data;
        setUser(userWithoutPassword);
        localStorage.setItem("cp_user", JSON.stringify(userWithoutPassword));
        if (data.token) {
          localStorage.setItem("cp_token", data.token);
        }
        return { success: true, role: data.role };
      } else {
        return { success: false, error: data.error || "Invalid Email or Password." };
      }
    } catch (err) {
      console.error("AuthContext login error:", err);
      return { success: false, error: "Failed to connect to server. Please check your connection." };
    }
  };

  const register = async (userData: any, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, password }),
      });

      if (response.ok) {
        return true;
      }
    } catch (err) {
      console.error("AuthContext registration error:", err);
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cp_user");
    localStorage.removeItem("cp_token");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("cp_user", JSON.stringify(updatedUser));
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem("cp_token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
