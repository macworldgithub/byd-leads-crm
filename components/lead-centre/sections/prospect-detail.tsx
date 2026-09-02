"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  HandMetal,
  MessageSquare,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  UserCheck,
  Zap,
} from "lucide-react";

export interface ProspectDetailProps {
  prospect?: {
    id?: string;
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

interface Message {
  id: string;
  sender: "ai" | "user" | "agent";
  text: string;
  time: string;
  status?: string;
}

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
  const prospectId = prospect?.id || "MANUAL-1765335671608";

  // ── States ─────────────────────────────────────────────────────────────
  const [stage, setStage] = useState(prospect?.stage || "Contact");
  const [isAiActive, setIsAiActive] = useState(true);
  const [funnelStep, setFunnelStep] = useState<number>(2); // 1: Imported, 2: Engaged, 3: Qualified, 4: Committed
  const [chatInput, setChatInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Qualification insights
  const [qualification, setQualification] = useState({
    intent: "—",
    budget: "—",
    timeline: "—",
    tradeIn: "—",
    finance: "—",
  });

  // Message log
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: `Hi ${firstName}, thanks for your enquiry on the ${vehicle} with ${dealership}. I'm the virtual assistant for our sales team — happy to answer questions or set up a test drive. When are you looking to get into a new car? Reply STOP to opt out`,
      time: "AI Assistant · 2 Sept, 12:52 pm · sent",
      status: "sent",
    },
  ]);

  // Handle customer response simulation
  const handleSendResponse = (responseText?: string) => {
    const textToSend = (responseText || chatInput).trim();
    if (!textToSend || isSimulating) return;

    const newMsgId = `msg-${Date.now()}`;
    const userMsg: Message = {
      id: newMsgId,
      sender: isAiActive ? "user" : "agent",
      text: textToSend,
      time: `Prospect · Just now · delivered`,
      status: "delivered",
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSimulating(true);

    // Update qualification insights based on input
    const lower = textToSend.toLowerCase();
    setQualification((prev) => {
      const updated = { ...prev };
      if (lower.includes("month") || lower.includes("week") || lower.includes("asap") || lower.includes("soon")) {
        updated.timeline = "This month";
        updated.intent = "High Intent";
      }
      if (lower.includes("$") || lower.includes("budget") || lower.includes("50k") || lower.includes("price")) {
        updated.budget = "$50,000";
      }
      if (lower.includes("trade") || lower.includes("vehicle")) {
        updated.tradeIn = "Yes (Trade-in vehicle)";
      }
      if (lower.includes("finance") || lower.includes("loan") || lower.includes("cash")) {
        updated.finance = "Finance Requested";
      }
      return updated;
    });

    if (funnelStep < 3) {
      setFunnelStep(3);
    }

    // AI automated reply after brief simulation latency
    if (isAiActive) {
      setTimeout(() => {
        let aiReplyText = `Thanks for letting me know! We have immediate stock of the ${vehicle} available in ${color} at ${dealership}. Would you be free for a 30-minute test drive this weekend?`;
        if (lower.includes("trade")) {
          aiReplyText = `That's great! We offer guaranteed competitive trade-in valuations at ${dealership}. Could you share the make, model, and year of your current vehicle?`;
        } else if (lower.includes("50k") || lower.includes("budget")) {
          aiReplyText = `The ${vehicle} starts at ${price}, which fits comfortably in your $50k budget! Would you like us to prepare a transparent drive-away quote for you?`;
        }

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiReplyText,
          time: `AI Assistant · Just now · sent`,
          status: "sent",
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsSimulating(false);
      }, 700);
    } else {
      setIsSimulating(false);
    }
  };

  const handleTakeOver = () => {
    setIsAiActive(!isAiActive);
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff8e8] text-[#a75b00] border border-[#ffd45b]">
                {stage}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isAiActive
                    ? "bg-[#eafaf1] text-[#0e8a49] border border-[#a3e9c4]"
                    : "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]"
                  }`}
              >
                ● {isAiActive ? "AI active" : "Human assisted"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#657083] mt-1 m-0">
              {phone} · {dealership} · via Autogate just now
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="text-xs sm:text-sm border border-[#e2e2e2] rounded-lg px-3 py-2 bg-white text-gray-800 outline-none cursor-pointer hover:border-gray-400 focus:border-[#cf1d29]"
          >
            <option value="Contact">New</option>
            <option value="AI QUALIFYING">Contact</option>
            <option value="TEST DRIVE BOOKED">Commitment</option>
            <option value="DELIVERED">Sold</option>
            <option value="LOST">Lost</option>
            <option value="OPTED OUT">Opted Out</option>
          </select>

          <button
            onClick={handleTakeOver}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${isAiActive
                ? "bg-[#cf1d29] hover:bg-[#b51823] text-white shadow-sm"
                : "bg-gray-800 hover:bg-gray-900 text-white"
              }`}
          >
            {isAiActive ? (
              <>
                <UserCheck size={15} /> Take Over
              </>
            ) : (
              <>
                <Zap size={15} /> Hand Back to AI
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (confirm("Delete this test prospect?")) onBack();
            }}
            className="p-2 border border-[#e2e2e2] rounded-lg text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
            title="Delete prospect"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Hero Banner (Dark AI Qualification Card) ── */}
      <div className="bg-[#191919] text-white rounded-2xl p-5 sm:p-7 shadow-md">
        {/* Top Badges & Mode Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#2a2a2a] text-gray-300 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md tracking-wider">
              MANUAL TEST - ID {prospectId}
            </span>
            <span className="bg-[#0b332b] text-[#34d399] border border-[#105649] text-[11px] font-medium px-2.5 py-1 rounded-md">
              inventory monitored
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-right">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div>
              <span className="font-semibold text-gray-200">
                {isAiActive ? "AI conversation active" : "Human Agent Active"}
              </span>
              <p className="text-[11px] text-gray-400 m-0">
                Representing {dealership}; no live SMS is sent in demo mode.
              </p>
            </div>
          </div>
        </div>

        {/* Main Banner Heading */}
        <div className="py-5">
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight m-0">
            {isAiActive
              ? "AI is continuing to qualify timeline, budget, trade-in and finance needs"
              : "Human sales representative is currently managing this lead"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 m-0">
            Conversation progress and qualification insights update automatically.
          </p>
        </div>

        {/* Funnel Progress Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[
            { step: 1, label: "Imported", icon: CheckCircle2, completed: true, active: false },
            { step: 2, label: "Engaged", icon: MessageSquare, completed: funnelStep > 2, active: funnelStep === 2 },
            { step: 3, label: "Qualified", icon: UserCheck, completed: funnelStep > 3, active: funnelStep === 3 },
            { step: 4, label: "Committed", icon: Zap, completed: funnelStep >= 4, active: funnelStep === 4 },
          ].map((s, idx) => {
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
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 m-0">
                <Bookmark size={17} className="text-[#cf1d29]" />
                SMS Conversation Log
              </h3>
              <span className="text-xs text-gray-500 font-medium">Two-Way SMS (Demo)</span>
            </div>

            {/* Chat message bubbles */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
              {messages.map((m) => {
                const isAi = m.sender === "ai";
                const isUser = m.sender === "user";

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${isAi
                          ? "bg-[#cf1d29] text-white rounded-tl-sm"
                          : isUser
                            ? "bg-[#eff3f9] text-gray-900 border border-gray-200 rounded-tr-sm"
                            : "bg-gray-800 text-white rounded-tl-sm"
                        }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1 px-1">{m.time}</span>
                  </div>
                );
              })}

              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                  AI Assistant typing response...
                </div>
              )}
            </div>

            {/* Middle Status Notice */}
            <div className="bg-[#e8fbf8] border border-[#a6f0e6] text-[#00756c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium mt-4">
              {isAiActive
                ? "AI assistant is managing this conversation. Take over to reply manually."
                : "Human agent mode active. Type a manual reply to the customer below."}
            </div>

            {/* Customer Response Simulation Box */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  TRY A CUSTOMER RESPONSE
                </span>
                <span className="text-gray-400 text-[11px]">
                  Click a prompt or write your own
                </span>
              </div>

              {/* Quick response chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  "I'm looking to buy this month",
                  "My budget is around $50k",
                  "I have a vehicle to trade",
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendResponse(chip)}
                    disabled={isSimulating}
                    className="text-xs bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 text-gray-700 rounded-full px-3 py-1.5 font-medium transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendResponse();
                }}
                className="flex items-center gap-2 border border-gray-300 rounded-xl p-1.5 focus-within:border-[#cf1d29] transition-colors bg-white mt-1"
              >
                <Smartphone size={16} className="text-gray-400 ml-2 shrink-0" />
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    isAiActive
                      ? "Demo: simulate a prospect SMS reply..."
                      : "Type manual SMS message to prospect..."
                  }
                  className="flex-1 min-w-0 text-sm outline-none px-1 text-gray-800 placeholder:text-gray-400 bg-transparent"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSimulating}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 transition-colors shrink-0"
                >
                  {isAiActive ? "Simulate" : "Send SMS"}
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
              <span className="text-xs text-gray-500">@ {dealership === "BYD Fairfield VIC" ? "BYD Wollongong" : dealership}</span>
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
                <span className="font-mono text-gray-700">manual_test_prospect_simulated</span>
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
