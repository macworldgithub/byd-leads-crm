"use client";

import {
  RefreshCw,
  Search,
  Loader2,
  Eye,
  Heart,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, Button, Pill, PageHeader } from "../shared";
import { getInventory, type InventoryItem } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function healthColor(score: number): string {
  if (score >= 75) return "#16a34a"; // green
  if (score >= 60) return "#d97706"; // amber
  return "#dc2626"; // red
}

function healthLabel(score: number): string {
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Poor";
}

function formatPrice(item: InventoryItem): string {
  if (item.priceData?.ui) {
    return `$${item.priceData.ui.toLocaleString()} ${item.priceData.label || ""}`.trim();
  }
  return item.price || "—";
}

function formatOdometer(item: InventoryItem): string {
  if (item.odometer?.value !== undefined) {
    return item.odometer.value === 0 ? "New" : `${item.odometer.value.toLocaleString()} km`;
  }
  return "—";
}

function getVehicleTitle(item: InventoryItem): string {
  if (item.title) return item.title;
  const { specifications: s } = item;
  if (!s) return item.model || "Unknown Vehicle";
  return [s.year, s.make, s.model, s.badge].filter(Boolean).join(" ") || item.model || "Unknown Vehicle";
}

function getColour(item: InventoryItem): string {
  return (
    item.specifications?.colour ||
    item.specifications?.manufacturerColour ||
    item.paint ||
    "—"
  );
}

function PlatformBadge({ platform }: { platform?: string }) {
  if (platform === "autogate") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          padding: "2px 7px",
          borderRadius: 4,
          textTransform: "uppercase",
        }}
      >
        AUTOGATE
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "2px 7px",
        borderRadius: 4,
        background: "#f3f4f6",
        color: "#6b7280",
        textTransform: "uppercase",
      }}
    >
      MANUAL
    </span>
  );
}

function HealthBar({ score }: { score: number }) {
  const color = healthColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 44,
          height: 6,
          borderRadius: 3,
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{score}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [networkFilter, setNetworkFilter] = useState("");

  const fetchInventory = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (modelFilter) params.model = modelFilter;
    if (conditionFilter) params.condition = conditionFilter;
    if (platformFilter) params.platform = platformFilter;
    getInventory(params)
      .then((data) => {
        let filtered = data;
        // Client-side network filter (not a backend param)
        if (networkFilter === "published") filtered = filtered.filter((i) => i.onCarsalesNetwork === true);
        if (networkFilter === "unpublished") filtered = filtered.filter((i) => i.onCarsalesNetwork === false);
        setItems(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, modelFilter, conditionFilter, platformFilter, networkFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const autogateCount = items.filter((i) => i.platform === "autogate").length;
  const availableCount = items.filter((i) => i.status === "Available" || i.itemStatus === "InStock").length;

  return (
    <>
      <PageHeader
        title="Inventory Monitor"
        subtitle={`${availableCount} in stock · ${autogateCount} from Autogate · ${items.length} total`}
        action={
          <Button primary onClick={fetchInventory}>
            <RefreshCw size={16} /> Sync Now
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="toolbar filters" style={{ flexWrap: "wrap", gap: 8 }}>
        <Search size={17} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stock #, model, VIN, colour, rego..."
          style={{ flex: 1, minWidth: 180 }}
        />
        <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
          <option value="">All models</option>
          <option>ATTO 1</option>
          <option>ATTO 2</option>
          <option>ATTO 3</option>
          <option>DOLPHIN</option>
          <option>SEAL</option>
          <option>SEALION 5</option>
          <option>SEALION 6</option>
          <option>SEALION 7</option>
          <option>SEALION 8</option>
          <option>SHARK 6</option>
        </select>
        <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
          <option value="">All conditions</option>
          <option>Demo</option>
          <option>Used</option>
          <option>New</option>
        </select>
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="">All platforms</option>
          <option value="autogate">Autogate</option>
          <option value="manual">Manual</option>
        </select>
        <select value={networkFilter} onChange={(e) => setNetworkFilter(e.target.value)}>
          <option value="">Carsales: All</option>
          <option value="published">Published</option>
          <option value="unpublished">Not Published</option>
        </select>
      </div>

      {/* Summary chips */}
      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 2 }}>
          {[
            { label: "Total", value: items.length, icon: Activity, color: "#6366f1" },
            {
              label: "In Stock",
              value: availableCount,
              icon: CheckCircle2,
              color: "#16a34a",
            },
            { label: "Autogate", value: autogateCount, icon: TrendingUp, color: "#2563eb" },
            {
              label: "Enquiries",
              value: items.reduce((a, i) => a + (i.listingStats?.enquiryCount ?? 0), 0),
              icon: Eye,
              color: "#d97706",
            },
            {
              label: "Watchers",
              value: items.reduce((a, i) => a + (i.listingStats?.watchers ?? 0), 0),
              icon: Heart,
              color: "#ec4899",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Icon size={13} style={{ color }} />
              <span style={{ color: "#374151" }}>{label}</span>
              <span style={{ color, fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40 text-[#657083]">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading inventory...
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-500 text-sm">
          Failed to load inventory: {error}
        </div>
      )}

      {!loading && !error && (
        <Card className="table-wrap" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 56 }}>Photo</th>
                <th>Vehicle</th>
                <th>Stock #</th>
                <th>Condition</th>
                <th>Colour</th>
                <th>Odometer</th>
                <th>Price</th>
                <th>Health</th>
                <th>Days on Mkt</th>
                <th>Enquiries</th>
                <th>Carsales</th>
                <th>Platform</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-[#657083] text-sm">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const vehicleTitle = getVehicleTitle(r);
                  const colour = getColour(r);
                  const price = formatPrice(r);
                  const odo = formatOdometer(r);
                  const health = r.listingStats?.healthScore ?? 0;
                  const dom = r.lmStats?.daysOnMarket ?? 0;
                  const enquiries = r.listingStats?.enquiryCount ?? 0;
                  const watchers = r.listingStats?.watchers ?? 0;
                  const stockDisplay = r.stock || r.identifier?.slice(0, 8) || "—";
                  const condition = r.condition || "";

                  return (
                    <tr key={r._id} style={{ cursor: "default" }}>
                      {/* Photo */}
                      <td style={{ padding: "6px 8px" }}>
                        {r.firstPhotoUrl ? (
                          <img
                            src={r.firstPhotoUrl}
                            alt={vehicleTitle}
                            style={{
                              width: 48,
                              height: 36,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              display: "block",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 36,
                              borderRadius: 6,
                              background: "#f3f4f6",
                              border: "1px solid #e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              color: "#9ca3af",
                              textAlign: "center",
                              lineHeight: 1.2,
                            }}
                          >
                            No photo
                          </div>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td style={{ maxWidth: 280 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#111827",
                            lineHeight: 1.3,
                            whiteSpace: "normal",
                          }}
                        >
                          {vehicleTitle}
                        </div>
                        {r.registration?.rego && (
                          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
                            Rego: {r.registration.rego}
                          </div>
                        )}
                        {r.registration?.vin && (
                          <div style={{ fontSize: 10, color: "#9ca3af" }}>
                            VIN: {r.registration.vin}
                          </div>
                        )}
                      </td>

                      {/* Stock # */}
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#374151",
                          }}
                        >
                          {stockDisplay}
                        </span>
                      </td>

                      {/* Condition */}
                      <td>
                        {condition ? (
                          <Pill
                            tone={
                              condition === "Demo"
                                ? "amber"
                                : condition === "Used"
                                ? "blue"
                                : "teal"
                            }
                          >
                            {condition}
                          </Pill>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
                        )}
                      </td>

                      {/* Colour */}
                      <td>
                        <span style={{ fontSize: 12, color: "#374151" }}>{colour}</span>
                      </td>

                      {/* Odometer */}
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{odo}</span>
                      </td>

                      {/* Price */}
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                          {price}
                        </span>
                      </td>

                      {/* Health Score */}
                      <td>
                        <HealthBar score={health} />
                      </td>

                      {/* Days on Market */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} style={{ color: "#9ca3af" }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: dom > 60 ? "#dc2626" : "#374151" }}>
                            {dom}d
                          </span>
                        </div>
                        {r.lmStats?.averageDaysOnMarket ? (
                          <div style={{ fontSize: 10, color: "#9ca3af" }}>
                            avg {r.lmStats.averageDaysOnMarket}d
                          </div>
                        ) : null}
                      </td>

                      {/* Enquiries + Watchers */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                            <Eye size={10} style={{ display: "inline", marginRight: 2, color: "#9ca3af" }} />
                            {enquiries}
                          </span>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>·</span>
                          <span style={{ fontSize: 12, color: "#ec4899" }}>
                            <Heart size={10} style={{ display: "inline", marginRight: 2 }} />
                            {watchers}
                          </span>
                        </div>
                      </td>

                      {/* Carsales Network */}
                      <td>
                        {r.onCarsalesNetwork === true ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
                            <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                              Live
                            </span>
                          </div>
                        ) : r.onCarsalesNetwork === false ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <XCircle size={14} style={{ color: "#9ca3af" }} />
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>Not listed</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>—</span>
                        )}
                      </td>

                      {/* Platform */}
                      <td>
                        <PlatformBadge platform={r.platform} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
