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
    const body = await res.json().catch(() => ({} as Record<string, unknown>));
    const maybeMessage =
      typeof body === "object" && body !== null && "message" in body && typeof (body as Record<string, unknown>)["message"] === "string"
        ? (body as Record<string, string>)["message"]
        : undefined;
    const err = new Error(maybeMessage ?? `Request failed (${res.status})`) as Error & { status?: number; body?: unknown };
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res.json();
}

// ---------- Auth ----------
export type UserRole = "admin" | "mentor" | "student";

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string | null;
  token: string;
  savedGrants?: string[];
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
    google: (idToken: string) =>
      request<AuthResponse>("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      }),
    profile: () => request<Omit<AuthResponse, "token">>("/auth/profile"),
    update: (payload: Partial<AuthResponse>) => request<Omit<AuthResponse, "token">>(`/auth/profile`, { method: "PUT", body: JSON.stringify(payload) }),
    saveGrant: (grantId: string) => request<{ message: string }>(`/auth/profile/saved/${grantId}`, { method: "POST" }),
    removeSavedGrant: (grantId: string) => request<{ message: string }>(`/auth/profile/saved/${grantId}`, { method: "DELETE" }),
  },

  // ---------- Grants ----------
  grants: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: Grant[]; pagination: Pagination }>(`/grants${qs}`);
    },
    get: (id: string) => request<Grant>(`/grants/${id}`),
    create: (payload: Partial<Grant>) => request<Grant>(`/grants`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Partial<Grant>) => request<Grant>(`/grants/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    delete: (id: string) => request<{ message: string }>(`/grants/${id}`, { method: "DELETE" }),
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
  // ---------- Submissions ----------
  submissions: {
    upload: (form: FormData) => fetch(`${API_BASE}/submissions`, { method: "POST", body: form, headers: { ...(localStorage.getItem("authToken") ? { Authorization: `Bearer ${localStorage.getItem("authToken")}` } : {}) } }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    }),
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: Submission[]; pagination: Pagination }>(`/submissions${qs}`);
    },
    get: (id: string) => request<Submission>(`/submissions/${id}`),
    adminList: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: Submission[]; pagination: Pagination }>(`/submissions/all${qs}`);
    },
    assign: (id: string, reviewerId: string) => request<Submission>(`/submissions/${id}/assign`, { method: "POST", body: JSON.stringify({ reviewerId }) }),
    claim: (id: string) => request<Submission>(`/submissions/${id}/claim`, { method: "POST" }),
    unclaim: (id: string) => request<Submission>(`/submissions/${id}/unclaim`, { method: "POST" }),
    updateStatus: (id: string, status: string) => request<Submission>(`/submissions/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
    addFeedback: (id: string, feedback: string) => request<Submission>(`/submissions/${id}/feedback`, { method: "POST", body: JSON.stringify({ feedback }) }),
    reviewerMy: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: Submission[]; pagination: Pagination }>(`/submissions/reviewer/my${qs}`);
    },
  },

  // ---------- Admin users ----------
  admin: {
    listUsers: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: User[]; pagination: Pagination }>(`/admin/users/${qs}`.replace(/\/$/, ""));
    },
    getUser: (id: string) => request<User>(`/admin/users/${id}`),
    updateRole: (id: string, role: string) => request<User>(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
    deleteUser: (id: string) => request<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" }),
  },
  // ---------- Orders ----------
  orders: {
    create: (payload: { pricingPlanId: string; price: number; documents: number; submissionIds?: string[] }) =>
      request<Order>(`/orders`, { method: "POST", body: JSON.stringify(payload) }),
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: Order[]; pagination: Pagination }>(`/orders${qs}`);
    },
    get: (id: string) => request<Order>(`/orders/${id}`),
    adminList: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: Order[]; pagination: Pagination }>(`/orders/all${qs}`);
    },
    updateStatus: (id: string, status: string) => request<Order>(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "mentor" | "student" | "tutor";
  profilePicture?: string | null;
}

export interface Submission {
  id: string;
  userId: string;
  user?: User;
  reviewerId?: string | null;
  reviewer?: User | null;
  learningContentId?: string | null;
  files: { filename: string; originalName: string; size: number; mimeType: string; path: string; url?: string }[];
  status: "pending" | "in_review" | "completed" | "rejected";
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  pricingPlanId: string;
  submissionIds?: string[] | null;
  price: number;
  documents: number;
  status: "pending" | "in_review" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}
