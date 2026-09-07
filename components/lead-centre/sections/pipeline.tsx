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
  Loader2,
  XCircle,
} from "lucide-react";
import { Pill, Prospect } from "../shared";
import { Pagination } from "../pagination";
import {
  getLeads,
  getPaginatedLeads,
  getLeadDealerships,
  getLeadStatuses,
  getLeadStats,
  type Lead,
} from "@/lib/api";
import { useState, useEffect, useCallback, useRef } from "react";

const STATUS_OPTIONS = [
  "new",
  "committed",
  "qualification",
  "sold",
  "lost",
  "opted out",
];

function StatCard({
  icon: Icon,
  value,
  desc,
  tone = "red",
  onClick,
  active,
}: {
  icon: any;
  value: number;
  desc: string;
  tone?: "red" | "teal" | "amber";
  onClick?: () => void;
  active?: boolean;
}) {
  const colors: Record<string, string> = {
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-500",
  };
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#e2e2e2] rounded-xl p-3 sm:p-4 flex items-center gap-3 transition-all hover:shadow-sm ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`rounded-lg p-2 shrink-0 ${colors[tone] ?? colors.red}`}>
        <Icon size={17} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-2xl font-bold leading-none mb-0.5">{value.toLocaleString()}</div>
        <p className="text-xs text-[#657083] truncate">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-[#ccc] shrink-0" />
    </div>
  );
}

const CONTROL_TONES: Record<string, string> = {
  "AI active": "teal",
};

export function Pipeline({
  onModal,
  onSelectProspect,
}: {
  onModal: (type: "prospect" | "csv") => void;
  onSelectProspect?: (prospect: any) => void;
}) {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [dealerships, setDealerships] = useState<string[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Overall statistics for hero & stat cards
  const [stats, setStats] = useState({
    total: 0,
    humanAssisted: 0,
    aiQualifying: 0,
    testDrives: 0,
  });

  // Debounce timer for search
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  // Reset page when filters change
  const handleDealerFilterChange = (val: string) => {
    setDealerFilter(val);
    setPage(1);
  };
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };
  const handlePlatformFilterChange = (val: string) => {
    setPlatformFilter(val);
    setPage(1);
  };

  // Load dealerships for dropdown
  useEffect(() => {
    getLeadDealerships()
      .then(setDealerships)
      .catch(() => {});
  }, []);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    setError(null);

    const filterParams: Record<string, string> = {};
    if (debouncedSearch) filterParams.q = debouncedSearch;
    if (dealerFilter) filterParams.dealer = dealerFilter;
    if (statusFilter) filterParams.status = statusFilter;
    if (platformFilter) filterParams.platform = platformFilter;

    // Fetch stats in parallel
    getLeadStats(filterParams)
      .then(setStats)
      .catch(() => {});

    if (viewMode === "list") {
      getPaginatedLeads({
        ...filterParams,
        page,
        limit: pageSize,
      })
        .then((res) => {
          setLeads(res.data);
          setTotalLeads(res.total);
          setTotalPages(res.totalPages);
          if (dealerships.length === 0) {
            const dealers = Array.from(new Set(res.data.map((l) => l.dealer))).filter(Boolean).sort();
            setDealerships(dealers);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      // In board view, load top active leads (up to 150)
      getPaginatedLeads({
        ...filterParams,
        page: 1,
        limit: 150,
      })
        .then((res) => {
          setLeads(res.data);
          setTotalLeads(res.total);
          setTotalPages(res.totalPages);
          if (dealerships.length === 0) {
            const dealers = Array.from(new Set(res.data.map((l) => l.dealer))).filter(Boolean).sort();
            setDealerships(dealers);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [debouncedSearch, dealerFilter, statusFilter, platformFilter, page, pageSize, viewMode]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const hasActiveFilters = !!debouncedSearch || !!dealerFilter || !!statusFilter || !!platformFilter;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setDealerFilter("");
    setStatusFilter("");
    setPlatformFilter("");
    setPage(1);
  };

  const byStage = (stage: string) => leads.filter((l) => l.stage === stage);

  const humanAssisted = leads.filter((l) => l.control?.toLowerCase().includes("human")).length;
  const aiQualifying = leads.filter((l) => l.stage === "AI QUALIFYING").length;
  const testDrives = leads.filter((l) => l.stage === "TEST DRIVE BOOKED").length;

  const mapLeadToProspect = (l: Lead) => ({
    id: l._id,
    firstName: l.name.split(" ")[0] || l.name,
    lastName: l.name.split(" ").slice(1).join(" ") || "",
    phone: l.phone,
    email: l.email,
    dealership: l.dealer,
    vehicle: l.vehicle,
    stockNum: l.stockNum,
    stage: l.stage,
    status: l.control,
    price: l.price,
    color: l.paintColor,
    enquiryDesc: l.enquiryDesc,
    enquiryNote: l.enquiryNote,
    _id: l._id,
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── Hero Banner ── */}
      <div className="bg-gray-900 text-white rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-1">
            CRM Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold m-0 leading-tight">
            Lead journey board
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            {(stats.total || totalLeads).toLocaleString()} active prospects · AI qualification through to dealership commitment
          </p>
        </div>

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
          <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${viewMode === "board"
                ? "bg-[#cf1d29] text-white"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Columns3 size={15} /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${viewMode === "list"
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
        <StatCard
          icon={Users}
          value={stats.total || totalLeads}
          desc="Attachment prospects"
          active={!statusFilter && !search}
        />
        <StatCard
          icon={Bot}
          value={stats.aiQualifying}
          desc="AI qualifying"
          tone="teal"
          active={statusFilter === "qualification"}
        />
        <StatCard
          icon={CalendarDays}
          value={stats.testDrives}
          desc="Commitments"
          tone="teal"
          active={statusFilter === "committed"}
        />
        <StatCard
          icon={Users}
          value={stats.humanAssisted}
          desc="Human assisted"
          tone="amber"
          active={search.toLowerCase() === "human"}
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border border-[#e2e2e2] rounded-xl px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3">

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-0 border border-[#e2e2e2] rounded-lg px-3 py-2">
          <Search size={16} className="text-[#657083] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prospect, vehicle, stock or phone..."
            className="flex-1 min-w-0 text-sm outline-none bg-transparent placeholder:text-[#aaa]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-stretch sm:items-center">

          {/* All Dealerships */}
          <select
            value={dealerFilter}
            onChange={(e) => handleDealerFilterChange(e.target.value)}
            className="w-full sm:w-[190px] text-sm border border-[#e2e2e2] rounded-lg px-3 py-2 bg-white outline-none cursor-pointer focus:border-[#cf1d29]"
          >
            <option value="">All dealerships</option>
            {dealerships.map((dealer) => (
              <option key={dealer} value={dealer}>
                {dealer}
              </option>
            ))}
          </select>

          {/* Platform */}
          <select
            value={platformFilter}
            onChange={(e) => handlePlatformFilterChange(e.target.value)}
            className="w-full sm:w-[160px] text-sm border border-[#e2e2e2] rounded-lg px-3 py-2 bg-white outline-none cursor-pointer focus:border-[#cf1d29]"
          >
            <option value="">All platforms</option>
            <option value="virtualyard">Virtual Yard</option>
            <option value="autogate">Autogate</option>
            <option value="manual">Manual</option>
          </select>

          {/* All Statuses */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full sm:w-[180px] text-sm border border-[#e2e2e2] rounded-lg px-3 py-2 bg-white outline-none cursor-pointer focus:border-[#cf1d29]"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#cf1d29] hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <XCircle size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-[#657083]">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading leads...
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-500 text-sm">
          Failed to load leads: {error}
          <button
            onClick={fetchLeads}
            className="ml-3 text-sm underline text-[#cf1d29] hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Board View ── */}
      {!loading && !error && viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              ["NEW ENQUIRIES", "Awaiting first contact"],
              ["AI QUALIFYING", "Conversation in progress"],
              ["TEST DRIVE BOOKED", "Commitment confirmed"],
            ] as const
          ).map(([name, sub]) => {
            const stageLeads = byStage(name);
            return (
              <div
                key={name}
                className="bg-white border border-[#e2e2e2] rounded-xl p-4 max-h-[560px] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#e2e2e2]">
                  <div>
                    <b className="block text-sm font-bold">{name}</b>
                    <small className="block text-xs text-[#657083] mt-0.5">{sub}</small>
                  </div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {stageLeads.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Network size={20} className="mx-auto mb-2 opacity-30" />
                    <b className="block text-sm">No prospects in this stage</b>
                    <small className="text-xs">The board updates as replies are processed.</small>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {stageLeads.map((l) => (
                      <Prospect
                        key={l._id}
                        lead={l}
                        onClick={() => onSelectProspect?.(mapLeadToProspect(l))}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── List View ── */}
      {!loading && !error && viewMode === "list" && (
        <div className="bg-white border border-[#e2e2e2] rounded-xl overflow-hidden">
          {leads.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Network size={24} className="mx-auto mb-3 opacity-30" />
              <b className="block text-sm mb-1">No prospects found</b>
              <small className="text-xs">Try adjusting your search or filters.</small>
            </div>
          ) : (
            <>
              {/* Mobile card layout */}
              <div className="sm:hidden divide-y divide-[#e2e2e2]">
                {leads.map((l) => (
                  <div
                    key={l._id}
                    className="p-4 flex flex-col gap-2 hover:bg-[#f9f9f9] cursor-pointer transition-colors"
                    onClick={() => onSelectProspect?.(mapLeadToProspect(l))}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <b className="block text-sm font-semibold">{l.name}</b>
                        <small className="text-xs text-[#657083]">{l.phone}</small>
                      </div>
                      <span className="text-lg font-bold text-[#cf1d29]">{l.score}</span>
                    </div>
                    <div>
                      <b className="block text-sm">{l.vehicle}</b>
                      <small className="text-xs text-[#657083]">Stock #{l.stockNum}</small>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Pill tone={l.tag === "Commitment" ? "purple" : "amber"}>{l.tag}</Pill>
                      <Pill tone={CONTROL_TONES[l.control] ?? "amber"}>{l.control}</Pill>
                      {l.platform === "virtualyard" && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#d1fae5", color: "#065f46", letterSpacing: "0.05em" }}>VIRTUAL YARD</span>
                      )}
                      {l.platform === "autogate" && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#dbeafe", color: "#1d4ed8", letterSpacing: "0.05em" }}>AUTOGATE</span>
                      )}
                      <span className="text-xs text-[#657083] ml-auto">{l.receivedDaysAgo}d ago</span>
                    </div>
                    <small className="text-xs text-[#657083]">{l.source} · {l.dealer}</small>
                  </div>
                ))}
              </div>

              {/* Desktop table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f9f9f9]">
                      {["Prospect", "Vehicle enquiry", "Source", "Dealership", "Status", "Control", "Score", "Received"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#657083] border-b border-[#e2e2e2]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr
                        key={l._id}
                        onClick={() => onSelectProspect?.(mapLeadToProspect(l))}
                        className="hover:bg-[#f9f9f9] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 border-b border-[#e2e2e2]">
                          <b className="block text-sm font-semibold">{l.name}</b>
                          <small className="text-xs text-[#657083]">{l.phone}</small>
                        </td>
                        <td className="px-4 py-3 border-b border-[#e2e2e2]">
                          <b className="block text-sm">{l.vehicle}</b>
                          <small className="text-xs text-[#657083]">Stock #{l.stockNum}</small>
                        </td>
                        <td className="px-4 py-3 border-b border-[#e2e2e2]">
                          <small className="text-xs text-[#657083]">{l.source}</small>
                        </td>
                        <td className="px-4 py-3 border-b border-[#e2e2e2]">
                          <small className="text-xs text-[#657083]">{l.dealer}</small>
                        </td>
                        <td className="px-4 py-3 border-b border-[#e2e2e2]">
                          <Pill tone={l.tag === "Commitment" ? "purple" : "amber"}>{l.tag}</Pill>
                        </td>
                        <td className="px-4 py-3 border-b border-[#e2e2e2]">
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <Pill tone={CONTROL_TONES[l.control] ?? "amber"}>{l.control}</Pill>
                            {l.platform === "virtualyard" && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#d1fae5", color: "#065f46", letterSpacing: "0.05em", width: "fit-content" }}>VIRTUAL YARD</span>
                            )}
                            {l.platform === "autogate" && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#dbeafe", color: "#1d4ed8", letterSpacing: "0.05em", width: "fit-content" }}>AUTOGATE</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-[#e2e2e2] text-right">
                          <b className="text-sm font-bold">{l.score}</b>
                        </td>
                        <td className="px-4 py-3 border-b border-[#e2e2e2] text-right">
                          <small className="text-xs text-[#657083]">{l.receivedDaysAgo}d ago</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-2 bg-white">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalLeads}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  itemLabel="prospects"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
