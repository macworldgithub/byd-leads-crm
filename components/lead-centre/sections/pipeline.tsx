"use client";

import { FileCheck2, List, Plus, Search, Network, Columns3 } from "lucide-react";
import { Card, Button, Pill, StatCard, Icon, Prospect } from "../shared";
import { leads } from "../data";
import { Users, Bot, CalendarDays } from "lucide-react";
import { useState } from "react";

export function Pipeline({
  onModal,
}: {
  onModal: (type: "prospect" | "csv") => void;
}) {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  return (
    <>
      <div className="journey-hero bg-gray-900 text-white p-6 rounded-md" >
        <div>
          <div className="eyebrow font-bold text-white">AUTOGATE DEMONSTRATION</div>
          <h1>Lead journey board</h1>
          <p className="text-white font-bold">
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
          <div className="segmented">
            <button
              className={viewMode === "board" ? "btn-primary" : ""}
              onClick={() => setViewMode("board")}
            >
              <Columns3 size={16} /> Board
            </button>
            <button
              className={viewMode === "list" ? "btn-primary" : ""}
              onClick={() => setViewMode("list")}
            >
              <List size={16} /> List
            </button>
          </div>
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

      {viewMode === "board" ? (
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
      ) : (
        <Card className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Prospect</th>
                <th>Vehicle enquiry</th>
                <th>Source</th>
                <th>Dealership</th>
                <th>Status</th>
                <th>Control</th>
                <th style={{ textAlign: "right" }}>Score</th>
                <th style={{ textAlign: "right" }}>Received</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l, i) => (
                <tr key={l.name + l.score}>
                  <td>
                    <b>{l.name}</b>
                    <small>0491 570 20{i + 1}</small>
                  </td>
                  <td>
                    <b>{l.vehicle}</b>
                    <small>Stock #{Math.floor(Math.random() * 5000) + 1000}</small>
                  </td>
                  <td>
                    <small>{i === 0 ? "SMS Connect" : i > 2 ? "Carsales" : "Call Connect"}</small>
                  </td>
                  <td>
                    <small>{l.dealer}</small>
                  </td>
                  <td>
                    <Pill tone={l.tag === "Commitment" ? "purple" : "amber"}>{l.tag}</Pill>
                  </td>
                  <td>
                    <Pill tone={i === 4 ? "amber" : "teal"}>{i === 4 ? "Human: Rowland Godeffroy" : "AI active"}</Pill>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <b>{l.score}</b>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <small>{Math.max(1, 8 - i)}d ago</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
