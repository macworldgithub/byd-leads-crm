"use client";

import {
  FileCheck2,
  Network,
  Pencil,
  Plus,
  Smartphone,
  Warehouse,
  Zap,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Send,
} from "lucide-react";
import { Card, Button, Pill, PageHeader, Modal, ModalActions } from "../shared";
import {
  getDealerships,
  deleteDealership,
  getSmsSettings,
  saveSmsSettings,
  testSmsConnection,
  sendTestSms,
  type Dealership,
  type SmsSettings,
} from "@/lib/api";
import { useState, useEffect } from "react";

export function SettingsPage({
  onAdd,
  onEdit,
  onRefresh,
}: {
  onAdd: () => void;
  onEdit?: (dealershipName: string) => void;
  onRefresh?: () => void;
}) {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dealershipToDelete, setDealershipToDelete] = useState<Dealership | null>(null);

  // ── SMS Configuration State (Auto-fetched on mount) ─────────────────────
  const [smsUsername, setSmsUsername] = useState("UKeOAk");
  const [smsApiKey, setSmsApiKey] = useState("8qIw3KM6gh7C779tVhzFnK1bBZUHgmOFk5omhWtTEZp");
  const [smsSenderId, setSmsSenderId] = useState("+61468104118");
  const [simulationMode, setSimulationMode] = useState(false);
  const [smsConnectionStatus, setSmsConnectionStatus] = useState<"untested" | "connected" | "failed">("connected");
  const [creditBalance, setCreditBalance] = useState<number | null>(4647);
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [savingSms, setSavingSms] = useState(false);
  const [testingSms, setTestingSms] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Live test SMS state
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [sendingTestSms, setSendingTestSms] = useState(false);
  const [testSmsFeedback, setTestSmsFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchDealerships = () => {
    setLoading(true);
    getDealerships()
      .then(setDealerships)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const fetchSmsSettings = () => {
    getSmsSettings()
      .then((cfg) => {
        if (cfg) {
          if (cfg.username) setSmsUsername(cfg.username);
          if (cfg.apiKey) setSmsApiKey(cfg.apiKey);
          if (cfg.senderId) setSmsSenderId(cfg.senderId);
          if (cfg.simulationMode !== undefined) setSimulationMode(cfg.simulationMode);
          if (cfg.connectionStatus) setSmsConnectionStatus(cfg.connectionStatus);
          if (cfg.lastTestedAt) setLastTestedAt(cfg.lastTestedAt);
          if (cfg.connectionMessage) setConnectionMessage(cfg.connectionMessage);
          if (cfg.creditBalance !== undefined) setCreditBalance(cfg.creditBalance);
        }
      })
      .catch((err) => {
        console.error("Failed to load SMS settings:", err.message);
      });
  };

  useEffect(() => {
    fetchDealerships();
    fetchSmsSettings();
  }, []);

  const handleSaveCredentials = async () => {
    setSavingSms(true);
    setSmsFeedback(null);
    try {
      const res = await saveSmsSettings({
        username: smsUsername,
        apiKey: smsApiKey,
        senderId: smsSenderId,
        simulationMode,
      });
      setSmsFeedback({
        type: "success",
        message: res.message || "SMS credentials saved successfully!",
      });
    } catch (err: any) {
      setSmsFeedback({
        type: "error",
        message: err.message || "Failed to save credentials",
      });
    } finally {
      setSavingSms(false);
    }
  };

  const handleToggleSimulation = async () => {
    if (savingSms || testingSms) return;
    const newMode = !simulationMode;
    setSimulationMode(newMode);
    setSavingSms(true);
    setSmsFeedback(null);
    try {
      const res = await saveSmsSettings({
        simulationMode: newMode,
        senderId: smsSenderId,
        ...(smsUsername.trim() ? { username: smsUsername.trim() } : {}),
        ...(smsApiKey.trim() ? { apiKey: smsApiKey.trim() } : {}),
      });
      setSmsFeedback({
        type: "success",
        message:
          res.message ||
          `Simulation Mode ${newMode ? "enabled" : "disabled"} successfully!`,
      });
    } catch (err: any) {
      setSimulationMode(!newMode); // Revert on failure
      setSmsFeedback({
        type: "error",
        message: "Failed to update Simulation Mode: " + (err.message || "Request failed"),
      });
    } finally {
      setSavingSms(false);
    }
  };

  const handleTestConnection = async () => {
    if (!smsUsername.trim() || !smsApiKey.trim()) {
      setSmsFeedback({
        type: "error",
        message: "Please enter both Username and API Key before testing the connection.",
      });
      return;
    }

    setTestingSms(true);
    setSmsFeedback(null);
    try {
      const res = await testSmsConnection({
        username: smsUsername,
        apiKey: smsApiKey,
        senderId: smsSenderId,
        simulationMode,
      });
      setSmsConnectionStatus(res.connectionStatus);
      setLastTestedAt(res.testedAt);
      setConnectionMessage(res.message);
      if (res.balance !== undefined) setCreditBalance(res.balance);
      setSmsFeedback({
        type: "success",
        message: res.message,
      });
    } catch (err: any) {
      setSmsConnectionStatus("failed");
      setSmsFeedback({
        type: "error",
        message: err.message || "SMS API connection test failed.",
      });
    } finally {
      setTestingSms(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhone.trim()) {
      setTestSmsFeedback({
        type: "error",
        message: "Please enter a destination phone number (e.g. 0412345678 or +61412345678).",
      });
      return;
    }

    setSendingTestSms(true);
    setTestSmsFeedback(null);
    try {
      const res = await sendTestSms({
        to: testPhone.trim(),
        message: testMessage.trim() || undefined,
      });
      setTestSmsFeedback({
        type: "success",
        message: res.message || "Test SMS sent successfully!",
      });
    } catch (err: any) {
      setTestSmsFeedback({
        type: "error",
        message: err.message || "Failed to send test SMS",
      });
    } finally {
      setSendingTestSms(false);
    }
  };

  const confirmDeleteDealership = async () => {
    if (!dealershipToDelete) return;
    const id = dealershipToDelete._id;
    setDeletingId(id);
    try {
      await deleteDealership(id);
      setDealerships((prev) => prev.filter((d) => d._id !== id));
      setDealershipToDelete(null);
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Dealership locations, integrations and automation"
      />
      <div style={{ marginBottom: "20px" }}>
        <Card>
          <h2
            style={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Warehouse size={17} style={{ color: "var(--red)" }} /> Dealership Locations
          </h2>
          <Button primary onClick={onAdd}>
            <Plus size={12} /> Add
          </Button>
          <div className="locations">
            {loading && (
              <div className="flex items-center justify-center py-8 text-[#657083]">
                <Loader2 size={18} className="animate-spin mr-2" /> Loading dealerships...
              </div>
            )}
            {error && (
              <div className="text-center py-6 text-red-500 text-sm">
                Failed to load dealerships: {error}
              </div>
            )}
            {!loading && !error && dealerships.length === 0 && (
              <div className="text-center py-8 text-[#657083] text-sm">
                No dealerships yet. Click Add to create one.
              </div>
            )}
            {!loading &&
              !error &&
              dealerships.map((d) => (
                <div className="location" key={d._id}>
                  <div>
                    <b>{d.name}</b>{" "}
                    <Pill>{d.state}</Pill>{" "}
                    <Pill>{d.timezone}</Pill>
                    <p>
                      {d.address}, {d.suburb} {d.state} · SMS: {d.smsSenderId}
                      {" "}· Contact hours {d.weekdayHoursStart}–{d.weekdayHoursEnd} wk / {d.saturdayHoursStart}–{d.saturdayHoursEnd} Sat
                      <br />
                      <small>Autogate: {d.autogateId ? d.autogateId : "not connected"}</small>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button onClick={() => onEdit?.(d.name)}>
                      <Pencil size={14} /> Edit
                    </Button>
                    <button
                      onClick={() => setDealershipToDelete(d)}
                      disabled={deletingId === d._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 10px",
                        border: "1px solid #e2e2e2",
                        borderRadius: "8px",
                        background: "white",
                        cursor: "pointer",
                        color: "#cf1d29",
                        fontSize: "13px",
                      }}
                    >
                      {deletingId === d._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <Card className="sms">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h2
              style={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
              }}
            >
              <Smartphone size={17} style={{ color: "var(--red)" }} /> MobileMessage.com.au API (Two-Way SMS)
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {smsConnectionStatus === "connected" && (
                <Pill tone="green">
                  ● Connected {creditBalance !== null ? `· ${creditBalance.toLocaleString()} Credits` : ""}
                </Pill>
              )}
              {smsConnectionStatus === "failed" && (
                <Pill tone="amber">● Connection Failed</Pill>
              )}
              {smsConnectionStatus === "untested" && (
                <Pill tone="gray">Untested</Pill>
              )}
            </div>
          </div>

          {smsFeedback && (
            <div
              style={{
                marginTop: "16px",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                background: smsFeedback.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: smsFeedback.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                color: smsFeedback.type === "success" ? "#166534" : "#991b1b",
              }}
            >
              {smsFeedback.type === "success" ? (
                <CheckCircle2 size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
              ) : (
                <AlertCircle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>{smsFeedback.message}</div>
              <button
                onClick={() => setSmsFeedback(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "inherit",
                  opacity: 0.7,
                  padding: "0 4px",
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="form-grid" style={{ marginTop: "16px" }}>
            <label>
              Username
              <input
                placeholder="e.g. UKeOAk"
                value={smsUsername}
                onChange={(e) => setSmsUsername(e.target.value)}
                disabled={savingSms || testingSms}
              />
            </label>
            <label>
              API Key / Password
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  placeholder="API key or password"
                  value={smsApiKey}
                  onChange={(e) => setSmsApiKey(e.target.value)}
                  disabled={savingSms || testingSms}
                  style={{ width: "100%", paddingRight: "36px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#888",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={showApiKey ? "Hide API Key" : "Show API Key"}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <label>
              Sender ID / Virtual Number
              <input
                placeholder="e.g. +61468104118 or BYD-DIRECT"
                value={smsSenderId}
                onChange={(e) => setSmsSenderId(e.target.value)}
                disabled={savingSms || testingSms}
              />
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
            <Button
              onClick={handleSaveCredentials}
              disabled={savingSms || testingSms}
            >
              {savingSms ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FileCheck2 size={15} /> Save Credentials
                </>
              )}
            </Button>
            <Button
              primary
              onClick={handleTestConnection}
              disabled={savingSms || testingSms}
            >
              {testingSms ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Verifying Connection...
                </>
              ) : (
                <>
                  <Network size={15} /> Test Live Connection
                </>
              )}
            </Button>
          </div>

          {lastTestedAt && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "12px",
                fontSize: "12px",
                color: "var(--muted)",
              }}
            >
              <Clock size={13} />
              <span>
                Last tested: {new Date(lastTestedAt).toLocaleString()}
                {connectionMessage ? ` · ${connectionMessage}` : ""}
              </span>
            </div>
          )}

          <div
            className="simulation"
            style={{
              cursor: savingSms || testingSms ? "not-allowed" : "pointer",
              userSelect: "none",
              opacity: savingSms ? 0.75 : 1,
              marginTop: "16px",
            }}
            onClick={handleToggleSimulation}
          >
            <div>
              <b>Simulation Mode</b>
              <small>
                When active, SMS messages are recorded in CRM logs without being dispatched over telco networks.
              </small>
            </div>
            <span className={`toggle ${simulationMode ? "on" : ""}`}>
              <i />
            </span>
          </div>

          {/* ── Live Test SMS Panel ── */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "#fafafa",
              borderRadius: "8px",
              border: "1px solid #eaeaea",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Send size={15} style={{ color: "var(--red)" }} /> Send Test SMS Message
            </div>
            <p style={{ fontSize: "12px", color: "#666", margin: "0 0 12px 0" }}>
              Test real outbound message delivery to any Australian mobile number via MobileMessage.
            </p>

            {testSmsFeedback && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  background: testSmsFeedback.type === "success" ? "#f0fdf4" : "#fef2f2",
                  border: testSmsFeedback.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                  color: testSmsFeedback.type === "success" ? "#166534" : "#991b1b",
                }}
              >
                {testSmsFeedback.message}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px" }}>
                  Destination Mobile (E.164 or Australian 04xx)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0412345678 or +61412345678"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  disabled={sendingTestSms}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ flex: "2 1 300px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px" }}>
                  Message Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Hello from BYD Leads Manager! Reply STOP to opt out"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  disabled={sendingTestSms}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "13px",
                  }}
                />
              </div>

              <Button
                onClick={handleSendTestSms}
                disabled={sendingTestSms || !testPhone.trim()}
              >
                {sendingTestSms ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send SMS
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <Card>
          <h2
            style={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Network size={17} style={{ color: "var(--red)" }} /> Autogate Connection
          </h2>
          <p>
            Autogate credentials are stored per dealership (see location cards above). The scanner
            attempts credential-based portal access; where carsales blocks automated logins, it uses
            the structured lead feed matching the carsales lead model. For production-grade delivery,
            request LeadDriver / lead-forwarding activation from your carsales account manager, which
            posts leads directly to this platform's webhook: <code>/api/webhooks/autogate</code>
          </p>
        </Card>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <Card>
          <h2
            style={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Zap size={17} style={{ color: "var(--red)" }} /> Automation Schedules
          </h2>
          <div className="schedules-list">
            {[
              {
                title: "Scan Autogate for new leads + send opening SMS",
                desc: "autogate-lead-scan · every 5 min",
                status: "Not scheduled",
              },
              {
                title: "Sync stock from bydmelbourne.com.au",
                desc: "inventory-sync · every 4 hours",
                status: "Not scheduled",
              },
              {
                title: "Release quiet-hours queued SMS",
                desc: "sms-queue-dispatch · every 15 min",
                status: "Not scheduled",
              },
            ].map((item, i) => (
              <div className="schedule-item" key={i}>
                <div>
                  <b>{item.title}</b>
                  <small>{item.desc}</small>
                </div>
                <div className="status-badge">{item.status}</div>
              </div>
            ))}
          </div>
          <Button primary>
            <Zap size={15} /> Enable Automation Schedules
          </Button>
          <small style={{ display: "block", marginTop: "12px", color: "#666" }}>
            Schedules run in the background even when no one is signed in. Manage or run them
            manually from the project dashboard's Schedules panel.
          </small>
        </Card>
      </div>

      {dealershipToDelete && (
        <Modal
          title="Delete Dealership"
          description={`Are you sure you want to delete ${dealershipToDelete.name}? This action cannot be undone.`}
          onClose={() => setDealershipToDelete(null)}
        >
          <ModalActions
            onClose={() => setDealershipToDelete(null)}
            onPrimary={confirmDeleteDealership}
            primary={deletingId === dealershipToDelete._id ? "Deleting..." : "Delete"}
            disabled={deletingId === dealershipToDelete._id}
          />
        </Modal>
      )}
    </>
  );
}
