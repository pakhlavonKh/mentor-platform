import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Basic validation
        if (!email || !password) {
          reject(new Error("Email and password are required"));
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          reject(new Error("Invalid email format"));
          return;
        }

        if (password.length < 6) {
          reject(new Error("Password must be at least 6 characters"));
          return;
        }

        // Simulate successful login
        const userData: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          firstName: email.split("@")[0],
          lastName: "User",
        };

        const token = Math.random().toString(36).substr(2, 100);
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        setUser(userData);
        setIsLoggedIn(true);
        resolve();
      }, 800);
    });
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Basic validation
        if (!email || !password || !firstName || !lastName) {
          reject(new Error("All fields are required"));
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          reject(new Error("Invalid email format"));
          return;
        }

        if (password.length < 6) {
          reject(new Error("Password must be at least 6 characters"));
          return;
        }

        // Simulate successful signup
        const userData: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          firstName,
          lastName,
        };

        const token = Math.random().toString(36).substr(2, 100);
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        setUser(userData);
        setIsLoggedIn(true);
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
