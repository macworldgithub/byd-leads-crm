"use client";

import {
  CalendarDays,
  ChevronRight,
  MessageSquare,
  Network,
  Users,
  Zap,
  ArrowRight,
  Bot,
} from "lucide-react";
import { leads } from "../data";
import { Prospect } from "../shared";

// Inline small primitives to avoid CSS-class conflicts when using Tailwind
function StatCard({
  icon: Icon,
  title,
  value,
  desc,
  tone = "red",
}: {
  icon: any;
  title: string;
  value: string;
  desc: string;
  tone?: "red" | "teal" | "amber" | "slate";
}) {
  const iconColors: Record<string, string> = {
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-500",
    slate: "bg-slate-100 text-slate-500",
  };
  return (
    <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div className={`rounded-lg p-2 shrink-0 ${iconColors[tone] ?? iconColors.red}`}>
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] tracking-widest font-bold text-[#687486] uppercase leading-none mb-1">
          {title}
        </div>
        <div className="text-2xl font-bold leading-none mb-1">{value}</div>
        <p className="text-xs text-[#657083] truncate">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-[#ccc] shrink-0" />
    </div>
  );
}

function FunnelStep({
  label,
  sub,
  Icon: I,
  count,
  showArrow,
}: {
  label: string;
  sub: string;
  Icon: any;
  count: number;
  showArrow: boolean;
}) {
  return (
    <div className="relative flex-1 min-w-[110px] bg-[#f5f5f5] rounded-lg p-3 sm:p-4">
      <div className="flex justify-between items-center mb-2">
        <I size={16} className="text-[#cf1d29] opacity-40" />
        <strong className="text-lg font-bold">{count}</strong>
      </div>
      <b className="block text-sm font-semibold">{label}</b>
      <small className="block text-xs text-[#657083] mt-0.5">{sub}</small>
      {showArrow && (
        <ChevronRight
          size={18}
          className="hidden sm:block absolute -right-3.5 top-1/2 -translate-y-1/2 text-[#ccc] z-10"
        />
      )}
    </div>
  );
}

function LogItem({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="grid grid-cols-[3px_1fr] gap-3 pb-4 border-b border-[#e2e2e2] last:border-0 last:pb-0">
      <span className="w-[3px] rounded-sm bg-[#cf1d29] opacity-30 h-10 self-start" />
      <div>
        <b className="block text-sm font-semibold mb-0.5">{title}</b>
        <small className="block text-xs text-[#657083]">{meta}</small>
      </div>
    </div>
  );
}

export function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          title="Active Journeys"
          value="6"
          desc="All attachment prospects are active"
        />
        <StatCard
          icon={CalendarDays}
          title="Appointments"
          value="3"
          desc="Confirmed dealership test drives"
          tone="teal"
        />
        <StatCard
          icon={MessageSquare}
          title="Conversation Activity"
          value="43"
          desc="0 inbound · 0 outbound today"
          tone="slate"
        />
        <StatCard
          icon={Users}
          title="Human Assisted"
          value="1"
          desc="Specialist takeover in progress"
          tone="amber"
        />
      </div>

      {/* ── Funnel ── */}
      <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
          <div>
            <div className="text-[10px] tracking-widest font-bold text-[#cf1d29] uppercase mb-1">
              Conversion Engine
            </div>
            <h2 className="text-lg font-bold m-0 leading-snug">
              Live funnel progression
            </h2>
          </div>
          <small className="text-xs text-[#657083] sm:text-right sm:max-w-[200px]">
            Updated automatically from conversations and appointments
          </small>
        </div>
        <div className="flex flex-row gap-2 sm:gap-3 overflow-x-auto pb-1">
          {[
            { label: "Imported", sub: "Autogate captured", Icon: Network, count: 6 },
            { label: "Engaged", sub: "Two-way SMS", Icon: MessageSquare, count: 6 },
            { label: "Qualified", sub: "Needs captured", Icon: Zap, count: 6 },
            { label: "Committed", sub: "Test drives", Icon: CalendarDays, count: 3 },
          ].map(({ label, sub, Icon, count }, i) => (
            <FunnelStep
              key={label}
              label={label}
              sub={sub}
              Icon={Icon}
              count={count}
              showArrow={i < 3}
            />
          ))}
        </div>
      </div>

      {/* ── Lower Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Prospect Journeys */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] tracking-widest font-bold text-[#cf1d29] uppercase mb-1">
                Interactive Demonstration
              </div>
              <h2 className="text-lg font-bold m-0 leading-snug">
                Live prospect journeys
              </h2>
            </div>
            <button
              onClick={() => onNavigate?.("Leads Pipeline")}
              className="flex items-center gap-1 text-xs text-[#657083] hover:text-[#cf1d29] transition-colors mt-1 shrink-0">
              View board <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {leads.slice(0, 4).map((l) => (
              <Prospect key={l.name + l.score} lead={l} />
            ))}
          </div>
        </div>

        {/* Automation Log */}
        <div className="bg-white border border-[#e2e2e2] rounded-xl p-4 sm:p-5 flex flex-col gap-4 min-h-[300px]">
          <div>
            <div className="text-[10px] tracking-widest font-bold text-[#cf1d29] uppercase mb-1">
              Automation Log
            </div>
            <h2 className="text-lg font-bold m-0 leading-snug">
              Recent actions
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {[
              "Demo Dataset Refreshed",
              "Callback Confirmed",
              "Qualification Updated",
              "Appointment Booked",
              "Appointment Booked",
            ].map((x, i) => (
              <LogItem
                key={x + i}
                title={x}
                meta={`◷ 4d ago · ${i ? "Ava AI" : "Demo System"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
