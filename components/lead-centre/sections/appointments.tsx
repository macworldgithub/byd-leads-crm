"use client";

import { ChevronDown, Check, Loader2 } from "lucide-react";
import { Card, Pill, PageHeader } from "../shared";
import { Pagination } from "../pagination";
import { getAppointments, updateAppointment, getLeads, type Appointment } from "@/lib/api";
import { mapLeadToProspect, createProspectFromMetadata } from "@/lib/prospect-mapper";
import { useState, useEffect } from "react";

const STATUS_OPTIONS = ["Proposed", "Confirmed", "Completed", "Cancelled", "No Show"];

export function Appointments({
  onSelectProspect,
}: {
  onSelectProspect?: (prospect: any) => void;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    getAppointments()
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    setOpenDropdown(null);
    try {
      const updated = await updateAppointment(id, { status });
      setAppointments((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (err: any) {
      console.error("Failed to update status:", err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAppointmentClick = async (appt: Appointment) => {
    if (!onSelectProspect) return;

    try {
      const leads = await getLeads({ q: appt.phone || appt.prospectName });
      const matched =
        leads.find((l) => l.phone === appt.phone) ||
        leads.find((l) => l.name.toLowerCase() === appt.prospectName.toLowerCase()) ||
        leads[0];

      if (matched) {
        onSelectProspect(mapLeadToProspect(matched));
        return;
      }
    } catch {
      // Fallback below
    }

    onSelectProspect(
      createProspectFromMetadata({
        id: appt._id,
        name: appt.prospectName,
        phone: appt.phone,
        dealership: appt.dealership,
        vehicle: appt.vehicle !== "—" ? appt.vehicle : "2025 BYD ATTO 1",
        status: appt.status,
      })
    );
  };

  const paginatedAppts = appointments.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(appointments.length / pageSize) || 1;

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle={`${appointments.length} test drives and showroom visits booked by the AI or your team`}
      />

      {loading && (
        <div className="flex items-center justify-center h-40 text-[#657083]">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading appointments...
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-500 text-sm">Failed to load appointments: {error}</div>
      )}

      {!loading && !error && (
        <Card className="table-wrap appointments" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                {["When", "Prospect", "Type", "Vehicle", "Dealership", "Booked By", "Status"].map(
                  (h) => <th key={h}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#657083] text-sm">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                paginatedAppts.map((appt) => (
                  <tr
                    key={appt._id}
                    onClick={() => handleAppointmentClick(appt)}
                    className="hover:bg-[#f9f9f9] cursor-pointer transition-colors"
                  >
                    <td><b>{appt.when}</b></td>
                    <td className="red-text">
                      <b className="hover:underline">{appt.prospectName}</b>
                      <small>{appt.phone}</small>
                    </td>
                    <td>{appt.type}</td>
                    <td>{appt.vehicle}</td>
                    <td>{appt.dealership}</td>
                    <td>{appt.bookedBy}</td>
                    <td
                      className="relative cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === appt._id ? null : appt._id);
                      }}
                    >
                      {updatingId === appt._id ? (
                        <Loader2 size={14} className="animate-spin text-[#cf1d29]" />
                      ) : (
                        <div className="flex items-center gap-2 w-fit">
                          <Pill tone="green">{appt.status}</Pill>
                          <ChevronDown size={15} className="text-gray-400" />
                        </div>
                      )}
                      {openDropdown === appt._id && (
                        <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-[#e2e2e2] shadow-lg rounded-md py-1 z-50">
                          {STATUS_OPTIONS.map((opt) => (
                            <div
                              key={opt}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(appt._id, opt);
                              }}
                              className={`px-4 py-2 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                opt === appt.status
                                  ? "bg-red-50 text-[#cf1d29]"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {opt}
                              {opt === appt.status && <Check size={14} className="text-[#cf1d29]" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{ padding: "0 16px 12px" }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={appointments.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="appointments"
            />
          </div>
        </Card>
      )}
    </>
  );
}
