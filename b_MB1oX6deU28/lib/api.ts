// Lightweight typed API client for Flowra.
// Reads the JWT from localStorage on every request and attaches it as a Bearer token.

export const API_BASE_URL = "https://flowra-backend-sx3x.onrender.com/api"

const TOKEN_KEY = "flowra_token"
const USER_KEY = "flowra_user"

export type AuthUser = {
  id: string
  email: string
  name?: string
}

export type Automation = {
  id: string
  name: string
  url: string
  triggerType: "manual" | "schedule"
  schedule?: string | null
  enabled: boolean
  lastRunAt?: string | null
  lastRunStatus?: "success" | "failed" | "running" | null
}

export type DashboardStats = {
  runsToday: number
  successRate: number // 0..1
  activeAutomations: number
  totalAutomations: number
  runsTrend?: number // optional % change vs yesterday
}

export type LogEntry = {
  id: string
  automationId: string
  automationName: string
  status: "success" | "failed" | "running"
  durationMs: number
  createdAt: string
  message?: string
}

// ---------- Token helpers ----------

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// ---------- Core request helper ----------

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    clearToken()
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login"
    }
    throw new ApiError("Unauthorized", 401)
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`
    try {
      const data = await res.json()
      if (data?.message) message = data.message
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// ---------- Auth ----------

export async function login(email: string, password: string) {
  return request<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function register(email: string, password: string, name?: string) {
  return request<{ token: string; user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  })
}

// ---------- Automations ----------

export async function listAutomations() {
  return request<Automation[]>("/automations")
}

export async function createAutomation(payload: {
  name: string
  url: string
  triggerType: "manual" | "schedule"
  schedule?: string
}) {
  return request<Automation>("/automations", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateAutomation(id: string, payload: Partial<Pick<Automation, "enabled" | "name" | "url">>) {
  return request<Automation>(`/automations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function runAutomation(id: string) {
  return request<{ runId: string }>(`/automations/${id}/run`, {
    method: "POST",
  })
}

// ---------- Dashboard ----------

export async function getDashboardStats() {
  return request<DashboardStats>("/dashboard/stats")
}

// ---------- Logs ----------

export async function listLogs(params?: { limit?: number; status?: LogEntry["status"] }) {
  const qs = new URLSearchParams()
  if (params?.limit) qs.set("limit", String(params.limit))
  if (params?.status) qs.set("status", params.status)
  const suffix = qs.toString() ? `?${qs.toString()}` : ""
  return request<LogEntry[]>(`/logs${suffix}`)
}
