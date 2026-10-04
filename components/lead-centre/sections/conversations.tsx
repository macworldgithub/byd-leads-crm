"use client";

import {
  MessageSquare,
  Bot,
  Activity,
  Search,
  Loader2,
  MapPin,
  Plus,
  X,
  Send,
  Sparkles,
  Smartphone,
  User,
  CheckCircle2,
} from "lucide-react";
import { Pill } from "../shared";
import { Pagination } from "../pagination";
import {
  getConversations,
  getLeads,
  getDealerships,
  createConversation,
  type Conversation,
  type Dealership,
} from "@/lib/api";
import { mapLeadToProspect, createProspectFromMetadata } from "@/lib/prospect-mapper";
import { useState, useEffect } from "react";

type Filter = "all" | "ai" | "human";

const POPULAR_VEHICLES = [
  "2025 BYD ATTO 3",
  "2025 BYD SEAL",
  "2025 BYD SHARK 6",
  "2025 BYD DOLPHIN",
  "2025 BYD SEALION 7",
];

export function Conversations({
  onSelectProspect,
  locationFilter = "",
  onClearFilter,
}: {
  onSelectProspect?: (prospect: any) => void;
  locationFilter?: string;
  onClearFilter?: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // ── New Conversation Modal State ──
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDealer, setFormDealer] = useState("");
  const [formVehicle, setFormVehicle] = useState(POPULAR_VEHICLES[0]);
  const [formControl, setFormControl] = useState<"AI active" | "Human">("AI active");
  const [formInitialMessage, setFormInitialMessage] = useState("");
  const [formSendSms, setFormSendSms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch dealerships for dropdown
  useEffect(() => {
    getDealerships()
      .then((data) => {
        setDealerships(data);
        if (data.length > 0 && !formDealer) {
          setFormDealer(locationFilter || data[0].name);
        }
      })
      .catch(() => {});
  }, [locationFilter]);

  // Set default initial message when name, vehicle, or dealer changes
  useEffect(() => {
    const firstName = formName.trim() ? formName.trim().split(" ")[0] : "there";
    const car = formVehicle || "BYD";
    const dName = formDealer || locationFilter || "BYD Fairfield VIC";
    setFormInitialMessage(
      `Hi ${firstName}, thanks for your enquiry on the ${car} with ${dName}. I'm the virtual assistant for our sales team — happy to answer questions or set up a test drive. When are you looking to get into a new car? Reply STOP to opt out`
    );
  }, [formName, formVehicle, formDealer, locationFilter]);

  const loadConversations = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filter !== "all") params.control = filter;
    if (search) params.q = search;
    if (locationFilter) params.dealer = locationFilter;
    getConversations(params)
      .then((data) => {
        setConversations(data);
        setPage(1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, [filter, search, locationFilter]);

  const handleConversationClick = async (c: Conversation) => {
    if (!onSelectProspect) return;

    try {
      const leads = await getLeads({ q: c.phone || c.prospectName });
      const matched =
        (c.leadId && leads.find((l) => l._id === c.leadId)) ||
        (c.phone && leads.find((l) => l.phone === c.phone)) ||
        leads.find(
          (l) => l.name.toLowerCase() === c.prospectName.toLowerCase()
        ) ||
        leads[0];

      if (matched) {
        onSelectProspect(mapLeadToProspect(matched));
        return;
      }
    } catch {
      // Fallback below
    }

    onSelectProspect(
      createProspectFromMetadata({
        id: c.leadId || c.manualProspectId || c._id,
        _id: c.leadId || c._id,
        name: c.prospectName,
        phone: c.phone,
        dealer: c.dealer,
        control: c.control,
        status: c.status,
      })
    );
  };

  const handleCreateConversationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      setCreateError("Prospect name and mobile phone are required.");
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    try {
      const res = await createConversation({
        prospectName: formName.trim(),
        phone: formPhone.trim(),
        dealer: formDealer || locationFilter || "BYD Fairfield VIC",
        vehicle: formVehicle,
        control: formControl,
        initialMessage: formInitialMessage.trim(),
        sendSms: formSendSms,
      });

      setIsCreateModalOpen(false);
      // Reset form
      setFormName("");
      setFormPhone("");
      setFormVehicle(POPULAR_VEHICLES[0]);
      setFormControl("AI active");

      // Reload conversations
      loadConversations();

      // Open the newly created conversation immediately
      if (res.conversation) {
        handleConversationClick(res.conversation);
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create conversation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paginatedConvs = conversations.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(conversations.length / pageSize) || 1;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold m-0 leading-tight">Conversations</h1>
          <p className="text-sm text-[#657083] mt-1">
            {conversations.length} SMS thread{conversations.length === 1 ? "" : "s"}, fully logged for visibility and ACMA audit
          </p>
        </div>

        <div className="flex items-center gap-3 self-start shrink-0 flex-wrap">
          {/* Create Conversation Button */}
          <button
            onClick={() => {
              setCreateError(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#cf1d29] hover:bg-[#b51823] text-white transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>New Conversation</span>
          </button>

          <div className="flex rounded-lg overflow-hidden border border-[#e2e2e2]">
            {(
              [
                { key: "all", icon: MessageSquare, label: "All" },
                { key: "ai", icon: Bot, label: "AI Active" },
                { key: "human", icon: Activity, label: "Human Control" },
              ] as const
            ).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  filter === key
                    ? "bg-[#cf1d29] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {locationFilter && (
        <div className="flex items-center justify-between bg-red-50/80 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-950 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-red-600 shrink-0" />
            <span>Showing conversations for leads associated with: <strong className="text-red-800">{locationFilter}</strong></span>
          </div>
          {onClearFilter && (
            <button
              onClick={onClearFilter}
              className="font-bold text-red-700 hover:text-red-900 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="bg-white border border-[#e2e2e2] rounded-xl px-4 py-3 flex items-center gap-2">
        <Search size={16} className="text-[#657083] shrink-0" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search conversations by customer name or phone..."
          className="flex-1 min-w-0 text-sm outline-none bg-transparent placeholder:text-[#aaa]"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-[#657083]">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading conversations...
        </div>
      )}

      {error && (
        <div className="text-center py-10 text-red-500 text-sm">
          Failed to load conversations: {error}
        </div>
      )}

      {/* ── Conversation List ── */}
      {!loading && !error && (
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          {conversations.length === 0 ? (
            <div className="text-center py-16 text-[#657083] text-sm">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="font-semibold text-gray-700">No conversations found</p>
              <p className="text-xs text-gray-500 mt-1">Click &ldquo;New Conversation&rdquo; above to start messaging a prospect.</p>
            </div>
          ) : (
            <>
              {paginatedConvs.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleConversationClick(c)}
                  className="flex flex-col sm:flex-row sm:items-start gap-3 px-4 py-4 border-b border-[#e2e2e2] last:border-0 hover:bg-[#f9f9f9] cursor-pointer transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-xs font-bold text-[#444] shrink-0">
                    {c.initials || c.prospectName.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <b className="text-sm font-semibold">{c.prospectName}</b>
                      <Pill tone={c.status === "Commitment" ? "purple" : "amber"}>{c.status}</Pill>
                      <Pill tone={c.control.toLowerCase().includes("human") ? "amber" : "teal"}>
                        {c.control}
                      </Pill>
                    </div>
                    <p className="text-sm text-[#555] leading-snug line-clamp-2">
                      → {c.lastMessage}
                    </p>
                    <div className="flex items-center gap-3 mt-2 sm:hidden">
                      <span className="text-xs text-[#657083]">{c.phone}</span>
                      <span className="text-xs text-[#657083]">{c.daysAgo}d ago</span>
                      <span className="text-xs text-[#657083]">{c.msgCount} msgs</span>
                    </div>
                  </div>

                  {/* Desktop meta */}
                  <div className="hidden sm:flex flex-col items-end shrink-0 text-right gap-0.5">
                    <span className="text-xs font-medium text-[#333]">{c.phone}</span>
                    <small className="text-xs text-[#657083]">
                      {c.daysAgo}d ago · {c.msgCount} msgs
                    </small>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2 bg-white">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={conversations.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  itemLabel="conversations"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── New Conversation Modal ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#cf1d29] flex items-center justify-center">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 m-0 leading-tight">Start New Conversation</h2>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    Direct two-way SMS communication via MobileMessage gateway
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateConversationSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
              {createError && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prospect Full Name <span className="text-[#cf1d29]">*</span>
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 focus-within:border-[#cf1d29] transition-colors">
                    <User size={15} className="text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Taylor"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-sm outline-none bg-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Phone <span className="text-[#cf1d29]">*</span>
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 focus-within:border-[#cf1d29] transition-colors">
                    <Smartphone size={15} className="text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0412 345 678"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full text-sm outline-none bg-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Dealership Location
                  </label>
                  <select
                    value={formDealer}
                    onChange={(e) => setFormDealer(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-[#cf1d29] bg-white transition-colors text-gray-900"
                  >
                    {dealerships.length > 0 ? (
                      dealerships.map((d) => (
                        <option key={d._id} value={d.name}>
                          {d.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="BYD Fairfield VIC">BYD Fairfield VIC</option>
                        <option value="BYD Melbourne CBD">BYD Melbourne CBD</option>
                        <option value="BYD South Yarra">BYD South Yarra</option>
                        <option value="BYD Dandenong">BYD Dandenong</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vehicle of Interest
                  </label>
                  <select
                    value={formVehicle}
                    onChange={(e) => setFormVehicle(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-[#cf1d29] bg-white transition-colors text-gray-900"
                  >
                    {POPULAR_VEHICLES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Initial Conversation Control
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormControl("AI active")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      formControl === "AI active"
                        ? "border-[#cf1d29] bg-red-50/50 text-[#cf1d29]"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Bot size={16} className="shrink-0" />
                    <div>
                      <div className="text-xs font-bold">AI Assistant Active</div>
                      <div className="text-[11px] text-gray-500 leading-tight">Ava AI qualifies timeline & budget</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormControl("Human")}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      formControl === "Human"
                        ? "border-[#cf1d29] bg-red-50/50 text-[#cf1d29]"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <User size={16} className="shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Human Specialist</div>
                      <div className="text-[11px] text-gray-500 leading-tight">Manual direct messaging</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Opening SMS Message
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {formInitialMessage.length} characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formInitialMessage}
                  onChange={(e) => setFormInitialMessage(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl p-3 outline-none focus:border-[#cf1d29] transition-colors leading-relaxed text-gray-900"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Australian ACMA compliance: &ldquo;Reply STOP to opt out&rdquo; will be preserved automatically.
                </p>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formSendSms}
                  onChange={(e) => setFormSendSms(e.target.checked)}
                  className="w-4 h-4 text-[#cf1d29] rounded border-gray-300 focus:ring-[#cf1d29]"
                />
                <div className="text-xs">
                  <strong className="text-gray-900 block">Dispatch live SMS immediately to prospect mobile</strong>
                  <span className="text-gray-500 text-[11px]">
                    Sends opening message through MobileMessage gateway upon creation.
                  </span>
                </div>
              </label>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#cf1d29] hover:bg-[#b51823] text-white disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Start Conversation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

