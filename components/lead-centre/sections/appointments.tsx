"use client";

import { ChevronDown, Check, Loader2, MapPin } from "lucide-react";
import { Card, Pill, PageHeader } from "../shared";
import { Pagination } from "../pagination";
import { getAppointments, updateAppointment, getLeads, type Appointment } from "@/lib/api";
import { mapLeadToProspect, createProspectFromMetadata } from "@/lib/prospect-mapper";
import { useState, useEffect } from "react";

const STATUS_OPTIONS = ["Proposed", "Confirmed", "Completed", "Cancelled", "No Show"];
const YARD_OPTIONS = [
  "All Locations",
  "BYD Caroline Springs",
  "BYD Melbourne City",
  "BYD Melbourne CBD",
  "BYD Fairfield",
  "BYD South East",
  "Holding Yard VIC",
  "BYD Sydney",
  "BYD Gold Coast",
];

export function Appointments({
  onSelectProspect,
}: {
  onSelectProspect?: (prospect: any) => void;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedYard, setSelectedYard] = useState("All Locations");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const fetchAppts = async () => {
    setLoading(true);
    try {
      const res = await getAppointments({
        page,
        limit: pageSize,
        yard: selectedYard !== "All Locations" ? selectedYard : undefined,
      });

      if (Array.isArray(res)) {
        setAppointments(res);
        setTotalCount(res.length);
      } else if (res && res.data) {
        setAppointments(res.data);
        setTotalCount(res.pagination?.total || res.data.length);
      } else {
        setAppointments([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppts();
  }, [page, pageSize, selectedYard]);

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
      const query = appt.leadId || appt.phone || appt.prospectName;
      const leads = await getLeads({ q: query });
      const matched =
        (appt.leadId && leads.find((l) => l.virtualyardId === appt.leadId || l.leadId === appt.leadId || l._id === appt.leadId)) ||
        leads.find((l) => l.phone && appt.phone && l.phone === appt.phone) ||
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
        email: appt.email || "",
        dealership: appt.dealership || appt.location,
        vehicle: appt.vehicle && appt.vehicle !== "—" ? appt.vehicle : "2025 BYD ATTO 1",
        status: appt.status,
        platform: appt.platform || "virtualyard",
        testDrive: {
          testDriveDate: appt.testDriveDate || appt.when,
          location: appt.dealership || appt.location || "BYD Dealership",
          status: appt.status || "Confirmed",
          confirmed: true,
        },
      })
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <PageHeader
          title="Appointments"
          subtitle={`${totalCount} test drives and showroom visits booked by the AI or your team`}
        />

        {/* Location / Yard Filter Dropdown */}
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#657083]" />
          <select
            value={selectedYard}
            onChange={(e) => {
              setSelectedYard(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-white border border-[#e2e2e2] rounded-lg px-3 py-2 text-[#1e293b] font-medium outline-none focus:border-[#cf1d29]"
          >
            {YARD_OPTIONS.map((yard) => (
              <option key={yard} value={yard}>
                {yard}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                {["When", "Prospect", "Type", "Vehicle", "Dealership / Yard", "Booked By", "Status"].map(
                  (h) => <th key={h}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#657083] text-sm">
                    No appointments found for selected location filter.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
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
                    <td>{appt.dealership || appt.location || "BYD Fairfield"}</td>
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
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
              itemLabel="appointments"
            />
          </div>
        </Card>
      )}
    </>
  );
}
