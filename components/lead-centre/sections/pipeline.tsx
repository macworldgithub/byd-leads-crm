"use client";

import {
  FileCheck2,
  List,
  Plus,
  Search,
  Network,
  Columns3,
  ChevronRight,
  Users,
  Bot,
  CalendarDays,
} from "lucide-react";
import { Pill, Prospect } from "../shared";
import { leads } from "../data";
import { useState } from "react";

/* ── Inline StatCard to avoid CSS-class clashes ── */
function StatCard({
  icon: Icon,
  value,
  desc,
  tone = "red",
}: {
  icon: any;
  value: string;
  desc: string;
  tone?: "red" | "teal" | "amber";
}) {
  const colors: Record<string, string> = {
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-500",
  };
  return (
    <div className="bg-white border border-[#e2e2e2] rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div className={`rounded-lg p-2 shrink-0 ${colors[tone] ?? colors.red}`}>
        <Icon size={17} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-2xl font-bold leading-none mb-0.5">{value}</div>
        <p className="text-xs text-[#657083] truncate">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-[#ccc] shrink-0" />
    </div>
  );
}

const STOCK_NUMS = [3817, 4507, 4507, 3372, 3455, 4507];
const SOURCES = ["SMS Connect", "Call Connect", "Call Connect", "Call Connect", "Carsales", "Carsales"];
const RECEIVED = [6, 6, 6, 6, 7, 7];
const CONTROLS = ["AI active", "AI active", "AI active", "Human: Rowland Godeffroy", "AI active", "AI active"];
const CONTROL_TONES: Record<string, string> = {
  "AI active": "teal",
  "Human: Rowland Godeffroy": "amber",
};

export function Pipeline({
  onModal,
}: {
  onModal: (type: "prospect" | "csv") => void;
}) {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── Hero Banner ── */}
      <div className="bg-gray-900 text-white rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-1">
            Autogate Demonstration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold m-0 leading-tight">
            Lead journey board
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            6 active prospects · AI qualification through to dealership commitment
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onModal("prospect")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#cf1d29] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={15} /> Add Prospect
          </button>
          <button
            onClick={() => onModal("csv")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-800 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FileCheck2 size={15} /> Import CSV
          </button>
          {/* Board / List toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${
                viewMode === "board"
                  ? "bg-[#cf1d29] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Columns3 size={15} /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-[#cf1d29] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <List size={15} /> List
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users}       value="6" desc="Attachment prospects" />
        <StatCard icon={Bot}         value="2" desc="AI qualifying"        tone="teal" />
        <StatCard icon={CalendarDays} value="3" desc="Commitments"         tone="teal" />
        <StatCard icon={Users}       value="1" desc="Human assisted"       tone="amber" />
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border border-[#e2e2e2] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search size={16} className="text-[#657083] shrink-0" />
          <input
            placeholder="Search prospect, vehicle, stock or phone..."
            className="flex-1 min-w-0 text-sm outline-none bg-transparent placeholder:text-[#aaa]"
          />
        </div>
        <div className="flex gap-2">
          <select className="text-sm border border-[#e2e2e2] rounded-lg px-3 py-1.5 bg-white outline-none cursor-pointer">
            <option>All dealerships</option>
          </select>
          <select className="text-sm border border-[#e2e2e2] rounded-lg px-3 py-1.5 bg-white outline-none cursor-pointer">
            <option>All statuses</option>
          </select>
        </div>
      </div>

      {/* ── Board View ── */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              ["NEW ENQUIRIES", 0],
              ["AI QUALIFYING", 3],
              ["TEST DRIVE BOOKED", 3],
            ] as const
          ).map(([name, count], i) => (
            <div
              key={name}
              className="bg-white border border-[#e2e2e2] rounded-xl p-4 max-h-[560px] overflow-y-auto"
            >
              {/* Column header */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#e2e2e2]">
                <div>
                  <b className="block text-sm font-bold">{name}</b>
                  <small className="block text-xs text-[#657083] mt-0.5">
                    {i ? "Conversation in progress" : "Awaiting first contact"}
                  </small>
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </div>

              {i === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Network size={20} className="mx-auto mb-2 opacity-30" />
                  <b className="block text-sm">No prospects in this stage</b>
                  <small className="text-xs">
                    The board updates as replies are processed.
                  </small>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {leads
                    .slice(i - 1, i + 2)
                    .map((l) => (
                      <Prospect key={l.name + l.score} lead={l} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === "list" && (
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          {/* Mobile card layout */}
          <div className="sm:hidden divide-y divide-[#e2e2e2]">
            {leads.map((l, i) => (
              <div key={l.name + l.score} className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <b className="block text-sm font-semibold">{l.name}</b>
                    <small className="text-xs text-[#657083]">0491 570 20{i + 1}</small>
                  </div>
                  <span className="text-lg font-bold text-[#cf1d29]">{l.score}</span>
                </div>
                <div>
                  <b className="block text-sm">{l.vehicle}</b>
                  <small className="text-xs text-[#657083]">Stock #{STOCK_NUMS[i]}</small>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Pill tone={l.tag === "Commitment" ? "purple" : "amber"}>{l.tag}</Pill>
                  <Pill tone={CONTROL_TONES[CONTROLS[i]] ?? "teal"}>{CONTROLS[i]}</Pill>
                  <span className="text-xs text-[#657083] ml-auto">{RECEIVED[i]}d ago</span>
                </div>
                <small className="text-xs text-[#657083]">
                  {SOURCES[i]} · {l.dealer}
                </small>
              </div>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f9f9f9]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2]">Prospect</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2]">Vehicle enquiry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2] hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2] hidden lg:table-cell">Dealership</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2]">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2] hidden lg:table-cell">Control</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2]">Score</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2] hidden md:table-cell">Received</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr
                    key={l.name + l.score}
                    className="hover:bg-[#f9f9f9] transition-colors"
                  >
                    <td className="px-4 py-3 border-b border-[#e2e2e2]">
                      <b className="block text-sm font-semibold">{l.name}</b>
                      <small className="text-xs text-[#657083]">0491 570 20{i + 1}</small>
                    </td>
                    <td className="px-4 py-3 border-b border-[#e2e2e2]">
                      <b className="block text-sm">{l.vehicle}</b>
                      <small className="text-xs text-[#657083]">Stock #{STOCK_NUMS[i]}</small>
                    </td>
                    <td className="px-4 py-3 border-b border-[#e2e2e2] hidden md:table-cell">
                      <small className="text-xs text-[#657083]">{SOURCES[i]}</small>
                    </td>
                    <td className="px-4 py-3 border-b border-[#e2e2e2] hidden lg:table-cell">
                      <small className="text-xs text-[#657083]">{l.dealer}</small>
                    </td>
                    <td className="px-4 py-3 border-b border-[#e2e2e2]">
                      <Pill tone={l.tag === "Commitment" ? "purple" : "amber"}>{l.tag}</Pill>
                    </td>
                    <td className="px-4 py-3 border-b border-[#e2e2e2] hidden lg:table-cell">
                      <Pill tone={CONTROL_TONES[CONTROLS[i]] ?? "teal"}>{CONTROLS[i]}</Pill>
                    </td>
                    <td className="px-4 py-3 border-b border-[#e2e2e2] text-right">
                      <b className="text-sm font-bold">{l.score}</b>
                    </td>
                    <td className="px-4 py-3 border-b border-[#e2e2e2] text-right hidden md:table-cell">
                      <small className="text-xs text-[#657083]">{RECEIVED[i]}d ago</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
