"use client";

import { Ban, Check, Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { Card, PageHeader, Icon } from "../shared";

export function Compliance() {
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
          {[
            "demo dataset refreshed",
            "callback confirmed lead #104",
            "qualification updated lead #102",
            "appointment booked lead #106",
            "human takeover lead #104",
            "qualification updated lead #101",
          ].map((x, i) => (
            <div className="audit-row" key={x}>
              <i />
              <div>
                <b>{x}</b>
                <small>{i % 2 ? "Rowland Godfrey" : "Ava AI"} · 4d ago</small>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
