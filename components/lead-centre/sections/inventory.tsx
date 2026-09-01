"use client";

import { RefreshCw, Search } from "lucide-react";
import { Card, Button, Pill, PageHeader } from "../shared";
import { inventory } from "../data";

export function Inventory() {
  return (
    <>
      <PageHeader
        title="Inventory Monitor"
        subtitle="660 available of 1052 tracked · source: bydmelbourne.com.au"
        action={
          <Button primary>
            <RefreshCw size={16} /> Sync Now
          </Button>
        }
      />
      <div className="toolbar filters">
        <Search size={17} />
        <input placeholder="Search stock #, model, colour..." />
        <select>
          <option>All models</option>
        </select>
        <select>
          <option>All statuses</option>
        </select>
        <select>
          <option>All pickup locations</option>
        </select>
      </div>
      <Card className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                "Stock #",
                "Vehicle",
                "Paint",
                "Pickup Location",
                "Status",
                "Drive Away",
                "Last Seen",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventory.map((r) => (
              <tr key={r.stock}>
                <td>{r.stock}</td>
                <td>
                  <b>{r.model}</b>
                  <small>—</small>
                </td>
                <td>{r.paint}</td>
                <td>{r.location}</td>
                <td>
                  <Pill tone={r.status === "Available" ? "green" : "blue"}>
                    {r.status}
                  </Pill>
                </td>
                <td>
                  <b>{r.price}</b>
                </td>
                <td>55d ago</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
