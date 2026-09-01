"use client";

import {
  CalendarDays,
  ChevronRight,
  MessageSquare,
  Network,
  Users,
  Zap,
} from "lucide-react";
import { Card, StatCard, Icon, Prospect } from "../shared";
import { leads } from "../data";
import { ArrowRight, Bot } from "lucide-react";

export function Dashboard() {
  return (
    <div className="dashboard-sections">
      <div className="stats-grid">
        <StatCard
          icon={Users}
          title="ACTIVE JOURNEYS"
          value="6"
          desc="All attachment prospects are active"
        />
        <StatCard
          icon={CalendarDays}
          title="APPOINTMENTS"
          value="3"
          desc="Confirmed dealership test drives"
          tone="teal"
        />
        <StatCard
          icon={MessageSquare}
          title="CONVERSATION ACTIVITY"
          value="43"
          desc="0 inbound · 0 outbound today"
          tone="slate"
        />
        <StatCard
          icon={Users}
          title="HUMAN ASSISTED"
          value="1"
          desc="Specialist takeover in progress"
          tone="amber"
        />
      </div>
      <Card className="funnel">
        <div className="section-heading">
          <div>
            <div className="eyebrow red-text">CONVERSION ENGINE</div>
            <h2>Live funnel progression</h2>
          </div>
          <small>
            Updated automatically from conversations and appointments
          </small>
        </div>
        <div className="funnel-steps">
          {[
            ["Imported", "Autogate captured", Network, 6],
            ["Engaged", "Two-way SMS", MessageSquare, 6],
            ["Qualified", "Needs captured", Zap, 6],
            ["Committed", "Test drives", CalendarDays, 3],
          ].map(([a, b, I, n], i) => (
            <div className="funnel-step" key={a as string}>
              <div className="step-top">
                <div className="mini-icon">
                  <Icon icon={I} />
                </div>
                <strong>{n as number}</strong>
              </div>
              <b>{a as string}</b>
              <small>{b as string}</small>
              {i < 3 && <ChevronRight className="step-chevron" />}
            </div>
          ))}
        </div>
      </Card>
      <div className="lower-grid">
        <Card>
          <div className="section-heading">
            <div>
              <div className="eyebrow red-text">INTERACTIVE DEMONSTRATION</div>
              <h2>Live prospect journeys</h2>
            </div>
          </div>
          <div className="view-board">
            View board <ArrowRight size={16} />
          </div>
          <div className="lead-grid">
            {leads.slice(0, 4).map((l) => (
              <Prospect key={l.name + l.score} lead={l} />
            ))}
          </div>
        </Card>
        <Card className="activity">
          <div className="eyebrow red-text">AUTOMATION LOG</div>
          <h2>Recent actions</h2>
          {[
            "Demo Dataset Refreshed",
            "Callback Confirmed",
            "Qualification Updated",
            "Appointment Booked",
            "Appointment Booked",
          ].map((x, i) => (
            <div className="log" key={x + i}>
              <span></span>
              <div>
                <b>{x}</b>
                <small>◷ 4d ago · {i ? "Ava AI" : "Demo System"}</small>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
