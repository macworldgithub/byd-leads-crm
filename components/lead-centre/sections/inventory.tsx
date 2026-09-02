"use client";

import { RefreshCw, Search, Loader2 } from "lucide-react";
import { Card, Button, Pill, PageHeader } from "../shared";
import { getInventory, type InventoryItem } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const fetchInventory = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (modelFilter) params.model = modelFilter;
    if (statusFilter) params.status = statusFilter;
    if (locationFilter) params.location = locationFilter;
    getInventory(params)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, modelFilter, statusFilter, locationFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Derive filter options from data
  const availableCount = items.filter((i) => i.status === "Available").length;

  return (
    <>
      <PageHeader
        title="Inventory Monitor"
        subtitle={`${availableCount} available of ${items.length} tracked · source: bydmelbourne.com.au`}
        action={
          <Button primary onClick={fetchInventory}>
            <RefreshCw size={16} /> Sync Now
          </Button>
        }
      />
      <div className="toolbar filters">
        <Search size={17} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stock #, model, colour..."
        />
        <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
          <option value="">All models</option>
          <option>ATTO 1</option>
          <option>ATTO 2</option>
          <option>ATTO 3</option>
          <option>DOLPHINE</option>
          <option>SEAL</option>
          <option>SEAL 6</option>
          <option>SEALION 5</option>
          <option>SEALION 6</option>
          <option>SEALION 7</option>
          <option>SEALION 8</option>
          <option>SHARK 6</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>Available</option>
          <option>In Transit</option>
          <option>Sold</option>
          <option>Unavailable</option>
        </select>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All pickup locations</option>
          <option>BYD Box Hill</option>
          <option>BYD Campbelltown</option>
          <option>BYD Caroline Springs</option>
          <option>BYD Castle Hill</option>
          <option>BYD Fairfield</option>
          <option>BYD Fairfield VIC</option>
          <option>BYD Haberfield</option>
          <option>BYD Homebush</option>
          <option>BYD Melbourne City</option>
          <option>BYD Nowra</option>
          <option>BYD Rockdale</option>
          <option>BYD Wagga Wagga</option>
          <option>BYD Windsor</option>
          <option>BYD Wodonga</option>
          <option>BYD Wollongong</option>
          <option>NSW VPC</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-[#657083]">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading inventory...
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-500 text-sm">Failed to load inventory: {error}</div>
      )}

      {!loading && !error && (
        <Card className="table-wrap">
          <table>
            <thead>
              <tr>
                {["Stock #", "Vehicle", "Paint", "Pickup Location", "Status", "Drive Away", "Last Seen"].map(
                  (h) => <th key={h}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#657083] text-sm">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r._id}>
                    <td>{r.stock}</td>
                    <td>
                      <b>{r.model}</b>
                      <small>—</small>
                    </td>
                    <td>{r.paint}</td>
                    <td>{r.location}</td>
                    <td>
                      <Pill tone={r.status === "Available" ? "green" : "blue"}>{r.status}</Pill>
                    </td>
                    <td>
                      <b>{r.price}</b>
                    </td>
                    <td>
                      {r.lastSeen
                        ? `${Math.floor((Date.now() - new Date(r.lastSeen).getTime()) / 86400000)}d ago`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
