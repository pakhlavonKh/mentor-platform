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
export type UserRole = "admin" | "mentor" | "tutor" | "student";

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
    config: () => request<{ telegramPhone: string; telegramChannelUrl: string; telegramChannelUsername: string }>("/telegram/config"),
  },

  // ---------- Calendar ----------
  calendar: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: CalendarEvent[]; pagination: Pagination }>(`/calendar${qs}`);
    },
    personal: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: CalendarItem[] }>(`/calendar/personal${qs}`);
    },
    create: (payload: Partial<CalendarEvent>) => request<CalendarEvent>(`/calendar`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: Partial<CalendarEvent>) => request<CalendarEvent>(`/calendar/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    delete: (id: string) => request<{ message: string }>(`/calendar/${id}`, { method: "DELETE" }),
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
    // Admin-facing submission APIs removed to prevent exposure of user submissions in admin/mentor panels.
    adminList: (_params?: Record<string, string>) => Promise.resolve({ data: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 } as unknown as Pagination }),
    assign: (_id: string, _reviewerId: string) => Promise.resolve(null as unknown as Submission),
    claim: (_id: string) => Promise.resolve(null as unknown as Submission),
    unclaim: (_id: string) => Promise.resolve(null as unknown as Submission),
    updateStatus: (_id: string, _status: string) => Promise.resolve(null as unknown as Submission),
    addFeedback: (_id: string, _feedback: string) => Promise.resolve(null as unknown as Submission),
    reviewerMy: (_params?: Record<string, string>) => Promise.resolve({ data: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 } as unknown as Pagination }),
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
    // Mentor management
    listMentors: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: User[]; pagination: Pagination }>(`/admin/users/mentors/list${qs}`);
    },
    createMentor: (payload: { email: string; firstName: string; lastName: string; password: string }) =>
      request<{ message: string; mentor: User }>(`/admin/users/mentors`, { method: "POST", body: JSON.stringify(payload) }),
    deactivateMentor: (id: string) => request<{ message: string; mentor: User }>(`/admin/users/mentors/${id}/deactivate`, { method: "PUT", body: JSON.stringify({}) }),
    reactivateMentor: (id: string) => request<{ message: string; mentor: User }>(`/admin/users/mentors/${id}/reactivate`, { method: "PUT", body: JSON.stringify({}) }),
    deleteMentor: (id: string) => request<{ message: string }>(`/admin/users/mentors/${id}`, { method: "DELETE" }),
    // Student management
    deactivateStudent: (id: string) => request<{ message: string; user: User }>(`/admin/users/students/${id}/deactivate`, { method: "PUT", body: JSON.stringify({}) }),
    reactivateStudent: (id: string) => request<{ message: string; user: User }>(`/admin/users/students/${id}/reactivate`, { method: "PUT", body: JSON.stringify({}) }),
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

export async function downloadAuthenticatedFile(fileUrl: string, filename: string) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const serverRoot = base.replace(/\/api\/?$/, "");
  const fullUrl = fileUrl.startsWith("http") ? fileUrl : `${serverRoot}${fileUrl}`;
  const token = localStorage.getItem("authToken");
  const res = await fetch(fullUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

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
  type: "bachelor" | "master" | "internship" | "phd" | "summer_program" | "foundation";
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
  isActive?: boolean;
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

export type CalendarCategory = "grant_deadline" | "event" | "application" | "platform";

export interface CalendarEvent {
  id: string;
  title: LocalizedText;
  description?: LocalizedText | null;
  date: string;
  category: CalendarCategory;
  link?: string | null;
}

export interface CalendarItem {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | null;
  date: string;
  category: CalendarCategory;
  link?: string | null;
  source?: "platform" | "grant";
}
