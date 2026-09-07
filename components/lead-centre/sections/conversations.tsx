"use client";

import { MessageSquare, Bot, Activity, Search, Loader2 } from "lucide-react";
import { Pill } from "../shared";
import { Pagination } from "../pagination";
import { getConversations, getLeads, type Conversation } from "@/lib/api";
import { mapLeadToProspect, createProspectFromMetadata } from "@/lib/prospect-mapper";
import { useState, useEffect } from "react";

type Filter = "all" | "ai" | "human";

export function Conversations({
  onSelectProspect,
}: {
  onSelectProspect?: (prospect: any) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filter !== "all") params.control = filter;
    if (search) params.q = search;
    getConversations(params)
      .then((data) => {
        setConversations(data);
        setPage(1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter, search]);

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

        <div className="flex rounded-lg overflow-hidden border border-[#e2e2e2] self-start shrink-0">
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search conversations..."
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
            <div className="text-center py-16 text-[#657083] text-sm">No conversations found.</div>
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
    </div>
  );
}
