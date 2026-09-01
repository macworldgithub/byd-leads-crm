"use client";

import {
  FileCheck2,
  Network,
  Pencil,
  Plus,
  Smartphone,
  Warehouse,
  Clock,
  Zap,
} from "lucide-react";
import { Card, Button, Pill, PageHeader, Icon } from "../shared";

export function SettingsPage({
  onAdd,
  onEdit,
}: {
  onAdd: () => void;
  onEdit?: (dealershipName: string) => void;
}) {
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
            <Warehouse size={17} style={{ color: "var(--red)" }} /> Dealership
            Locations
          </h2>
          <Button primary onClick={onAdd}>
            <Plus size={12} /> Add
          </Button>
          <div className="locations">
            {[
              [
                "BYD Fairfield",
                "NSW",
                "Australia/Sydney",
                "72-74 Grand Avenue, Camellia NSW 2142 · SMS: BYDFairfield",
              ],
              [
                "BYD Fairfield VIC",
                "VIC",
                "Australia/Melbourne",
                "96 Grange Road, Fairfield VIC 3078 · SMS: BYDFldVIC",
              ],
              [
                "BYD Melbourne City",
                "VIC",
                "Australia/Melbourne",
                "435 Williamstown Road, Port Melbourne VIC 3207 · SMS: BYDMelb",
              ],
            ].map((r) => (
              <div className="location" key={r[0]}>
                <div>
                  <b>{r[0]}</b> <Pill>{r[1]}</Pill> <Pill>{r[2]}</Pill>
                  <p>
                    {r[3]} · Contact hours 09:00–20:00 wk / 09:00–17:00 Sat
                    <br />
                    <small>Autogate: not connected</small>
                  </p>
                </div>
                <Button onClick={() => onEdit?.(r[0] as string)}>
                  <Pencil size={14} /> Edit
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <Card className="sms">
          <h2
            style={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Smartphone size={17} style={{ color: "var(--red)" }} /> Mobile
            Message API (Two-Way SMS)
          </h2>
          <div className="form-grid">
            <label>
              Username
              <input placeholder="e.g. gSFclk" />
            </label>
            <label>
              API Key
              <input placeholder="API key" />
            </label>
          </div>
          <Button>
            <FileCheck2 size={15} /> Save Credentials
          </Button>{" "}
          <Button primary>
            <Network size={15} /> Test Connection
          </Button>
          <div className="simulation">
            <div>
              <b>Simulation Mode</b>
              <small>
                When on, SMS are logged in the portal but not physically
                delivered — ideal for demos.
              </small>
            </div>
            <span className="toggle on">
              <i />
            </span>
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
            <Network size={17} style={{ color: "var(--red)" }} /> Autogate
            Connection
          </h2>
          <p>
            Autogate credentials are stored per dealership (see location cards
            above). The scanner attempts credential-based portal access; where
            carsales blocks automated logins, it uses the structured lead feed
            matching the carsales lead model. For production-grade delivery,
            request LeadDriver / lead-forwarding activation from your carsales
            account manager, which posts leads directly to this platform's
            webhook: <code>/api/webhooks/autogate</code>
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
            <Zap size={17} style={{ color: "var(--red)" }} /> Automation
            Schedules
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
            Schedules run in the background even when no one is signed in.
            Manage or run them manually from the project dashboard's Schedules
            panel.
          </small>
        </Card>
      </div>
    </>
  );
}
