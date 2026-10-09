const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetchJson<any>("/dashboard"),

  // Vehicles
  getVehicles: (category?: string, status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    return fetchJson<any[]>(`/vehicles?${params.toString()}`);
  },
  getVehicleDetail: (id: string) => fetchJson<any>(`/vehicles/${id}`),
  updateVehicleStatus: (id: string, status: string, maintenanceStatus?: string) =>
    fetchJson<any>(`/vehicles/${id}/status?status=${status}${maintenanceStatus ? `&maintenance_status=${maintenanceStatus}` : ""}`, {
      method: "PATCH",
    }),

  // Bookings
  getBookings: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    return fetchJson<any[]>(`/bookings?${params.toString()}`);
  },
  createBooking: (data: { customer_id: string; vehicle_id: string; start_date: string; end_date: string }) =>
    fetchJson<any>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Customers & Leads
  getCustomers: () => fetchJson<any[]>("/customers"),
  getLeads: () => fetchJson<any[]>("/customers/leads"),
  createLead: (data: any) =>
    fetchJson<any>("/customers/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Business Analytics
  getAnalyticsMetrics: (timeframe = "current_month") => fetchJson<any>(`/analytics/metrics?timeframe=${timeframe}`),
  getAnalyticsCompare: () => fetchJson<any>("/analytics/compare"),
  getAnalyticsUtilization: () => fetchJson<any>("/analytics/utilization"),
  getAnalyticsAnomalies: () => fetchJson<any>("/analytics/anomalies"),
  getAnalyticsReports: () => fetchJson<any[]>("/analytics/reports"),

  // Maintenance & Tasks
  getMaintenanceRecords: () => fetchJson<any[]>("/maintenance/records"),
  getTasks: (priority?: string, status?: string) => {
    const params = new URLSearchParams();
    if (priority) params.append("priority", priority);
    if (status) params.append("status", status);
    return fetchJson<any[]>(`/maintenance/tasks?${params.toString()}`);
  },
  createTask: (data: any) =>
    fetchJson<any>("/maintenance/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTaskStatus: (taskId: string, status: string) =>
    fetchJson<any>(`/maintenance/tasks/${taskId}/status?status=${status}`, {
      method: "PATCH",
    }),

  // AI Agent Hub
  processAgentHub: (conversationId: string | null, userRequest: string) =>
    fetchJson<any>("/agent-hub/process", {
      method: "POST",
      body: JSON.stringify({ conversation_id: conversationId, user_request: userRequest }),
    }),

  // Activity History
  getActivityHistory: () => fetchJson<any[]>("/activity"),
};
