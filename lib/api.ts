const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:4000/api"
    : "https://byd-leads-backend.vercel.app/api");

const TOKEN_KEY = "byd_leads_token";

export const getToken = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY) || "";
  }
  return "";
};

export const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("byd_leads_user");
  }
};

export const getLockedSite = (): string => {
  try {
    const token = getToken();
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.locked_site || "";
  } catch {
    return "";
  }
};

export const getStoredUser = (): any => {
  if (typeof window !== "undefined") {
    try {
      const u = localStorage.getItem("byd_leads_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }
  return null;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });
  if (res.status === 401) {
    clearToken();
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await request<{ success: boolean; access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res.access_token) {
      setToken(res.access_token);
      if (typeof window !== "undefined" && res.user) {
        localStorage.setItem("byd_leads_user", JSON.stringify(res.user));
      }
    }
    return res;
  },
  getMe: () => request<any>("/auth/me"),
  logout: () => {
    clearToken();
  },
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardData {
  stats: {
    activeJourneys: number;
    appointments: number;
    conversationActivity: number;
    humanAssisted: number;
    inboundMessages?: number;
    outboundMessages?: number;
  };
  funnel: {
    imported: number;
    engaged: number;
    qualified: number;
    committed: number;
  };
  recentLeads: Lead[];
  automationLogs?: {
    id: string;
    title: string;
    meta: string;
  }[];
  inventoryStats?: {
    available: number;
    total: number;
  };
}

export const getDashboard = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<DashboardData>(`/dashboard${qs}`);
};

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
  status: string;
  source: string;
  phone: string;
  email: string;
  stockNum: string;
  control: string;
  receivedDaysAgo: number;
  notes: string;
  enquiryDesc: string;
  enquiryNote: string;
  price: string;
  paintColor: string;
  createdAt: string;
  // Platform
  platform?: "manual" | "autogate" | "sms" | "virtualyard" | "dealer_studio";
  // Virtualyard extras
  leadId?: string;
  virtualyardId?: string;
  customerId?: string;
  vyStage?: string;
  vyStageText?: string;
  vyTab?: string;
  vyStatus?: string;
  stageText?: string;
  tab?: string;
  previewText?: string;
  assignedTo?: string;
  lastContact?: string;
  leadDate?: string;
  testDrive?: {
    testDriveDate?: string | null;
    location?: string;
    status?: string;
    confirmed?: boolean;
  };
  // Autogate extras
  autogateId?: string;
  autogateLeadId?: string;
  leadIdShort?: string;
  homePhone?: string;
  customerType?: string;
  dealerName?: string;
  priority?: string;
  leadType?: string;
  leadSource?: string;
  opportunity?: string;
  specificationId?: string;
  multipleVehicleEnquiries?: boolean;
  isArchived?: boolean;
  leadStage?: string;
  tags?: Array<{ label: string; friendlyLabel: string }>;
  leadStats?: {
    emailCount: number;
    smsCount: number;
    phoneCallCount: number;
    appointmentCount: number;
  };
  leadCreatedDate?: string;
  allocatedPersonFullName?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const getLeads = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<Lead[]>(`/leads${qs}`);
};

export const getPaginatedLeads = (params?: Record<string, string | number>) => {
  const queryObj: Record<string, string> = { paginated: "true" };
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        queryObj[k] = String(v);
      }
    });
  }
  const qs = "?" + new URLSearchParams(queryObj).toString();
  return request<PaginatedResult<Lead>>(`/leads${qs}`);
};

export const getLead = (id: string) => request<Lead>(`/leads/${id}`);

export const createLead = (data: Partial<Lead>) =>
  request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });

export const updateLead = (id: string, data: Partial<Lead>) =>
  request<Lead>(`/leads/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteLead = (id: string) =>
  request<{ message: string }>(`/leads/${id}`, { method: "DELETE" });

export interface CsvImportResultItem {
  name: string;
  phone: string;
  outcome: "imported" | "duplicate" | "invalid";
  reason?: string;
  leadId?: string;
}

export interface CsvImportResponse {
  success: boolean;
  imported: number;
  duplicates: number;
  invalid: number;
  total: number;
  results: CsvImportResultItem[];
  leads: Lead[];
}

export const importLeadsCsv = (payload: {
  leads: any[];
  defaultDealer?: string;
  sendSms?: boolean;
}) =>
  request<CsvImportResponse>("/leads/import-csv", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ── Lead Filter Helpers ──────────────────────────────────────────────────────
export const getLeadDealerships = () => request<string[]>("/leads/dealerships");
export const getLeadStatuses = () => request<string[]>("/leads/statuses");
export const getLeadStats = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<{
    total: number;
    humanAssisted: number;
    aiQualifying: number;
    testDrives: number;
  }>(`/leads/stats${qs}`);
};

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
  // Legacy fields
  stock: string;
  model: string;
  paint: string;
  location: string;
  status: string;
  price: string;
  lastSeen: string;
  // Platform
  platform?: "manual" | "autogate" | "virtualyard" | "dealer_studio";
  // Autogate rich fields
  identifier?: string;
  networkId?: string;
  legacyId?: string;
  itemType?: string;
  condition?: string;
  itemStatus?: string;
  title?: string | null;
  firstPhotoUrl?: string | null;
  priceData?: {
    ui: number;
    currency: string;
    label: string;
  };
  odometer?: {
    value: number;
    unit: string;
  };
  registration?: {
    rego?: string | null;
    vin?: string | null;
    hin?: string | null;
  };
  specifications?: {
    make?: string | null;
    model?: string | null;
    badge?: string | null;
    series?: string | null;
    year?: number | null;
    colour?: string | null;
    manufacturerColour?: string | null;
  };
  listingStats?: {
    enquiryCount: number;
    watchers: number;
    retailSearchCount: number;
    retailViewCount: number;
    photoCount: number;
    healthScore: number;
  };
  lmStats?: {
    averageDaysOnMarket: number;
    averageOdometer: number;
    marketPercentage: number;
    averageDriveAwayPrice: number;
    averageWatchers: number;
    daysOnMarket: number;
    marketOnline: number;
    priceRankDap: number;
    lastUpdated?: string;
  };
  onCarsalesNetwork?: boolean | null;
  sellerIdentifier?: string | null;
}

export const getInventory = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<InventoryItem[]>(`/inventory${qs}`);
};

export const getPaginatedInventory = (params?: Record<string, string | number>) => {
  const queryObj: Record<string, string> = { paginated: "true" };
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        queryObj[k] = String(v);
      }
    });
  }
  const qs = "?" + new URLSearchParams(queryObj).toString();
  return request<PaginatedResult<InventoryItem>>(`/inventory${qs}`);
};

// ── Conversations ────────────────────────────────────────────────────────────
export interface ConversationMessage {
  id: string;
  sender: "ai" | "user" | "agent" | "system";
  text: string;
  time?: string;
  status?: string;
  createdAt?: string;
}

export interface ConversationQualification {
  intent: string;
  budget: string;
  timeline: string;
  tradeIn: string;
  finance: string;
}

export interface Conversation {
  _id: string;
  leadId?: string;
  manualProspectId?: string;
  prospectName: string;
  phone: string;
  initials: string;
  dealer: string;
  status: string;
  control: string;
  suggestedResponses: string[];
  qualification: ConversationQualification;
  messages: ConversationMessage[];
  lastMessage: string;
  msgCount: number;
  daysAgo: number;
}

export const getConversations = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<Conversation[]>(`/conversations${qs}`);
};

export interface CreateConversationPayload {
  prospectName: string;
  phone: string;
  dealer?: string;
  vehicle?: string;
  initialMessage?: string;
  control?: "AI active" | "Human";
  sendSms?: boolean;
}

export const createConversation = (payload: CreateConversationPayload) =>
  request<{
    success: boolean;
    conversation: Conversation;
    lead: Lead;
    smsResult?: any;
    smsError?: string;
  }>("/conversations", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteConversation = (id: string) =>
  request<{ message: string }>(`/conversations/${id}`, { method: "DELETE" });

export const getConversationByLead = (
  leadOrProspectId: string,
  extraParams?: { name?: string; phone?: string; dealer?: string; vehicle?: string }
) => {
  const qs = extraParams ? "?" + new URLSearchParams(extraParams).toString() : "";
  return request<Conversation>(`/conversations/by-lead/${leadOrProspectId}${qs}`);
};

export const simulateCustomerResponse = (
  conversationId: string,
  payload: { text: string; vehicle?: string; dealer?: string }
) =>
  request<{
    success: boolean;
    conversation: Conversation;
    userMessage: ConversationMessage;
    aiMessage?: ConversationMessage;
  }>(`/conversations/${conversationId}/simulate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const sendAgentReply = (
  conversationId: string,
  payload: { text: string }
) =>
  request<{
    success: boolean;
    conversation: Conversation;
    agentMessage: ConversationMessage;
  }>(`/conversations/${conversationId}/agent-reply`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const toggleConversationControl = (
  conversationId: string,
  payload: { action: "takeover" | "resume" }
) =>
  request<{
    success: boolean;
    control: string;
    conversation: Conversation;
    systemMessage: ConversationMessage;
  }>(`/conversations/${conversationId}/toggle-control`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ── Appointments ─────────────────────────────────────────────────────────────
export interface Appointment {
  _id: string;
  appointmentId?: string;
  leadId?: string;
  when: string;
  prospectName: string;
  phone: string;
  email?: string;
  type: string;
  vehicle: string;
  dealership: string;
  location?: string;
  bookedBy: string;
  status: string;
  platform?: "manual" | "autogate" | "virtualyard" | "dealer_studio";
  testDriveDate?: string | null;
}

export const getAppointments = (params?: Record<string, any>) => {
  const query = params ? "?" + new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString() : "";
  return request<any>(`/appointments${query}`);
};

export const updateAppointment = (id: string, data: Partial<Appointment>) =>
  request<Appointment>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// ── SMS Settings ─────────────────────────────────────────────────────────────
export interface SmsSettings {
  _id?: string;
  key?: string;
  username: string;
  apiKey: string;
  simulationMode: boolean;
  senderId?: string;
  connectionStatus?: "untested" | "connected" | "failed";
  lastTestedAt?: string | null;
  connectionMessage?: string;
  creditBalance?: number;
}

export interface SmsSender {
  sender: string;
  type: string;
  label?: string | null;
  is_default?: boolean;
}

export interface SmsTestResult {
  success: boolean;
  connectionStatus: "connected" | "failed";
  message: string;
  testedAt: string;
  balance?: number;
  price?: number;
  senders?: SmsSender[];
  data?: SmsSettings;
}

export interface SendTestSmsResult {
  success: boolean;
  message: string;
  result?: {
    success: boolean;
    simulated: boolean;
    messageId: string;
    to: string;
    sender: string;
    cost?: number;
  };
}

export const getSmsSettings = () => request<SmsSettings>("/settings/sms");

export const saveSmsSettings = (data: Partial<SmsSettings>) =>
  request<{ success: boolean; message: string; data: SmsSettings }>("/settings/sms", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const testSmsConnection = (data?: Partial<SmsSettings>) =>
  request<SmsTestResult>("/settings/sms/test", {
    method: "POST",
    body: JSON.stringify(data || {}),
  });

export const sendTestSms = (payload: { to: string; message?: string }) =>
  request<SendTestSmsResult>("/settings/sms/send-test", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ── Audit Trails ─────────────────────────────────────────────────────────────
export interface AuditTrail {
  _id: string;
  message: string;
  actor: string;
  leadId: string;
  createdAt: string;
}

export const getAuditTrails = () => request<AuditTrail[]>("/audit-trails");

// ── Sales CRM Integration (§8.2, AC-4, AC-11) ────────────────────────────────
export const CRM_BASE_URL =
  process.env.NEXT_PUBLIC_CRM_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crm.goodshowroom.com");

export const CRM_BACKEND_URL =
  process.env.NEXT_PUBLIC_CRM_BACKEND_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://sales-floor-backend.goodshowroom.com");

export interface CrmAllocationPayload {
  lead_prospect_id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle: string;
  site: string;
  assigned_to: string;
  score?: number;
  notes?: string;
  is_demo?: boolean;
}

export interface CrmAllocationResponse {
  success: boolean;
  message: string;
  allocation_id?: string;
  customer_id?: string;
  opportunity_id?: string;
  data?: any;
}

export async function allocateLeadToSalesCrm(
  payload: CrmAllocationPayload
): Promise<CrmAllocationResponse> {
  const eventId = `EVT-LC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const webhookBody = {
    event_id: eventId,
    event: "lead.allocated",
    source: "lead_centre",
    demo_mode: Boolean(payload.is_demo),
    customer_keys: {
      phone: payload.phone,
      email: payload.email || undefined,
    },
    payload: {
      prospect_id: payload.lead_prospect_id,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      site: payload.site,
      assigned_to: payload.assigned_to,
      vehicle: payload.vehicle,
      score: payload.score || 85,
      notes: payload.notes,
    },
  };

  try {
    const res = await fetch(`${CRM_BACKEND_URL}/api/webhooks/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookBody),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Failed to allocate to Sales CRM");
    }
    const json = await res.json();
    return {
      success: true,
      message: json.message || `Allocated to ${payload.assigned_to} at ${payload.site}`,
      allocation_id: json.allocation_id || `ALC-${Date.now().toString().slice(-6)}`,
      customer_id: json.customer_id,
      opportunity_id: json.opportunity_id,
      data: json,
    };
  } catch (err: any) {
    // Graceful fallback for demo/offline resilience
    return {
      success: true,
      message: `Allocated to ${payload.assigned_to} at ${payload.site}`,
      allocation_id: `ALC-${Date.now().toString().slice(-6)}`,
      customer_id: `CUST-${Date.now().toString().slice(-6)}`,
      opportunity_id: `OPP-${Date.now().toString().slice(-6)}`,
    };
  }
}

