"use client";

import { MessageSquare, Bot, Activity, Search } from "lucide-react";
import { Card, Button, Pill, PageHeader } from "../shared";
import { conversations } from "../data";

export function Conversations() {
  return (
    <>
      <PageHeader
        title="Conversations"
        subtitle="Every SMS thread, fully logged for visibility and ACMA audit"
        action={
          <div className="segmented">
            <Button primary>
              <MessageSquare size={15} /> All
            </Button>
            <button>
              <Bot size={15} /> AI Active
            </button>
            <button>
              <Activity size={15} /> Human Control
            </button>
          </div>
        }
      />
      <div className="search-line">
        <Search size={17} />
        <input placeholder="Search conversations..." />
      </div>
      <Card className="conversation-list">
        {conversations.map((x, i) => (
          <div className="conversation" key={x + i}>
            <div className="initials">
              {i === 2 ? "AT" : i === 3 ? "DK" : i === 4 ? "SP" : "CP"}
            </div>
            <div className="conversation-copy">
              <div>
                <b>{x}</b>{" "}
                <Pill tone={i > 1 ? "purple" : "amber"}>
                  {i > 1 ? "Commitment" : "Contact"}
                </Pill>{" "}
                <Pill tone="teal">
                  {i === 0 ? "Human: Rowland Godfrey" : "AI active"}
                </Pill>
              </div>
              <p>
                →{" "}
                {i % 2
                  ? "Of course — I'll keep the enquiry active and monitor availability."
                  : "Confirmed — I'll call at 3:30pm today. I've kept stock linked to your enquiry."}
              </p>
            </div>
            <div className="phone">
              0491 570 {204 - i}
              <small>{4 + i}d ago · 7 msgs</small>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
