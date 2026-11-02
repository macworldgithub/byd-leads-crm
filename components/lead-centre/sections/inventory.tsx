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
  MapPin,
  Sparkles,
  Info,
  X,
  Calendar,
  User,
  FileText,
  DollarSign,
  Truck,
  ShieldAlert,
} from "lucide-react";
import { Card, Button, Pill, PageHeader } from "../shared";
import { Pagination } from "../pagination";
import { getInventory, type InventoryItem } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function healthColor(score: number): string {
  if (score >= 75) return "#16a34a"; // green
  if (score >= 60) return "#d97706"; // amber
  return "#dc2626"; // red
}

function formatPrice(item: InventoryItem): string {
  if (item.priceData?.ui) {
    return `$${item.priceData.ui.toLocaleString()} ${item.priceData.label || ""}`.trim();
  }
  return item.price || "—";
}

function formatOdometer(item: InventoryItem): string {
  if (item.odometer?.value !== undefined && item.odometer?.value !== null) {
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
  if (platform === "shirley") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          padding: "2px 7px",
          borderRadius: 4,
          textTransform: "uppercase",
        }}
      >
        <Sparkles size={10} /> SHIRLEY
      </span>
    );
  }
  if (platform === "virtualyard") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          padding: "2px 7px",
          borderRadius: 4,
          textTransform: "uppercase",
        }}
      >
        VIRTUAL YARD
      </span>
    );
  }
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
  if (platform === "dealer_studio") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          padding: "2px 7px",
          borderRadius: 4,
          textTransform: "uppercase",
        }}
      >
        DEALER STUDIO
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

function StatusBadge({ status }: { status?: string }) {
  const s = status || "Available";
  const lower = s.toLowerCase();
  let bg = "#f3f4f6";
  let color = "#374151";
  let border = "#e5e7eb";

  if (lower === "in stock" || lower === "available" || lower === "instock") {
    bg = "#ecfdf5";
    color = "#047857";
    border = "#a7f3d0";
  } else if (lower === "delivered") {
    bg = "#eff6ff";
    color = "#1d4ed8";
    border = "#bfdbfe";
  } else if (lower === "in transit") {
    bg = "#fffbeb";
    color = "#b45309";
    border = "#fde68a";
  } else if (lower === "demo") {
    bg = "#faf5ff";
    color = "#7e22ce";
    border = "#e9d5ff";
  } else if (lower === "damage" || lower === "damaged") {
    bg = "#fef2f2";
    color = "#b91c1c";
    border = "#fecaca";
  } else if (lower === "sold") {
    bg = "#f1f5f9";
    color = "#475569";
    border = "#cbd5e1";
  } else if (lower === "on hold" || lower === "on-hold" || lower === "held") {
    bg = "#fff7ed";
    color = "#c2410c";
    border = "#fed7aa";
  } else if (lower === "display" || lower === "allocated") {
    bg = "#f0fdfa";
    color = "#0f766e";
    border = "#99f6e4";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 600,
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: "nowrap",
      }}
    >
      {s}
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

export function Inventory({
  locationFilter = "",
  onLocationChange,
}: {
  locationFilter?: string;
  onLocationChange?: (loc: string) => void;
} = {}) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yardFilter, setYardFilter] = useState(locationFilter || "");
  const [conditionFilter, setConditionFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [networkFilter, setNetworkFilter] = useState("");

  // Vehicle Details Modal
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryItem | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Synchronize yardFilter when locationFilter prop changes from parent
  useEffect(() => {
    if (locationFilter) {
      setYardFilter(locationFilter);
    }
  }, [locationFilter]);

  const fetchInventory = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (modelFilter) params.model = modelFilter;
    if (statusFilter) params.status = statusFilter;
    const effectiveYard = yardFilter || locationFilter;
    if (effectiveYard && effectiveYard !== "All Locations" && effectiveYard !== "All Yards") {
      params.location = effectiveYard;
    }
    if (conditionFilter) params.condition = conditionFilter;
    if (platformFilter) params.platform = platformFilter;

    getInventory(params)
      .then((data) => {
        let filtered = data;
        // Client-side network filter (not a backend param)
        if (networkFilter === "published") filtered = filtered.filter((i: InventoryItem) => i.onCarsalesNetwork === true);
        if (networkFilter === "unpublished") filtered = filtered.filter((i: InventoryItem) => i.onCarsalesNetwork === false);
        setItems(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, modelFilter, statusFilter, yardFilter, locationFilter, conditionFilter, platformFilter, networkFilter]);

  useEffect(() => {
    setPage(1);
    fetchInventory();
  }, [fetchInventory]);

  // Aggregate Counts for Summary Chips
  const autogateCount = items.filter((i) => i.platform === "autogate").length;
  const virtualyardCount = items.filter((i) => i.platform === "virtualyard").length;
  const shirleyCount = items.filter((i) => i.platform === "shirley").length;
  const inStockCount = items.filter((i) => i.status === "In Stock" || i.status === "Available" || i.itemStatus === "InStock").length;
  const deliveredCount = items.filter((i) => i.status === "Delivered").length;
  const inTransitCount = items.filter((i) => i.status === "In Transit").length;
  const demoCount = items.filter((i) => i.status === "Demo" || i.condition === "Demo").length;

  const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(items.length / pageSize) || 1;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleModelChange = (val: string) => {
    setModelFilter(val);
    setPage(1);
  };
  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };
  const handleYardChange = (val: string) => {
    setYardFilter(val);
    setPage(1);
    if (onLocationChange) {
      onLocationChange(val || "All Locations");
    }
  };
  const handleConditionChange = (val: string) => {
    setConditionFilter(val);
    setPage(1);
  };
  const handlePlatformChange = (val: string) => {
    setPlatformFilter(val);
    setPage(1);
  };
  const handleNetworkChange = (val: string) => {
    setNetworkFilter(val);
    setPage(1);
  };

  const handleClearYard = () => {
    setYardFilter("");
    if (onLocationChange) onLocationChange("All Locations");
  };

  const activeYardDisplay = yardFilter || locationFilter;

  return (
    <>
      <PageHeader
        title="Inventory Monitor"
        subtitle={`${inStockCount} in stock · ${shirleyCount} Shirley Inventory · ${virtualyardCount} Virtual Yard · ${autogateCount} Autogate · ${items.length} total vehicles`}
        action={
          <Button primary onClick={fetchInventory}>
            <RefreshCw size={16} /> Sync Now
          </Button>
        }
      />

      {/* Active Yard / Location Banner */}
      {activeYardDisplay && activeYardDisplay !== "All Locations" && activeYardDisplay !== "All Yards" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 12,
            color: "#1e40af",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={14} style={{ color: "#2563eb" }} />
            <span>
              Showing Inventory vehicles located at: <strong>{activeYardDisplay}</strong>
            </span>
          </div>
          <button
            onClick={handleClearYard}
            style={{
              background: "none",
              border: "none",
              color: "#1d4ed8",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear Yard Filter
          </button>
        </div>
      )}

      {/* Toolbar / Filters */}
      <div className="toolbar filters" style={{ flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <Search size={17} />
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search stock #, model, VIN, rego, colour, consultant, PO..."
          style={{ flex: 1, minWidth: 180 }}
        />

        {/* Yard / Location Filter */}
        <select value={yardFilter} onChange={(e) => handleYardChange(e.target.value)}>
          <option value="">All Yards & Locations</option>
          <option value="Warehouse">Warehouse (Main Holding)</option>
          <option value="Clayton">Clayton Storage</option>
          <option value="BYD Caroline Springs">BYD Caroline Springs</option>
          <option value="BYD Fairfield">BYD Fairfield</option>
          <option value="BYD Nunawading">BYD Nunawading</option>
          <option value="BYD Melbourne City">BYD Melbourne City</option>
          <option value="Holding Yard VIC">Holding Yard VIC</option>
          <option value="BYD Wodonga">BYD Wodonga</option>
          <option value="BYD Doncaster">BYD Doncaster</option>
          <option value="VELO">VELO Delivery</option>
          <option value="DENZA Kew">DENZA Kew</option>
          <option value="DENZA Kingsway">DENZA Kingsway</option>
          <option value="In Transit">In Transit</option>
        </select>

        {/* Model Filter */}
        <select value={modelFilter} onChange={(e) => handleModelChange(e.target.value)}>
          <option value="">All models</option>
          <option value="ATTO 1">ATTO 1</option>
          <option value="ATTO 2">ATTO 2</option>
          <option value="ATTO 3">ATTO 3</option>
          <option value="DOLPHIN">DOLPHIN</option>
          <option value="SEAL">SEAL</option>
          <option value="SEAL 6">SEAL 6</option>
          <option value="SEALION 5">SEALION 5</option>
          <option value="SEALION 6">SEALION 6</option>
          <option value="SEALION 7">SEALION 7</option>
          <option value="SEALION 8">SEALION 8</option>
          <option value="SHARK 6">SHARK 6</option>
        </select>

        {/* Status Filter */}
        <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}>
          <option value="">All statuses</option>
          <option value="In Stock">In Stock / Available</option>
          <option value="Delivered">Delivered</option>
          <option value="In Transit">In Transit</option>
          <option value="Demo">Demo</option>
          <option value="Sold">Sold</option>
          <option value="Display">Display</option>
          <option value="On Hold">On Hold</option>
          <option value="Damage">Damage</option>
          <option value="Allocated">Allocated</option>
        </select>

        {/* Platform Filter */}
        <select value={platformFilter} onChange={(e) => handlePlatformChange(e.target.value)}>
          <option value="">All platforms</option>
          <option value="shirley">Shirley Inventory</option>
          <option value="virtualyard">Virtual Yard</option>
          <option value="autogate">Autogate</option>
          <option value="dealer_studio">Dealer Studio</option>
          <option value="manual">Manual</option>
        </select>

        {/* Condition Filter */}
        <select value={conditionFilter} onChange={(e) => handleConditionChange(e.target.value)}>
          <option value="">All conditions</option>
          <option value="New">New</option>
          <option value="Demo">Demo</option>
          <option value="Used">Used</option>
        </select>

        {/* Carsales Network Filter */}
        <select value={networkFilter} onChange={(e) => handleNetworkChange(e.target.value)}>
          <option value="">Carsales: All</option>
          <option value="published">Published</option>
          <option value="unpublished">Not Published</option>
        </select>
      </div>

      {/* Summary chips */}
      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { label: "Total", value: items.length, icon: Activity, color: "#6366f1" },
            { label: "In Stock", value: inStockCount, icon: CheckCircle2, color: "#16a34a" },
            { label: "Delivered", value: deliveredCount, icon: Truck, color: "#2563eb" },
            { label: "In Transit", value: inTransitCount, icon: Clock, color: "#d97706" },
            { label: "Demo", value: demoCount, icon: Sparkles, color: "#9333ea" },
            { label: "Shirley", value: shirleyCount, icon: Sparkles, color: "#7c3aed" },
            { label: "Virtual Yard", value: virtualyardCount, icon: TrendingUp, color: "#059669" },
            { label: "Autogate", value: autogateCount, icon: TrendingUp, color: "#0284c7" },
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
                <th style={{ width: 48 }}>Photo</th>
                <th>Vehicle & Identifiers</th>
                <th>Stock #</th>
                <th>Status</th>
                <th>Yard / Location</th>
                <th>Condition</th>
                <th>Colour</th>
                <th>Odometer</th>
                <th>Price</th>
                <th>Payment / Due</th>
                <th>Health</th>
                <th>Days in Inv.</th>
                <th>Carsales</th>
                <th>Platform</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-10 text-[#657083] text-sm">
                    No inventory vehicles matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((r) => {
                  const vehicleTitle = getVehicleTitle(r);
                  const colour = getColour(r);
                  const price = formatPrice(r);
                  const odo = formatOdometer(r);
                  const health = r.listingStats?.healthScore ?? 75;
                  const dom = r.shirleyData?.daysOfInventory || r.lmStats?.daysOnMarket || 0;
                  const stockDisplay = r.stock || r.identifier?.slice(0, 8) || "—";
                  const condition = r.condition || (r.status === "Demo" ? "Demo" : "New");
                  const locationDisplay = r.location || "Warehouse";
                  const orderYard = r.orderYard || "";
                  const dueDate = r.shirleyData?.paymentTermDue || r.shirleyData?.dueDate || "";

                  return (
                    <tr
                      key={r._id}
                      style={{ cursor: "pointer", transition: "background 0.15s ease" }}
                      onClick={() => setSelectedVehicle(r)}
                      className="hover:bg-gray-50"
                    >
                      {/* Photo */}
                      <td style={{ padding: "6px 8px" }}>
                        {r.firstPhotoUrl ? (
                          <img
                            src={r.firstPhotoUrl}
                            alt={vehicleTitle}
                            style={{
                              width: 44,
                              height: 32,
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
                              width: 44,
                              height: 32,
                              borderRadius: 6,
                              background: "#f3f4f6",
                              border: "1px solid #e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              color: "#9ca3af",
                            }}
                          >
                            BYD
                          </div>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td style={{ maxWidth: 260 }}>
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
                        <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
                          {r.registration?.vin && (
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: 10,
                                color: "#4b5563",
                                background: "#f3f4f6",
                                padding: "1px 4px",
                                borderRadius: 3,
                              }}
                            >
                              VIN: {r.registration.vin}
                            </span>
                          )}
                          {r.registration?.rego && (
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: 10,
                                color: "#1e40af",
                                background: "#eff6ff",
                                padding: "1px 4px",
                                borderRadius: 3,
                                fontWeight: 600,
                              }}
                            >
                              {r.registration.rego}
                            </span>
                          )}
                        </div>
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

                      {/* Status */}
                      <td>
                        <StatusBadge status={r.status} />
                      </td>

                      {/* Yard / Location */}
                      <td style={{ maxWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin size={12} style={{ color: "#2563eb", flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", whiteSpace: "normal" }}>
                            {locationDisplay}
                          </span>
                        </div>
                        {orderYard && orderYard !== locationDisplay && (
                          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2, marginLeft: 17 }}>
                            Yard: {orderYard}
                          </div>
                        )}
                      </td>

                      {/* Condition */}
                      <td>
                        {condition ? (
                          <Pill
                            tone={
                              condition === "Demo"
                                ? "purple"
                                : condition === "Used"
                                ? "blue"
                                : "green"
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

                      {/* Payment / Due Date */}
                      <td>
                        {dueDate ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={11} style={{ color: "#d97706" }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>
                              {dueDate}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
                        )}
                      </td>

                      {/* Health */}
                      <td>
                        <HealthBar score={health} />
                      </td>

                      {/* Days in Inventory */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} style={{ color: "#9ca3af" }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: dom > 60 ? "#dc2626" : "#374151" }}>
                            {dom}d
                          </span>
                        </div>
                      </td>

                      {/* Carsales Network */}
                      <td>
                        {r.onCarsalesNetwork === true ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={13} style={{ color: "#16a34a" }} />
                            <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Live</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>—</span>
                        )}
                      </td>

                      {/* Platform */}
                      <td>
                        <PlatformBadge platform={r.platform} />
                      </td>

                      {/* Action Icon */}
                      <td>
                        <button
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#6b7280",
                            cursor: "pointer",
                            padding: 4,
                            borderRadius: 4,
                          }}
                          title="View Vehicle Details"
                        >
                          <Info size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div style={{ padding: "10px 16px" }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={items.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="vehicles"
            />
          </div>
        </Card>
      )}

      {/* ── Vehicle Details Modal ── */}
      {selectedVehicle && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setSelectedVehicle(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              maxWidth: 640,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusBadge status={selectedVehicle.status} />
                  <PlatformBadge platform={selectedVehicle.platform} />
                  {selectedVehicle.condition && <Pill tone="blue">{selectedVehicle.condition}</Pill>}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "8px 0 2px" }}>
                  {getVehicleTitle(selectedVehicle)}
                </h2>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6b7280" }}>
                  <span>Stock #: <strong>{selectedVehicle.stock || "—"}</strong></span>
                  {selectedVehicle.registration?.rego && <span>Rego: <strong>{selectedVehicle.registration.rego}</strong></span>}
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "18px 0", fontSize: 13 }}>
              {/* VIN */}
              <div style={{ gridColumn: "span 2", background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>VIN NUMBER</span>
                <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  {selectedVehicle.registration?.vin || "—"}
                </span>
              </div>

              {/* Location & Yard */}
              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>CURRENT LOCATION</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <MapPin size={14} style={{ color: "#2563eb" }} />
                  <strong style={{ color: "#1e293b" }}>{selectedVehicle.location || "Warehouse"}</strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>ALLOCATED YARD / SITE</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <strong style={{ color: "#1e293b" }}>{selectedVehicle.orderYard || "—"}</strong>
                </div>
              </div>

              {/* Colour & Odometer */}
              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>EXTERIOR COLOUR</span>
                <span style={{ fontWeight: 600, color: "#334155" }}>{getColour(selectedVehicle)}</span>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>ODOMETER</span>
                <span style={{ fontWeight: 600, color: "#334155" }}>{formatOdometer(selectedVehicle)}</span>
              </div>

              {/* Pricing & Terms */}
              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>PRICE</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{formatPrice(selectedVehicle)}</span>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>PAYMENT TERM DUE / DUE DATE</span>
                <span style={{ fontWeight: 700, color: "#b45309" }}>
                  {selectedVehicle.shirleyData?.paymentTermDue || selectedVehicle.shirleyData?.dueDate || "—"}
                </span>
              </div>

              {/* In Stock Date & Days of Inventory */}
              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>IN STOCK DATE</span>
                <span>{selectedVehicle.shirleyData?.inStockDate || "—"}</span>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>DAYS IN INVENTORY</span>
                <span style={{ fontWeight: 700, color: (selectedVehicle.shirleyData?.daysOfInventory || 0) > 60 ? "#dc2626" : "#334155" }}>
                  {selectedVehicle.shirleyData?.daysOfInventory ? `${selectedVehicle.shirleyData.daysOfInventory} days` : "—"}
                </span>
              </div>

              {/* Delivery info */}
              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>DELIVERY DATE</span>
                <span>{selectedVehicle.shirleyData?.deliveryDate || "—"}</span>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>DELIVERED FLAG</span>
                <span>{selectedVehicle.shirleyData?.delivered ? `Yes (${selectedVehicle.shirleyData.delivered})` : "No"}</span>
              </div>

              {/* Sales Consultant & Allocation */}
              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>SALES CONSULTANT</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <User size={13} style={{ color: "#64748b" }} />
                  <span style={{ fontWeight: 600 }}>{selectedVehicle.shirleyData?.salesConsultant || "—"}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>ALLOCATION DATE</span>
                <span>{selectedVehicle.shirleyData?.allocationDate || "—"}</span>
              </div>

              {/* Inbound & PO */}
              {selectedVehicle.shirleyData?.poNumber && (
                <div>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>PO NUMBER</span>
                  <span style={{ fontFamily: "monospace" }}>{selectedVehicle.shirleyData.poNumber}</span>
                </div>
              )}

              {selectedVehicle.shirleyData?.inBoundDate && (
                <div>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>INBOUND DATE</span>
                  <span>{selectedVehicle.shirleyData.inBoundDate}</span>
                </div>
              )}

              {selectedVehicle.shirleyData?.outBoundStore && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block" }}>DESTINATION STORE</span>
                  <span>{selectedVehicle.shirleyData.outBoundStore}</span>
                </div>
              )}

              {/* Sources */}
              {selectedVehicle.shirleyData?.sources && selectedVehicle.shirleyData.sources.length > 0 && (
                <div style={{ gridColumn: "span 2", paddingTop: 8, borderTop: "1px dashed #e2e8f0" }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>
                    MATCHED INVENTORY SHEETS
                  </span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedVehicle.shirleyData.sources.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "#f1f5f9",
                          color: "#475569",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
              <Button onClick={() => setSelectedVehicle(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
