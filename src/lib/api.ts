const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("authToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return res.json();
}

// ---------- Auth ----------
export type UserRole = "admin" | "tutor" | "student";

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, firstName: string, lastName: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, firstName, lastName }),
      }),
    profile: () => request<Omit<AuthResponse, "token">>("/auth/profile"),
  },

  // ---------- Grants ----------
  grants: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: Grant[]; pagination: Pagination }>(`/grants${qs}`);
    },
    get: (id: string) => request<Grant>(`/grants/${id}`),
  },

  // ---------- Learning ----------
  learning: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: LearningContent[]; pagination: Pagination }>(`/learning${qs}`);
    },
    get: (id: string) => request<LearningContent>(`/learning/${id}`),
  },

  // ---------- Telegram ----------
  telegram: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: TelegramPost[]; pagination: Pagination }>(`/telegram${qs}`);
    },
  },

  // ---------- Pricing ----------
  pricing: {
    list: () => request<PricingPlan[]>("/pricing"),
  },
};

// ---------- Shared types ----------
export interface LocalizedText {
  en: string;
  ru: string;
  kz: string;
}

export interface LocalizedArray {
  en: string[];
  ru: string[];
  kz: string[];
}

export interface Grant {
  id: string;
  title: LocalizedText;
  country: string;
  type: "bachelor" | "master" | "internship" | "phd";
  funding: "full" | "partial";
  deadline: string;
  description: LocalizedText;
  link: string;
}

export interface LearningContent {
  id: string;
  title: LocalizedText;
  type: "video" | "text" | "checklist";
  topic: LocalizedText;
  description: LocalizedText;
  duration: string;
  completed?: boolean;
}

export interface TelegramPost {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  source: string;
  link: string;
  date: string;
}

export interface PricingPlan {
  id: string;
  name: LocalizedText;
  documents: number;
  price: number;
  features: LocalizedArray;
  popular?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
