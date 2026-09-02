const BASE = "http://localhost:4001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardData {
  stats: {
    activeJourneys: number;
    appointments: number;
    conversationActivity: number;
    humanAssisted: number;
  };
  funnel: {
    imported: number;
    engaged: number;
    qualified: number;
    committed: number;
  };
  recentLeads: Lead[];
}

export const getDashboard = () => request<DashboardData>("/dashboard");

// ── Leads ────────────────────────────────────────────────────────────────────
export interface Lead {
  _id: string;
  name: string;
  vehicle: string;
  dealer: string;
  score: number;
  tag: string;
  color: string;
  stage: string;
  source: string;
  phone: string;
  stockNum: string;
  control: string;
  receivedDaysAgo: number;
  notes: string;
  createdAt: string;
}

export const getLeads = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<Lead[]>(`/leads${qs}`);
};

export const createLead = (data: Partial<Lead>) =>
  request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });

export const updateLead = (id: string, data: Partial<Lead>) =>
  request<Lead>(`/leads/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteLead = (id: string) =>
  request<{ message: string }>(`/leads/${id}`, { method: "DELETE" });

// ── Dealerships ──────────────────────────────────────────────────────────────
export interface Dealership {
  _id: string;
  name: string;
  legalEntity: string;
  address: string;
  suburb: string;
  state: string;
  phone: string;
  email: string;
  timezone: string;
  smsSenderId: string;
  autogateId: string;
  autogateUsername: string;
  autogatePassword: string;
  weekdayHoursStart: string;
  weekdayHoursEnd: string;
  saturdayHoursStart: string;
  saturdayHoursEnd: string;
}

export const getDealerships = () => request<Dealership[]>("/dealerships");

export const createDealership = (data: Partial<Dealership>) =>
  request<Dealership>("/dealerships", { method: "POST", body: JSON.stringify(data) });

export const updateDealership = (id: string, data: Partial<Dealership>) =>
  request<Dealership>(`/dealerships/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteDealership = (id: string) =>
  request<{ message: string }>(`/dealerships/${id}`, { method: "DELETE" });

// ── Inventory ────────────────────────────────────────────────────────────────
export interface InventoryItem {
  _id: string;
  stock: string;
  model: string;
  paint: string;
  location: string;
  status: string;
  price: string;
  lastSeen: string;
}

export const getInventory = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<InventoryItem[]>(`/inventory${qs}`);
};

// ── Conversations ────────────────────────────────────────────────────────────
export interface Conversation {
  _id: string;
  prospectName: string;
  phone: string;
  initials: string;
  dealer: string;
  status: string;
  control: string;
  lastMessage: string;
  msgCount: number;
  daysAgo: number;
}

export const getConversations = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<Conversation[]>(`/conversations${qs}`);
};

// ── Appointments ─────────────────────────────────────────────────────────────
export interface Appointment {
  _id: string;
  when: string;
  prospectName: string;
  phone: string;
  type: string;
  vehicle: string;
  dealership: string;
  bookedBy: string;
  status: string;
}

export const getAppointments = () => request<Appointment[]>("/appointments");

export const updateAppointment = (id: string, data: Partial<Appointment>) =>
  request<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
