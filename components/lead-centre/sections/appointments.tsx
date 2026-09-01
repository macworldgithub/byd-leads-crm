"use client";

import { ChevronDown } from "lucide-react";
import { Card, Pill, PageHeader } from "../shared";

export function Appointments() {
  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Test drives and showroom visits booked by the AI or your team"
      />
      <Card className="table-wrap appointments">
        <table>
          <thead>
            <tr>
              {[
                "When",
                "Prospect",
                "Type",
                "Vehicle",
                "Dealership",
                "Booked By",
                "Status",
                "",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Fri, 28 Aug, 10:30 am",
                "Carsalesconnect Prospect",
                "Callback",
                "2025 SEALION 8 7 Seat SUV",
                "BYD Melbourne City",
                "Agent",
              ],
              [
                "Sat, 29 Aug, 06:00 am",
                "Carsalesconnect Prospect (2)",
                "Test Drive",
                "2025 SHARK 6 Premium Ute Automatic 1.5",
                "BYD Fairfield VIC",
                "AI",
              ],
              [
                "Sat, 29 Aug, 09:00 am",
                "Atem Tong (3)",
                "Test Drive",
                "2025 SHARK 6 Premium Ute Automatic 1.5",
                "BYD Fairfield VIC",
                "AI",
              ],
              [
                "Mon, 31 Aug, 04:30 am",
                "David Kennedy",
                "Test Drive",
                "—",
                "BYD Fairfield VIC",
                "AI",
              ],
            ].map((r) => (
              <tr key={r[1]}>
                <td>
                  <b>{r[0]}</b>
                </td>
                <td className="red-text">
                  <b>{r[1]}</b>
                  <small>0491 570 204</small>
                </td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td>{r[4]}</td>
                <td>{r[5]}</td>
                <td>
                  <Pill tone="green">Confirmed</Pill>
                </td>
                <td>
                  <ChevronDown size={15} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
