"use client";

import { ChevronDown, Check } from "lucide-react";
import { Card, Pill, PageHeader } from "../shared";
import { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  "Proposed",
  "Confirmed",
  "Completed",
  "Cancelled",
  "No Show",
];

export function Appointments() {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

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
            ].map((r, i) => (
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
                <td
                  className="relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === i ? null : i);
                  }}
                >
                  <div className="flex items-center gap-2 w-fit">
                    <Pill tone="green">Confirmed</Pill>
                    <ChevronDown size={15} className="text-gray-400" />
                  </div>
                  {openDropdown === i && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-[#e2e2e2] shadow-lg rounded-md py-1 z-50">
                      {STATUS_OPTIONS.map((opt) => (
                        <div
                          key={opt}
                          className={`px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                            opt === "Confirmed"
                              ? "bg-red-50 text-[#cf1d29]"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt}
                          {opt === "Confirmed" && (
                            <Check size={14} className="text-[#cf1d29]" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
