"use client";

import type { ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={`card ${className}`} style={style}>
      {children}
    </section>
  );
}

export function Button({
  children,
  primary = false,
  onClick,
  disabled = false,
  style,
  className = "",
}: {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...style,
        ...(disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
      }}
      className={`${primary ? "btn btn-primary" : "btn"} ${className}`.trim()}
    >
      {children}
    </button>
  );
}


export function Pill({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

export function StatCard({
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
  tone?: string;
}) {
  return (
    <Card className="stat">
      <div className={`stat-icon ${tone}`}>
        <Icon size={17} strokeWidth={1.8} />
      </div>
      <div>
        <div className="eyebrow">{title}</div>
        <div className="stat-value">{value}</div>
        <p>{desc}</p>
      </div>
      <ChevronRight className="stat-arrow" size={18} />
    </Card>
  );
}

export function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          aria-label="Close modal"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <h2 id="modal-title">{title}</h2>
        {description && <p className="modal-description">{description}</p>}
        {children}
      </div>
    </div>
  );
}

export function ModalField({
  label,
  placeholder,
  wide = false,
  defaultValue,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  placeholder?: string;
  wide?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <label className={wide ? "wide-field" : undefined}>
      {label}
      <input
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}

export function ModalActions({
  onClose,
  onPrimary,
  primary = "Save",
  disabled = false,
}: {
  onClose: () => void;
  onPrimary?: () => void;
  primary?: string;
  disabled?: boolean;
}) {
  return (
    <div className="modal-actions">
      <Button onClick={onClose}>Cancel</Button>
      <Button
        primary
        onClick={onPrimary ?? onClose}
        disabled={disabled}
      >
        {primary}
      </Button>
    </div>
  );
}

export function Icon({ icon: I, size = 17 }: { icon: any; size?: number }) {
  return <I size={size} strokeWidth={1.8} />;
}

export function Prospect({
  lead,
  onClick,
}: {
  lead: any;
  onClick?: () => void;
}) {
  const { Bot } = require("lucide-react");
  return (
    <div
      className={`prospect ${lead.color}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="prospect-head">
        <b>{lead.name}</b>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {lead.platform === "virtualyard" && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: "linear-gradient(135deg, #065f46 0%, #059669 100%)", color: "#fff", letterSpacing: "0.04em" }}>VY</span>
          )}
          {lead.platform === "autogate" && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", color: "#fff", letterSpacing: "0.04em" }}>AG</span>
          )}
          <Pill tone={lead.tag === "Commitment" ? "purple" : "amber"}>
            {lead.tag}
          </Pill>
        </div>
      </div>
      <small>{lead.vehicle || "BYD Vehicle"}</small>
      <div className="prospect-meta">
        <span>{lead.dealer || "BYD Dealership"}</span>
        <b>{lead.score}/100</b>
      </div>
      <div className="progress">
        <i style={{ width: `${lead.score}%` }} />
      </div>
      <div className="next">
        <Bot size={13} />{" "}
        {lead.testDrive?.confirmed
          ? `Confirmed Test Drive: ${lead.testDrive.location || "Dealership"}`
          : lead.assignedTo
          ? `Rep: ${lead.assignedTo}`
          : lead.tag === "Commitment"
          ? "Protect confirmed appointment"
          : "AI qualifying intent and availability"}
      </div>
    </div>
  );
}

export function Sidebar({
  active,
  onSelect,
  open,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  active: string;
  onSelect: (x: string) => void;
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { ArrowRight, Menu } = require("lucide-react");
  const nav = [
    "Dashboard",
    "Leads Pipeline",
    "Conversations",
    "Inventory",
    "Appointments",
    "Compliance",
    "Settings",
  ].map((label, i) => {
    const icons = [
      require("lucide-react").LayoutDashboard,
      require("lucide-react").Users,
      require("lucide-react").MessageSquare,
      require("lucide-react").Warehouse,
      require("lucide-react").CalendarDays,
      require("lucide-react").ShieldCheck,
      require("lucide-react").Settings,
    ];
    return [label, icons[i]] as const;
  });

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`sidebar ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
      >
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="brand">
            <div className="brand-icon">
              <ArrowRight size={20} />
            </div>
            <div>
              <div className="eyebrow">LEAD CENTRE</div>
              <strong>
                BYD Melbourne &<br />
                Fairfield
              </strong>
            </div>
          </div>
        </div>
        <nav>
          {nav.map(([label, I]) => (
            <button
              key={label}
              className={active === label ? "active" : ""}
              onClick={() => {
                onSelect(label);
                onClose();
              }}
              title={collapsed ? label : undefined}
            >
              <Icon icon={I} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="agent">
          <div className="avatar">D</div>
          <div>
            <strong>Demo Agent</strong>
            <small>Demonstration mode</small>
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopBar({
  onMenu,
  selectedLocation = "All Locations",
  onLocationChange,
  locations = [],
}: {
  onMenu: () => void;
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
  locations?: string[];
}) {
  const { AlertCircle, CheckCircle2, ExternalLink, Menu, MapPin, X } = require("lucide-react");
  const [isProd, setIsProd] = typeof window !== "undefined"
    ? require("react").useState(() => localStorage.getItem("byd_leads_mode") === "production")
    : [false, () => {}];

  const toggleMode = () => {
    const next = !isProd;
    if (next) {
      if (confirm("Cut over Lead Centre to LIVE PRODUCTION MODE? Live qualified leads will be allocated to Sales Floor CRM.")) {
        setIsProd(true);
        localStorage.setItem("byd_leads_mode", "production");
      }
    } else {
      setIsProd(false);
      localStorage.setItem("byd_leads_mode", "demo");
    }
  };

  const crmUrl =
    process.env.NEXT_PUBLIC_CRM_URL ||
    (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:4002"
      : "https://crm.goodshowroom.com");

  const isFiltered = Boolean(selectedLocation && selectedLocation !== "All Locations");

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 12px", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={toggleMode}
          title="Click to toggle Production / Demonstration mode cutover (§8.2, AC-11)"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            border: isProd ? "1px solid #10b981" : "1px solid #f59e0b",
            background: isProd ? "#ecfdf5" : "#fffbeb",
            color: isProd ? "#047857" : "#b45309",
            letterSpacing: "0.05em",
            transition: "all 0.15s ease",
          }}
        >
          {isProd ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{isProd ? "PRODUCTION MODE · ACTIVE" : "DEMONSTRATION MODE"}</span>
          <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 2 }}>(Cutover: §8.2)</span>
        </button>

        <a
          href={crmUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 600,
            color: "#6b7280",
            textDecoration: "none",
            padding: "4px 8px",
            borderRadius: 6,
            background: "#f3f4f6",
          }}
        >
          <span>Open Sales Floor CRM</span>
          <ExternalLink size={11} />
        </a>

        {/* ── Overall Yard / Location Filter ── */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: isFiltered ? "#fef2f2" : "#f8fafc",
            padding: "4px 10px",
            borderRadius: 8,
            border: isFiltered ? "1.5px solid #f87171" : "1px solid #e2e8f0",
            transition: "all 0.2s ease",
            boxShadow: isFiltered ? "0 1px 3px rgba(239, 68, 68, 0.1)" : "none",
          }}
        >
          <MapPin size={13} style={{ color: isFiltered ? "#dc2626" : "#64748b", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: isFiltered ? "#991b1b" : "#475569", whiteSpace: "nowrap" }}>
            Location / Yard:
          </span>
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange?.(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              color: isFiltered ? "#dc2626" : "#0f172a",
              cursor: "pointer",
              outline: "none",
              paddingRight: 4,
              maxWidth: 210,
            }}
          >
            <option value="All Locations">All Locations / Yards</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {isFiltered && (
            <button
              onClick={() => onLocationChange?.("All Locations")}
              title="Clear Location Filter"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "inline-flex",
                alignItems: "center",
                color: "#ef4444",
                borderRadius: "50%",
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation menu">
        <Menu size={20} />
      </button>
    </div>
  );
}
