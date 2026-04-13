import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, type UserRole } from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
    const data = await api.auth.login(email, password);
    const userData: User = {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const data = await api.auth.register(email, password, firstName, lastName);
    const userData: User = {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
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
