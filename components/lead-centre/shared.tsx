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
  user,
}: {
  active: string;
  onSelect: (x: string) => void;
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: any;
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
          <div className="avatar">
            {(user?.name || "S").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>{user?.name || "Sales Specialist"}</strong>
            <small>{user?.role ? user.role.toUpperCase() : user?.locked_site || "Production Floor"}</small>
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
  user = null,
  lockedSite = "",
  onLogout,
}: {
  onMenu: () => void;
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
  locations?: string[];
  user?: any;
  lockedSite?: string;
  onLogout?: () => void;
}) {
  const { CheckCircle2, ExternalLink, Menu, MapPin, X, LogOut, Lock } = require("lucide-react");

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
        <div
          title="Lead Centre is running in live production mode with direct two-way SMS and live CRM allocation."
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            border: "1px solid #10b981",
            background: "#ecfdf5",
            color: "#047857",
            letterSpacing: "0.05em",
          }}
        >
          <CheckCircle2 size={13} />
          <span>PRODUCTION MODE · ACTIVE</span>
        </div>

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
            background: lockedSite ? "#eff6ff" : isFiltered ? "#fef2f2" : "#f8fafc",
            padding: "4px 10px",
            borderRadius: 8,
            border: lockedSite ? "1.5px solid #60a5fa" : isFiltered ? "1.5px solid #f87171" : "1px solid #e2e8f0",
            transition: "all 0.2s ease",
            boxShadow: isFiltered || lockedSite ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
          }}
        >
          {lockedSite ? (
            <Lock size={13} style={{ color: "#2563eb", flexShrink: 0 }} />
          ) : (
            <MapPin size={13} style={{ color: isFiltered ? "#dc2626" : "#64748b", flexShrink: 0 }} />
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: lockedSite ? "#1e40af" : isFiltered ? "#991b1b" : "#475569", whiteSpace: "nowrap" }}>
            {lockedSite ? "Site Locked:" : "Location / Yard:"}
          </span>
          {lockedSite ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
              {lockedSite}
            </span>
          ) : (
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
          )}
          {!lockedSite && isFiltered && (
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

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {user && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#f1f5f9",
              padding: "4px 10px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 11,
              fontWeight: 600,
              color: "#334155",
            }}
          >
            <span>{user.email || user.name || "User"}</span>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of Lead Centre"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  padding: "2px 7px",
                  borderRadius: 5,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <LogOut size={11} />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}

        <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation menu">
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}
