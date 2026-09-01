"use client";

import { FileCheck2, List, Plus, Search, Network } from "lucide-react";
import { Card, Button, Pill, StatCard, Icon, Prospect } from "../shared";
import { leads } from "../data";
import { Users, Bot, CalendarDays } from "lucide-react";

export function Pipeline({
  onModal,
}: {
  onModal: (type: "prospect" | "csv") => void;
}) {
  return (
    <>
      <div className="journey-hero">
        <div>
          <div className="eyebrow">AUTOGATE DEMONSTRATION</div>
          <h1>Lead journey board</h1>
          <p>
            6 active prospects · AI qualification through to dealership
            commitment
          </p>
        </div>
        <div className="hero-actions">
          <Button primary onClick={() => onModal("prospect")}>
            <Plus size={16} /> Add Prospect
          </Button>
          <Button onClick={() => onModal("csv")}>
            <FileCheck2 size={16} /> Import CSV
          </Button>
          <Button>
            <List size={16} /> Board
          </Button>
        </div>
      </div>
      <div className="pipeline-stats">
        <StatCard icon={Users} title="" value="6" desc="Attachment prospects" />
        <StatCard
          icon={Bot}
          title=""
          value="2"
          desc="AI qualifying"
          tone="teal"
        />
        <StatCard
          icon={CalendarDays}
          title=""
          value="3"
          desc="Commitments"
          tone="teal"
        />
        <StatCard
          icon={Users}
          title=""
          value="1"
          desc="Human assisted"
          tone="amber"
        />
      </div>
      <div className="toolbar">
        <Search size={17} />
        <input placeholder="Search prospect, vehicle, stock or phone..." />
        <select>
          <option>All dealerships</option>
        </select>
        <select>
          <option>All statuses</option>
        </select>
      </div>
      <div className="columns">
        {[
          ["NEW ENQUIRIES", 0],
          ["AI QUALIFYING", 3],
          ["TEST DRIVE BOOKED", 3],
        ].map(([name, count], i) => (
          <Card className="column" key={name as string}>
            <div className="column-title">
              <div>
                <b>{name as string}</b>
                <small>
                  {i ? "Conversation in progress" : "Awaiting first contact"}
                </small>
              </div>
              <Pill>{count as number}</Pill>
            </div>
            {i === 0 ? (
              <div className="empty">
                <Network size={19} />
                <b>No prospects in this stage</b>
                <small>The board updates as replies are processed.</small>
              </div>
            ) : (
              leads
                .slice(i - 1, i + 2)
                .map((l) => <Prospect key={l.name + l.score} lead={l} />)
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
