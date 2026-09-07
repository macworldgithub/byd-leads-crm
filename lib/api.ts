// const BASE = "https://byd-leads-backend.vercel.app/api";
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
  platform?: "manual" | "autogate" | "sms";
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

export const getLeads = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<Lead[]>(`/leads${qs}`);
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
  platform?: "manual" | "autogate";
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
}

export interface SmsTestResult {
  success: boolean;
  connectionStatus: "connected" | "failed";
  message: string;
  testedAt: string;
  data?: SmsSettings;
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

// ── Audit Trails ─────────────────────────────────────────────────────────────
export interface AuditTrail {
  _id: string;
  message: string;
  actor: string;
  leadId: string;
  createdAt: string;
}

export const getAuditTrails = () => request<AuditTrail[]>("/audit-trails");

