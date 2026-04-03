const API_BASE = "/api/proxy";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "same-origin",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, `API error: ${res.status}`, data);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Query key factory for consistent cache invalidation
export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params?: Record<string, string>) =>
      [...queryKeys.products.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.products.all, id] as const,
    stats: (id: string) => [...queryKeys.products.all, id, "stats"] as const,
  },
  scans: {
    all: ["scans"] as const,
    detail: (id: string) => [...queryKeys.scans.all, id] as const,
    assessments: (id: string) =>
      [...queryKeys.scans.all, id, "assessments"] as const,
    craReadiness: (id: string) =>
      [...queryKeys.scans.all, id, "cra-readiness"] as const,
  },
  findings: {
    all: ["findings"] as const,
    list: (params?: Record<string, string>) =>
      [...queryKeys.findings.all, "list", params] as const,
  },
  assessments: {
    all: ["assessments"] as const,
    detail: (id: string) => [...queryKeys.assessments.all, id] as const,
  },
  reports: {
    all: ["reports"] as const,
  },
  intelligence: {
    all: ["intelligence"] as const,
  },
  me: {
    all: ["me"] as const,
    profile: () => [...queryKeys.me.all, "profile"] as const,
  },
} as const;
