"use client";

import { MessageSquare, Bot, Activity, Search } from "lucide-react";
import { Pill } from "../shared";
import { conversations } from "../data";
import { useState } from "react";

const INITIALS = ["CP", "CP", "AT", "DK", "SP", "CP"];
const PHONES   = [204, 203, 202, 201, 200, 199];
const MSGS     = [7, 5, 9, 12, 6, 8];

const LAST_MSG = [
  "Confirmed — I'll call at 3:30pm today. I've kept stock linked to your enquiry.",
  "Of course — I'll keep the enquiry active and monitor availability.",
  "Confirmed — I'll call at 3:30pm today. I've kept stock linked to your enquiry.",
  "Of course — I'll keep the enquiry active and monitor availability.",
  "Confirmed — I'll call at 3:30pm today. I've kept stock linked to your enquiry.",
  "Of course — I'll keep the enquiry active and monitor availability.",
];

type Filter = "all" | "ai" | "human";

export function Conversations() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold m-0 leading-tight">Conversations</h1>
          <p className="text-sm text-[#657083] mt-1">
            Every SMS thread, fully logged for visibility and ACMA audit
          </p>
        </div>

        {/* Filter segmented control */}
        <div className="flex rounded-lg overflow-hidden border border-[#e2e2e2] self-start shrink-0">
          {(
            [
              { key: "all",   icon: MessageSquare, label: "All" },
              { key: "ai",    icon: Bot,           label: "AI Active" },
              { key: "human", icon: Activity,      label: "Human Control" },
            ] as const
          ).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
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

      {/* ── Search bar ── */}
      <div className="bg-white border border-[#e2e2e2] rounded-xl px-4 py-3 flex items-center gap-2">
        <Search size={16} className="text-[#657083] shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="flex-1 min-w-0 text-sm outline-none bg-transparent placeholder:text-[#aaa]"
        />
      </div>

      {/* ── Conversation List ── */}
      <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
        {conversations.map((x, i) => (
          <div
            key={x + i}
            className="flex flex-col sm:flex-row sm:items-start gap-3 px-4 py-4 border-b border-[#e2e2e2] last:border-0 hover:bg-[#fafafa] transition-colors"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-xs font-bold text-[#444] shrink-0">
              {INITIALS[i] ?? "CP"}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Name + pills */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <b className="text-sm font-semibold">{x}</b>
                <Pill tone={i > 1 ? "purple" : "amber"}>
                  {i > 1 ? "Commitment" : "Contact"}
                </Pill>
                <Pill tone="teal">
                  {i === 0 ? "Human: Rowland Godfrey" : "AI active"}
                </Pill>
              </div>

              {/* Last message */}
              <p className="text-sm text-[#555] leading-snug line-clamp-2">
                → {LAST_MSG[i]}
              </p>

              {/* Mobile-only meta */}
              <div className="flex items-center gap-3 mt-2 sm:hidden">
                <span className="text-xs text-[#657083]">0491 570 {PHONES[i]}</span>
                <span className="text-xs text-[#657083]">{4 + i}d ago</span>
                <span className="text-xs text-[#657083]">{MSGS[i]} msgs</span>
              </div>
            </div>

            {/* Desktop-only right meta */}
            <div className="hidden sm:flex flex-col items-end shrink-0 text-right gap-0.5">
              <span className="text-xs font-medium text-[#333]">0491 570 {PHONES[i]}</span>
              <small className="text-xs text-[#657083]">{4 + i}d ago · {MSGS[i]} msgs</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
