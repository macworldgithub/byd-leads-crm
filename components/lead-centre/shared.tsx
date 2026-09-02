"use client";

import type { ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
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
        <Pill tone={lead.tag === "Commitment" ? "purple" : "amber"}>
          {lead.tag}
        </Pill>
      </div>
      <small>{lead.vehicle}</small>
      <div className="prospect-meta">
        <span>{lead.dealer}</span>
        <b>{lead.score}/100</b>
      </div>
      <div className="progress">
        <i style={{ width: `${lead.score}%` }} />
      </div>
      <div className="next">
        <Bot size={13} />{" "}
        {lead.tag === "Commitment"
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

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { AlertCircle, Menu } = require("lucide-react");
  return (
    <>
      <div className="demo">
        <AlertCircle size={11} /> DEMONSTRATION MODE
      </div>
      <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation menu">
        <Menu size={20} />
      </button>
    </>
  );
}
