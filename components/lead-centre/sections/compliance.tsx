"use client";

import { useEffect, useState } from "react";
import { Ban, Check, Clock3, FileCheck2, ShieldCheck, Loader2 } from "lucide-react";
import { Card, PageHeader, Icon } from "../shared";
import { getAuditTrails, getLead, type AuditTrail } from "@/lib/api";
import { mapLeadToProspect } from "@/lib/prospect-mapper";

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function Compliance({
  onSelectProspect,
}: {
  onSelectProspect?: (prospect: any) => void;
}) {
  const [trails, setTrails] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuditTrails()
      .then(setTrails)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleTrailClick = async (leadId: string) => {
    if (!onSelectProspect || !leadId) return;
    try {
      const lead = await getLead(leadId);
      onSelectProspect(mapLeadToProspect(lead));
    } catch (err) {
      console.error("Failed to load lead from audit trail", err);
    }
  };

  return (
    <>
      <PageHeader
        title="Compliance"
        subtitle="ACMA Spam Act 2003 controls, opt-out register and full audit trail"
      />
      <div className="compliance-grid">
        {[
          [
            "Consent",
            "Every prospect enquired via Autogate/carsales, creating inferred consent to be contacted about their enquiry. Consent basis and timestamp are recorded on each lead.",
          ],
          [
            "Sender Identification",
            "Every SMS identifies the dealership by name, and sender IDs are registered per ACMA's SMS Sender ID Register.",
          ],
          [
            "Opt-Out (Spam Act 2003)",
            "Every marketing message carries Reply STOP to opt out. STOP/UNSUBSCRIBE/OPT OUT replies are honoured immediately.",
          ],
          [
            "Contact Hours",
            "Outbound messages only send 9am–8pm weekdays and 9am–5pm Saturdays in the dealership's own timezone.",
          ],
        ].map(([a, b], i) => (
          <Card key={a}>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "bold",
              }}
            >
              <span className="compliance-icon" style={{ color: "var(--red)" }}>
                <Icon icon={[Check, FileCheck2, Ban, Clock3][i]} />
              </span>
              {a}
            </h3>
            <p
              style={{
                color: "gray",
                marginTop: "4px",
                fontSize: "12px",
              }}
            >
              {b}
            </p>
          </Card>
        ))}
        <Card className="register">
          <h2
            style={{
              color: "var(--red)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Ban size={17} style={{ color: "var(--red)" }} /> Opt-Out Register
            (Suppression List)
          </h2>
          <div className="register-head">
            <span>Phone</span>
            <span>Keyword</span>
            <span>Lead</span>
            <span>Suppressed</span>
          </div>
          <div className="empty">No opt-outs recorded.</div>
        </Card>
        <Card className="audit">
          <h2
            style={{
              color: "var(--red)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldCheck size={17} style={{ color: "var(--red)" }} /> Audit
            Trail
          </h2>
          {loading ? (
            <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
              <Loader2 className="animate-spin" size={24} style={{ color: "var(--red)" }} />
            </div>
          ) : error ? (
            <div style={{ padding: "20px", color: "gray", fontSize: "14px" }}>Failed to load audit trails.</div>
          ) : trails.length === 0 ? (
            <div style={{ padding: "20px", color: "gray", fontSize: "14px" }}>No audit trails found.</div>
          ) : (
            trails.map((trail) => (
              <div 
                className="audit-row" 
                key={trail._id} 
                onClick={() => handleTrailClick(trail.leadId)}
                style={{ cursor: trail.leadId ? "pointer" : "default" }}
              >
                <i />
                <div>
                  <b>{trail.message}</b>
                  <small>{trail.actor} · {timeAgo(trail.createdAt)}</small>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </>
  );
}
