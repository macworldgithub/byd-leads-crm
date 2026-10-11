"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Building2,
  Shield,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  Globe,
  RefreshCw,
  UserCheck,
  UserCog,
  Briefcase,
} from "lucide-react";
import { staffApi, StaffMember, getStoredUser, getLockedSite } from "@/lib/api";

export function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("All Sites");
  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const [hasFullAccess, setHasFullAccess] = useState<boolean>(true);
  const [userSite, setUserSite] = useState<string>("");

  const storedUser = getStoredUser();
  const lockedSite = getLockedSite() || storedUser?.locked_site || "";

  const fetchStaff = async (siteToFetch?: string) => {
    setLoading(true);
    setError(null);
    try {
      const activeSiteParam = siteToFetch !== undefined ? siteToFetch : selectedSite;
      const res = await staffApi.getStaff(activeSiteParam, search);
      if (res && res.data) {
        setStaff(res.data);
        setHasFullAccess(res.userScope?.hasFullAccess ?? true);
        setUserSite(res.userScope?.userSite || lockedSite || "All Sites");
        if (res.availableSites && res.availableSites.length > 0) {
          setAvailableSites(res.availableSites);
        }
      }
    } catch (err: any) {
      console.error("Failed to load staff:", err);
      setError(err.message || "Failed to load staff directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [selectedSite]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStaff();
  };

  // Filter staff locally as well for instantaneous responsive search
  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staff;
    const q = search.toLowerCase().trim();
    return staff.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.position?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.site?.toLowerCase().includes(q) ||
        m.locked_site?.toLowerCase().includes(q)
    );
  }, [staff, search]);

  const stats = useMemo(() => {
    const total = filteredStaff.length;
    const active = filteredStaff.filter((s) => s.active !== false).length;
    const managers = filteredStaff.filter(
      (s) => (s.role || "").includes("manager") || (s.position || "").toLowerCase().includes("manager")
    ).length;
    const consultants = filteredStaff.filter(
      (s) =>
        (s.role || "").includes("consultant") ||
        (s.role || "").includes("agent") ||
        (s.position || "").toLowerCase().includes("consultant")
    ).length;
    return { total, active, managers, consultants };
  }, [filteredStaff]);

  const formatRole = (role: string) => {
    if (!role) return "Staff Member";
    return role
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div style={{ maxWidth: 1340, margin: "auto", padding: "24px 24px 60px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Staff Directory
          </h1>
          <p style={{ margin: "4px 0 0", color: "#687486", fontSize: 13 }}>
            Showroom sales specialists, managers, and delivery personnel
          </p>
        </div>

        <button
          onClick={() => fetchStaff()}
          style={{
            border: "1px solid #e1e4ea",
            background: "#fff",
            borderRadius: 8,
            padding: "8px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Access Scope Banner */}
      <div
        style={{
          background: hasFullAccess ? "#f8f9fc" : "#fdf6f0",
          border: `1px solid ${hasFullAccess ? "#e1e4ea" : "#fed7aa"}`,
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasFullAccess ? (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#e8effe",
                color: "#2563eb",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Globe size={18} />
            </div>
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#ffedd5",
                color: "#c2410c",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Lock size={18} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {hasFullAccess ? "Enterprise Access · All Showrooms" : `Site Restricted · ${userSite}`}
            </div>
            <div style={{ color: "#687486", fontSize: 12 }}>
              {hasFullAccess
                ? "You have organization-wide clearance. Staff across all dealer sites are accessible."
                : `You are assigned to ${userSite}. Showing team members exclusively assigned to your showroom.`}
            </div>
          </div>
        </div>

        {/* Site Filter for full-access users */}
        {hasFullAccess && availableSites.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#687486", fontWeight: 500 }}>Filter by Site:</span>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 13,
                background: "#fff",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <option value="All Sites">All Sites ({availableSites.length})</option>
              {availableSites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div className="card" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#f0f4ff",
                color: "#3b82f6",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{stats.total}</div>
              <div style={{ fontSize: 12, color: "#687486", marginTop: 4 }}>Total Staff</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#ecfdf5",
                color: "#10b981",
                display: "grid",
                placeItems: "center",
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{stats.active}</div>
              <div style={{ fontSize: 12, color: "#687486", marginTop: 4 }}>Active Status</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#fef3c7",
                color: "#d97706",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{stats.managers}</div>
              <div style={{ fontSize: 12, color: "#687486", marginTop: 4 }}>Sales Managers</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#fdf2f8",
                color: "#db2777",
                display: "grid",
                placeItems: "center",
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{stats.consultants}</div>
              <div style={{ fontSize: 12, color: "#687486", marginTop: 4 }}>Consultants & Agents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Search */}
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            background: "#fff",
            border: "1px solid #e1e4ea",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            gap: 8,
          }}
        >
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search staff by name, email, role, phone, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 0,
              outline: 0,
              width: "100%",
              fontSize: 13,
            }}
          />
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: "hidden", borderRadius: 12 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Staff Member</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Showroom Site</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Role & Position</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: "auto", marginBottom: 8 }} />
                    Loading staff records...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#6b7280" }}>
                    <Users size={28} style={{ margin: "auto", marginBottom: 8, color: "#9ca3af" }} />
                    No staff members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const siteBadge = member.locked_site || member.site || "General Network";
                  const initial = (member.name || "U").slice(0, 1).toUpperCase();
                  const isManager =
                    (member.role || "").includes("manager") ||
                    (member.position || "").toLowerCase().includes("manager");

                  return (
                    <tr
                      key={member._id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Name & Avatar */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: isManager ? "#fef3c7" : "#e0e7ff",
                              color: isManager ? "#b45309" : "#4338ca",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 700,
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#111827" }}>{member.name}</div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{member.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Site */}
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: "#f3f4f6",
                            border: "1px solid #e5e7eb",
                            padding: "4px 9px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#374151",
                          }}
                        >
                          <Building2 size={12} color="#6b7280" />
                          {siteBadge}
                        </span>
                      </td>

                      {/* Role & Position */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 500, color: "#1f2937" }}>
                          {member.position || formatRole(member.role)}
                        </div>
                        {member.position && (
                          <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase" }}>
                            {formatRole(member.role)}
                          </div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {member.phone ? (
                            <a
                              href={`tel:${member.phone}`}
                              style={{
                                color: "#2563eb",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                              }}
                            >
                              <Phone size={11} /> {member.phone}
                            </a>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>No phone</span>
                          )}
                          <a
                            href={`mailto:${member.email}`}
                            style={{
                              color: "#4b5563",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12,
                            }}
                          >
                            <Mail size={11} /> Email
                          </a>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: member.active !== false ? "#ecfdf5" : "#fef2f2",
                            color: member.active !== false ? "#065f46" : "#991b1b",
                            border: `1px solid ${member.active !== false ? "#a7f3d0" : "#fecaca"}`,
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: member.active !== false ? "#10b981" : "#ef4444",
                            }}
                          />
                          {member.active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
