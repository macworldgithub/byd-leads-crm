"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Car,
  CheckCircle2,
  HandMetal,
  Loader2,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  updateLead,
  deleteLead,
  deleteConversation,
  getConversationByLead,
  simulateCustomerResponse,
  sendAgentReply,
  toggleConversationControl,
  type Conversation,
  type ConversationMessage,
} from "@/lib/api";

export interface ProspectDetailProps {
  prospect?: {
    id?: string;
    _id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    dealership?: string;
    vehicle?: string;
    enquiryDesc?: string;
    enquiryNote?: string;
    sendSms?: boolean;
    stage?: string;
    status?: string;
    stockNum?: string;
    price?: string;
    color?: string;
  };
  onBack: () => void;
}

// Map stage dropdown values to the backend stage enum
const STAGE_MAP: Record<string, string> = {
  New: "NEW ENQUIRIES",
  Contact: "AI QUALIFYING",
  Commitment: "TEST DRIVE BOOKED",
  Sold: "DELIVERED",
  Lost: "LOST",
  "Opted Out": "OPTED OUT",
};

const STAGE_REVERSE_MAP: Record<string, string> = {
  "NEW ENQUIRIES": "New",
  "AI QUALIFYING": "Contact",
  "TEST DRIVE BOOKED": "Commitment",
  DELIVERED: "Sold",
  LOST: "Lost",
  "OPTED OUT": "Opted Out",
};

const STAGE_TO_STATUS: Record<string, string> = {
  "NEW ENQUIRIES": "new",
  "AI QUALIFYING": "qualification",
  "TEST DRIVE BOOKED": "committed",
  DELIVERED: "sold",
  LOST: "lost",
  "OPTED OUT": "opted out",
};

export function ProspectDetail({ prospect, onBack }: ProspectDetailProps) {
  const firstName = prospect?.firstName || "muhammad";
  const lastName = prospect?.lastName || "Ahmed";
  const fullName = `${firstName} ${lastName}`.trim();
  const phone = prospect?.phone || "0412 345 678";
  const dealership = prospect?.dealership || "BYD Fairfield VIC";
  const vehicle = prospect?.vehicle || "2025 BYD ATTO 1";
  const color = prospect?.color || "Apricity White";
  const stockNum = prospect?.stockNum || "6944";
  const price = prospect?.price || "$23,990";
  const prospectId = prospect?._id || prospect?.id || "MANUAL-" + Date.now();
  const isMongoId = prospect?._id && /^[a-f0-9]{24}$/.test(prospect._id);

  // ── States ─────────────────────────────────────────────────────────────
  const [stage, setStage] = useState(() => {
    const raw = prospect?.stage || "NEW ENQUIRIES";
    return STAGE_REVERSE_MAP[raw] || raw;
  });

  const [control, setControl] = useState<string>(
    prospect?.status?.toLowerCase().includes("human")
      ? "Human: Demo Agent"
      : "AI active"
  );
  const isAiActive = control === "AI active";

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([
    "I'm looking to buy this month",
    "My budget is around $60k",
    "I have a vehicle to trade",
  ]);

  const [funnelStep, setFunnelStep] = useState<number>(2);
  const [customerInput, setCustomerInput] = useState("");
  const [agentInput, setAgentInput] = useState("");

  const [isLoadingConvo, setIsLoadingConvo] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSendingAgent, setIsSendingAgent] = useState(false);
  const [isTogglingControl, setIsTogglingControl] = useState(false);
  const [isSavingStage, setIsSavingStage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [qualification, setQualification] = useState({
    intent: "—",
    budget: "—",
    timeline: "—",
    tradeIn: "—",
    finance: "—",
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSimulating]);

  // Load conversation from backend
  useEffect(() => {
    let isMounted = true;
    setIsLoadingConvo(true);

    getConversationByLead(prospectId, {
      name: fullName,
      phone,
      dealer: dealership,
      vehicle,
    })
      .then((convo) => {
        if (!isMounted) return;
        setConversation(convo);
        setMessages(convo.messages || []);
        if (convo.control) setControl(convo.control);
        if (convo.suggestedResponses && convo.suggestedResponses.length > 0) {
          setSuggestedResponses(convo.suggestedResponses);
        }
        if (convo.qualification) {
          setQualification(convo.qualification);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch conversation:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingConvo(false);
      });

    return () => {
      isMounted = false;
    };
  }, [prospectId, fullName, phone, dealership, vehicle]);

  // Funnel step sync
  useEffect(() => {
    if (stage === "New") setFunnelStep(1);
    else if (stage === "Contact") setFunnelStep(2);
    else if (stage === "Commitment") setFunnelStep(3);
    else if (stage === "Sold") setFunnelStep(4);
  }, [stage]);

  // Stage change handler
  const handleStageChange = async (newStage: string) => {
    setStage(newStage);
    if (!isMongoId) return;

    setIsSavingStage(true);
    try {
      const backendStage = STAGE_MAP[newStage] || newStage;
      const backendStatus = STAGE_TO_STATUS[backendStage] || "new";
      await updateLead(prospect!._id!, {
        stage: backendStage,
        status: backendStatus,
      });
    } catch (err: any) {
      console.error("Failed to update stage:", err.message);
    } finally {
      setIsSavingStage(false);
    }
  };

  // Toggle control: Take Over (AI active -> Human) or Resume AI (Human -> AI active)
  const handleToggleControl = async () => {
    if (!conversation?._id) return;
    setIsTogglingControl(true);

    const action = isAiActive ? "takeover" : "resume";
    try {
      const res = await toggleConversationControl(conversation._id, { action });
      setControl(res.control);
      setConversation(res.conversation);
      setMessages(res.conversation.messages || []);
    } catch (err: any) {
      console.error("Failed to toggle control:", err.message);
    } finally {
      setIsTogglingControl(false);
    }
  };

  // Click on a suggested responsechip -> populates the input field
  const handleSelectSuggestion = (chipText: string) => {
    setCustomerInput(chipText);
  };

  // Simulate prospect SMS response via backend API
  const handleSimulateResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = customerInput.trim();
    if (!textToSend || !conversation?._id || isSimulating) return;

    setIsSimulating(true);
    try {
      const res = await simulateCustomerResponse(conversation._id, {
        text: textToSend,
        vehicle,
        dealer: dealership,
      });

      setConversation(res.conversation);
      setMessages(res.conversation.messages || []);
      if (res.conversation.suggestedResponses) {
        setSuggestedResponses(res.conversation.suggestedResponses);
      }
      if (res.conversation.qualification) {
        setQualification(res.conversation.qualification);
      }
      setCustomerInput("");
    } catch (err: any) {
      console.error("Failed to simulate customer response:", err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Send manual agent reply via backend API
  const handleSendAgentReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = agentInput.trim();
    if (!textToSend || !conversation?._id || isSendingAgent) return;

    setIsSendingAgent(true);
    try {
      const res = await sendAgentReply(conversation._id, { text: textToSend });
      setConversation(res.conversation);
      setMessages(res.conversation.messages || []);
      setAgentInput("");
    } catch (err: any) {
      console.error("Failed to send agent reply:", err.message);
    } finally {
      setIsSendingAgent(false);
    }
  };

  // Delete lead & related conversation
  const handleDelete = async () => {
    if (!confirm("Delete this prospect? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const deletePromises: Promise<any>[] = [];

      if (prospect?._id && /^[a-f0-9]{24}$/.test(prospect._id)) {
        deletePromises.push(deleteLead(prospect._id).catch(() => null));
      }

      if (conversation?._id) {
        deletePromises.push(deleteConversation(conversation._id).catch(() => null));
      }

      await Promise.all(deletePromises);
      onBack();
    } catch (err: any) {
      console.error("Failed to delete lead:", err.message);
      onBack();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-200">
      {/* ── Top Header Row ── */}
      <div className="bg-white border border-[#e2e2e2] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-gray-700 shrink-0"
            title="Back to Pipeline"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0 leading-tight">
                {fullName}
              </h1>

              {/* Status Tag */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                {stage}
              </span>

              {/* Control Tag */}
              {isAiActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eafaf1] text-[#0e8a49] border border-[#a3e9c4]">
                  AI active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                  Human: Demo Agent
                </span>
              )}

              {isSavingStage && (
                <Loader2 size={14} className="animate-spin text-gray-400" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#657083] mt-1 m-0">
              {phone} · {dealership} · via Autogate 27m ago
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={stage}
            onChange={(e) => handleStageChange(e.target.value)}
            disabled={isSavingStage}
            className="text-xs sm:text-sm border border-[#e2e2e2] rounded-lg px-3 py-2 bg-white text-gray-800 outline-none cursor-pointer hover:border-gray-400 focus:border-[#cf1d29]"
          >
            <option value="New">New</option>
            <option value="Contact">Contact</option>
            <option value="Commitment">Commitment</option>
            <option value="Sold">Sold</option>
            <option value="Lost">Lost</option>
            <option value="Opted Out">Opted Out</option>
          </select>

          <button
            onClick={handleToggleControl}
            disabled={isTogglingControl}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${isAiActive
              ? "bg-[#cf1d29] hover:bg-[#b51823] text-white shadow-sm"
              : "bg-white border border-[#e2e2e2] text-gray-800 hover:bg-gray-50 shadow-sm"
              }`}
          >
            {isTogglingControl ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isAiActive ? (
              <>
                <UserCheck size={15} /> Take Over
              </>
            ) : (
              <>
                <Zap size={15} className="text-gray-600" /> Resume AI
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 border border-[#e2e2e2] rounded-lg text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete prospect"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      {/* ── Hero Banner (Dark AI Qualification Card) ── */}
      <div className="bg-[#191919] text-white rounded-2xl p-5 sm:p-7 shadow-md">
        {/* Top Badges & Mode Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#2a2a2a] text-gray-300 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md tracking-wider">
              {isMongoId ? `ID ${prospectId.slice(-8).toUpperCase()}` : `MANUAL TEST - ID ${prospectId}`}
            </span>
            <span className="bg-[#0b332b] text-[#34d399] border border-[#105649] text-[11px] font-medium px-2.5 py-1 rounded-md">
              inventory monitored
            </span>
          </div>

          <div className="sm:max-w-[420px]">
            {isAiActive ? (
              <div className="bg-[#202020] border border-gray-800 rounded-xl p-3 text-xs flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 mt-1" />
                <div>
                  <b className="text-gray-200 block text-xs">AI conversation active</b>
                  <p className="text-[11px] text-gray-400 m-0 mt-0.5 leading-relaxed">
                    Representing {dealership}; no live SMS is sent in demo mode.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#2a2313] border border-[#78541e] rounded-xl p-3 text-xs flex items-start gap-2.5">
                <User size={15} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <b className="text-[#fbbf24] block text-xs">Human-controlled conversation</b>
                  <p className="text-[11px] text-amber-200/70 m-0 mt-0.5 leading-relaxed">
                    Representing {dealership}; no live SMS is sent in demo mode.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Banner Heading */}
        <div className="py-5">
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight m-0">
            {isAiActive
              ? "AI is continuing to qualify timeline, budget, trade-in and finance needs"
              : "Human follow-up active — Demo Agent owns the next response"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 m-0">
            Interactive demonstration reply captured; qualification continues.
          </p>
        </div>

        {/* Funnel Progress Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[
            { step: 1, label: "Imported", icon: CheckCircle2, completed: true, active: false },
            { step: 2, label: "Engaged", icon: Bookmark, completed: funnelStep > 2, active: funnelStep === 2 },
            { step: 3, label: "Qualified", icon: UserCheck, completed: funnelStep > 3, active: funnelStep === 3 },
            { step: 4, label: "Committed", icon: Zap, completed: funnelStep >= 4, active: funnelStep === 4 },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = s.completed;
            const isActive = s.active;

            return (
              <div
                key={s.step}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isDone || isActive
                  ? "bg-[#252525] border-[#cf1d29]/60 text-white"
                  : "bg-[#202020] border-gray-800 text-gray-500"
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 ${isDone
                    ? "bg-[#cf1d29] text-white"
                    : isActive
                      ? "border-2 border-[#cf1d29] text-[#cf1d29] bg-transparent"
                      : "border border-gray-700 text-gray-600"
                    }`}
                >
                  <Icon size={14} />
                </div>
                <span className="text-xs font-semibold">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main 2-Column Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── Left Column: SMS Conversation Log ── */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[560px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 m-0">
                <Bookmark size={17} className="text-[#cf1d29]" />
                SMS Conversation Log
              </h3>
            </div>

            {/* Chat message bubbles */}
            <div
              ref={chatScrollRef}
              className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[460px] pr-1 py-2"
            >
              {isLoadingConvo ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-xs">
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Loading conversation...
                </div>
              ) : (
                messages.map((m) => {
                  if (m.sender === "system") {
                    return (
                      <div key={m.id} className="flex justify-center my-1.5">
                        <span className="inline-block bg-[#fef9c3] text-[#854d0e] border border-[#fef08a] px-3.5 py-1.5 rounded-xl text-xs font-medium text-center shadow-xs">
                          {m.text}
                        </span>
                      </div>
                    );
                  }

                  const isAi = m.sender === "ai";
                  const isAgent = m.sender === "agent";
                  const isUser = m.sender === "user";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-xs ${isAi
                          ? "bg-[#b91c1c] text-white rounded-br-sm"
                          : isAgent
                            ? "bg-[#58151c] text-white rounded-br-sm font-normal"
                            : "bg-[#f1f3f5] text-gray-900 border border-gray-200 rounded-bl-sm"
                          }`}
                      >
                        {m.text}
                      </div>
                      {m.time && (
                        <span className="text-[11px] text-gray-400 mt-1 px-1">
                          {m.time}
                        </span>
                      )}
                    </div>
                  );
                })
              )}

              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic py-1 self-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0.4s]" />
                  AI Assistant replying...
                </div>
              )}
            </div>

            {/* Middle Status Notice */}
            {isAiActive && (
              <div className="bg-[#e8fbf8] border border-[#a6f0e6] text-[#00756c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium mt-3">
                AI assistant is managing this conversation. Take over to reply manually.
              </div>
            )}

            {/* ── Demo Agent Input (Appears when Human is controlling) ── */}
            {!isAiActive && (
              <form
                onSubmit={handleSendAgentReply}
                className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  placeholder="Reply as Demo Agent... (compliance footer added automatically)"
                  className="flex-1 min-w-0 text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#cf1d29] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!agentInput.trim() || isSendingAgent}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#cf1d29] hover:bg-[#b51823] disabled:opacity-50 text-white transition-colors shrink-0 shadow-xs"
                >
                  {isSendingAgent ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={15} /> Send
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── Customer Response Simulation Box ── */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  TRY A CUSTOMER RESPONSE
                </span>
                <span className="text-gray-400 text-[11px]">
                  Click a prompt or write your own
                </span>
              </div>

              {/* Dynamic question chip options */}
              <div className="flex flex-wrap gap-2">
                {suggestedResponses.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(chip)}
                    className="text-xs bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 text-gray-700 rounded-full px-3 py-1.5 font-medium transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Simulation input form */}
              <form
                onSubmit={handleSimulateResponse}
                className="flex items-center gap-2 border border-gray-300 rounded-xl p-1.5 focus-within:border-[#cf1d29] transition-colors bg-white mt-1"
              >
                <Smartphone size={16} className="text-gray-400 ml-2 shrink-0" />
                <input
                  type="text"
                  value={customerInput}
                  onChange={(e) => setCustomerInput(e.target.value)}
                  placeholder="Demo: simulate a prospect SMS reply..."
                  className="flex-1 min-w-0 text-sm outline-none px-1 text-gray-800 placeholder:text-gray-400 bg-transparent"
                />
                <button
                  type="submit"
                  disabled={!customerInput.trim() || isSimulating}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 transition-colors shrink-0"
                >
                  {isSimulating ? "Simulating..." : "Simulate"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Right Column: Metadata Cards ── */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Card 1: Qualification Profile */}
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3 m-0">
              <User size={16} className="text-[#cf1d29]" />
              Qualification Profile
            </h3>
            <div className="divide-y divide-gray-100 text-xs sm:text-sm">
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-500">Intent</span>
                <span className="font-semibold text-gray-800">{qualification.intent}</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-500">Budget</span>
                <span className="font-semibold text-gray-800">{qualification.budget}</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-500">Timeline</span>
                <span className="font-semibold text-gray-800">{qualification.timeline}</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-500">Trade-in</span>
                <span className="font-semibold text-gray-800">{qualification.tradeIn}</span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-500">Finance</span>
                <span className="font-semibold text-gray-800">{qualification.finance}</span>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
              Original enquiry: {prospect?.enquiryNote || "Manually added test prospect"}
            </div>
          </div>

          {/* Card 2: Vehicle */}
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 m-0">
                <Car size={16} className="text-[#cf1d29]" />
                Vehicle
              </h3>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                ENQUIRED VEHICLE
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Available
              </span>
            </div>
            <div className="font-bold text-base text-gray-900">{vehicle}</div>
            <p className="text-xs text-gray-500 mt-0.5 m-0">
              {color} · Stock #{stockNum}
            </p>
            <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-100">
              <span className="text-base font-bold text-gray-900">{price}</span>
              <span className="text-xs text-gray-500">@ {dealership}</span>
            </div>
          </div>

          {/* Card 3: Appointments */}
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2 m-0">
              <Calendar size={16} className="text-[#cf1d29]" />
              Appointments
            </h3>
            <p className="text-xs text-gray-500 m-0 leading-relaxed">
              No appointments yet — the AI proposes times once the lead is qualified.
            </p>
          </div>

          {/* Card 4: Compliance */}
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3 m-0">
              <ShieldCheck size={16} className="text-[#cf1d29]" />
              Compliance
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Consent basis</span>
                <span className="font-mono text-gray-700">
                  {isMongoId ? "autogate_enquiry" : "manual_test_prospect_simulated"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Consent captured</span>
                <span className="text-gray-700">02/09/2026</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Sender ID</span>
                <span className="font-semibold text-gray-800">BYDFldVIC</span>
              </div>
              <div className="pt-1.5 border-t border-gray-100 text-gray-500 text-[11px] leading-relaxed">
                Contact window: 09:00–20:00 weekdays, 09:00–17:00 Sat (Australia/Melbourne)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
