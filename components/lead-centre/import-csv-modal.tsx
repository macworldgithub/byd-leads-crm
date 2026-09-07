"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Loader2,
  X,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import {
  getDealerships,
  getLeadDealerships,
  importLeadsCsv,
  type Dealership,
  type CsvImportResponse,
} from "@/lib/api";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedProspect {
  raw: Record<string, string>;
  name: string;
  firstName?: string;
  lastName?: string;
  mobile: string;
  email?: string;
  dealership?: string;
  vehicle?: string;
  notes?: string;
  suburb?: string;
  state?: string;
  leadId?: string;
}

// Robust RFC-4180 CSV parser
function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (current.trim().length > 0) {
        lines.push(current);
      }
      current = "";
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    lines.push(current);
  }

  if (lines.length === 0) return [];

  const splitLine = (line: string): string[] => {
    const values: string[] = [];
    let val = "";
    let inside = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"') {
        if (inside && next === '"') {
          val += '"';
          i++;
        } else {
          inside = !inside;
        }
      } else if (char === "," && !inside) {
        values.push(val.trim());
        val = "";
      } else {
        val += char;
      }
    }
    values.push(val.trim());
    return values;
  };

  const headers = splitLine(lines[0]).map((h) =>
    h.replace(/^["']|["']$/g, "").trim()
  );
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    if (values.every((v) => !v.trim())) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] =
        values[idx] !== undefined
          ? values[idx].replace(/^["']|["']$/g, "").trim()
          : "";
    });
    rows.push(row);
  }

  return rows;
}

function normalizeRows(rows: Record<string, string>[]): ParsedProspect[] {
  return rows.map((row) => {
    const getVal = (possibleKeys: string[]) => {
      for (const k of Object.keys(row)) {
        const normKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        for (const pk of possibleKeys) {
          if (normKey === pk.toLowerCase().replace(/[^a-z0-9]/g, "")) {
            return (row[k] || "").trim();
          }
        }
      }
      return "";
    };

    const firstName = getVal(["first name", "firstname", "first", "given name"]);
    const lastName = getVal(["last name", "lastname", "last", "surname", "family name"]);
    let name = getVal([
      "name",
      "full name",
      "prospect name",
      "customer name",
      "first name / name",
    ]);
    if (!name && (firstName || lastName)) {
      name = `${firstName} ${lastName}`.trim();
    }

    const mobile = getVal([
      "mobile",
      "mobile number",
      "phone",
      "phone number",
      "contact",
      "cell",
      "cell phone",
    ]);
    const email = getVal(["email", "email address", "e-mail", "mail"]);
    const dealership = getVal(["dealership", "dealer", "location"]);
    const vehicle = getVal([
      "vehicle",
      "vehicle / enquiry",
      "car",
      "model",
      "enquiry",
      "vehicle name",
    ]);
    const notes = getVal([
      "notes",
      "note",
      "enquiry note",
      "enquiry desc",
      "comments",
      "description",
    ]);
    const suburb = getVal(["suburb", "city", "address", "suburb/state"]);
    const state = getVal(["state", "region", "province"]);
    const leadId = getVal([
      "lead id",
      "leadid",
      "autogate id",
      "autogateid",
      "stock num",
      "stock number",
      "stock #",
      "stocknum",
      "id",
    ]);

    return {
      raw: row,
      name: name || "Unknown",
      firstName,
      lastName,
      mobile,
      email,
      dealership,
      vehicle,
      notes,
      suburb,
      state,
      leadId,
    };
  });
}

export function ImportCsvModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportCsvModalProps) {
  const [dealerships, setDealerships] = useState<string[]>([]);
  const [defaultDealer, setDefaultDealer] = useState("BYD Fairfield VIC");
  const [sendSms, setSendSms] = useState(true);
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedProspect[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load dealerships on mount
  useEffect(() => {
    if (!isOpen) return;

    Promise.allSettled([getDealerships(), getLeadDealerships()]).then(
      ([dealersRes, leadDealersRes]) => {
        const names = new Set<string>();
        if (dealersRes.status === "fulfilled") {
          dealersRes.value.forEach((d) => d.name && names.add(d.name));
        }
        if (leadDealersRes.status === "fulfilled") {
          leadDealersRes.value.forEach((d) => d && names.add(d));
        }
        if (names.size === 0) {
          names.add("BYD Fairfield");
          names.add("BYD Fairfield VIC");
          names.add("BYD Melbourne City");
        }
        const list = Array.from(names);
        setDealerships(list);
        if (!list.includes(defaultDealer) && list.length > 0) {
          setDefaultDealer(list[0]);
        }
      }
    );
  }, [isOpen]);

  const handleReset = () => {
    setFileName("");
    setParsedRows([]);
    setImportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setError("Please select a valid .csv file.");
      return;
    }

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rawObjects = parseCSV(text);
        if (rawObjects.length === 0) {
          setError("The selected CSV file is empty.");
          return;
        }
        if (rawObjects.length > 500) {
          setError("CSV contains more than 500 rows. Max limit is 500 rows per import.");
          return;
        }
        const normalized = normalizeRows(rawObjects);
        setParsedRows(normalized);
      } catch (err: any) {
        setError("Failed to parse CSV file: " + err.message);
      }
    };
    reader.onerror = () => {
      setError("Error reading the file.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      // Send raw records to backend import endpoint
      const rawLeads = parsedRows.map((r) => r.raw);
      const res = await importLeadsCsv({
        leads: rawLeads,
        defaultDealer,
        sendSms,
      });

      setImportResult(res);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to import leads from CSV.");
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCsv = (e: React.MouseEvent) => {
    e.stopPropagation();
    const csvContent =
      "First Name,Last Name,Mobile,Email,Dealership,Vehicle,Notes,Suburb,State,Lead ID\n" +
      "Ali,Khan,0400123456,ali.khan@example.com,BYD Fairfield VIC,BYD Seal,Interested in test drive this weekend,Fairfield,VIC,AG-10041\n" +
      "Sara,Ahmed,0401123457,sara.ahmed@example.com,BYD Fairfield VIC,BYD Atto 3,Looking for finance options,Preston,VIC,AG-10042\n" +
      "Hamza,Malik,0402123458,hamza.malik@example.com,BYD Fairfield VIC,BYD Dolphin,Trading in 2020 Corolla,Ivanhoe,VIC,AG-10043\n" +
      "Ayesha,Raza,0403123459,ayesha.raza@example.com,BYD Fairfield VIC,BYD Sealion 6,Wants Apricity White colour,Alphington,VIC,AG-10044\n" +
      "Usman,Ali,0404123450,usman.ali@example.com,BYD Fairfield VIC,BYD Shark 6,Dual cab ute enquiry for commercial use,Heidelberg,VIC,AG-10045\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_prospects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleReset();
          onClose();
        }
      }}
    >
      <div
        className="modal"
        style={{
          width: "min(100%, 620px)",
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "16px", position: "relative" }}>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            style={{
              position: "absolute",
              right: "-4px",
              top: "-4px",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              color: "#888",
              padding: "4px",
              borderRadius: "6px",
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "19px",
              fontWeight: "700",
              color: "#111",
            }}
          >
            Import Prospects from CSV
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "12.5px",
              color: "#6b7280",
              lineHeight: 1.45,
            }}
          >
            Duplicates are detected automatically by mobile number (and Autogate ID) — only new prospects are imported. Recognised columns: First Name / Name, Last Name, Mobile, Email, Dealership, Vehicle, Notes, Suburb, State, Lead ID.
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            paddingRight: "2px",
          }}
        >
          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STATE 3: RESULTS SUMMARY VIEW (Screenshot 3)                     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {importResult ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* 3 Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                }}
              >
                {/* Imported Card */}
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "10px",
                    padding: "14px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: "700",
                      color: "#059669",
                      lineHeight: 1,
                    }}
                  >
                    {importResult.imported}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#059669",
                      marginTop: "4px",
                      fontWeight: "500",
                    }}
                  >
                    imported (new)
                  </div>
                </div>

                {/* Duplicates Card */}
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "10px",
                    padding: "14px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: "700",
                      color: "#d97706",
                      lineHeight: 1,
                    }}
                  >
                    {importResult.duplicates}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#d97706",
                      marginTop: "4px",
                      fontWeight: "500",
                    }}
                  >
                    duplicates skipped
                  </div>
                </div>

                {/* Invalid Card */}
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    padding: "14px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: "700",
                      color: "#dc2626",
                      lineHeight: 1,
                    }}
                  >
                    {importResult.invalid}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#dc2626",
                      marginTop: "4px",
                      fontWeight: "500",
                    }}
                  >
                    invalid skipped
                  </div>
                </div>
              </div>

              {/* Outcome Table */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    maxHeight: "220px",
                    overflowY: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#fafafa",
                          borderBottom: "1px solid #e5e7eb",
                          color: "#374151",
                          fontWeight: "600",
                        }}
                      >
                        <th style={{ padding: "9px 12px", width: "40%" }}>Name</th>
                        <th style={{ padding: "9px 12px", width: "32%" }}>Mobile</th>
                        <th style={{ padding: "9px 12px", width: "28%" }}>Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.results.map((item, idx) => {
                        const isSuccess = item.outcome === "imported";
                        const isDup = item.outcome === "duplicate";
                        const isInvalid = item.outcome === "invalid";

                        return (
                          <tr
                            key={idx}
                            style={{
                              borderBottom:
                                idx < importResult.results.length - 1
                                  ? "1px solid #f3f4f6"
                                  : "none",
                            }}
                          >
                            <td
                              style={{
                                padding: "9px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: "500",
                                color: "#111827",
                              }}
                            >
                              {isSuccess && (
                                <CheckCircle2
                                  size={15}
                                  style={{ color: "#059669", flexShrink: 0 }}
                                />
                              )}
                              {isDup && (
                                <AlertCircle
                                  size={15}
                                  style={{ color: "#d97706", flexShrink: 0 }}
                                />
                              )}
                              {isInvalid && (
                                <XCircle
                                  size={15}
                                  style={{ color: "#dc2626", flexShrink: 0 }}
                                />
                              )}
                              <span style={{ truncate: "true" } as any}>{item.name}</span>
                            </td>
                            <td style={{ padding: "9px 12px", color: "#4b5563" }}>
                              {item.phone || "—"}
                            </td>
                            <td
                              style={{
                                padding: "9px 12px",
                                color: isSuccess
                                  ? "#059669"
                                  : isDup
                                  ? "#d97706"
                                  : "#dc2626",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                            >
                              {item.reason || item.outcome}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ═════════════════════════════════════════════════════════════════ */
            /* STATE 1 & 2: FILE UPLOAD & PREVIEW VIEW                          */
            /* ═════════════════════════════════════════════════════════════════ */
            <>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/comma-separated-values"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: parsedRows.length > 0 ? "1.5px dashed #cf1d29" : isDragging ? "2px solid #cf1d29" : "1.5px dashed #e57373",
                  borderRadius: "12px",
                  padding: parsedRows.length > 0 ? "16px 20px" : "22px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDragging ? "#fff5f5" : parsedRows.length > 0 ? "#fdf8f8" : "#fffafa",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "center",
                }}
              >
                <UploadCloud
                  size={32}
                  style={{
                    color: "#cf1d29",
                    marginBottom: "8px",
                  }}
                />
                {parsedRows.length > 0 ? (
                  <>
                    <b style={{ fontSize: "14px", color: "#111827", marginBottom: "2px" }}>
                      {fileName}
                    </b>
                    <small style={{ color: "#6b7280", fontSize: "12px" }}>
                      {parsedRows.length} valid row{parsedRows.length === 1 ? "" : "s"} detected · click to change file
                    </small>
                  </>
                ) : (
                  <>
                    <b style={{ fontSize: "14.5px", color: "#111827", marginBottom: "3px" }}>
                      Click to choose a CSV file
                    </b>
                    <small style={{ color: "#6b7280", fontSize: "12px" }}>
                      Max 500 rows per import (or drag and drop here)
                    </small>
                  </>
                )}
              </div>

              {/* Download Sample CSV Link */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "-6px",
                }}
              >
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#cf1d29",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "2px 4px",
                    textDecoration: "underline",
                  }}
                >
                  <Download size={13} />
                  Download sample CSV template
                </button>
              </div>

              {/* Preview Table if rows loaded (Screenshot 2) */}
              {parsedRows.length > 0 && (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  <div style={{ maxHeight: "175px", overflowY: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "12.5px",
                        textAlign: "left",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "#fafafa",
                            borderBottom: "1px solid #e5e7eb",
                            color: "#374151",
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                          }}
                        >
                          <th style={{ padding: "8px 12px" }}>Name</th>
                          <th style={{ padding: "8px 12px" }}>Mobile</th>
                          <th style={{ padding: "8px 12px" }}>Vehicle / Enquiry</th>
                          <th style={{ padding: "8px 12px" }}>Dealership</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 50).map((row, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom:
                                idx < parsedRows.length - 1
                                  ? "1px solid #f3f4f6"
                                  : "none",
                            }}
                          >
                            <td
                              style={{
                                padding: "8px 12px",
                                fontWeight: "500",
                                color: "#111827",
                              }}
                            >
                              {row.name}
                            </td>
                            <td style={{ padding: "8px 12px", color: "#4b5563" }}>
                              {row.mobile || "—"}
                            </td>
                            <td style={{ padding: "8px 12px", color: "#4b5563" }}>
                              {row.vehicle || "BYD Seal"}
                            </td>
                            <td style={{ padding: "8px 12px", color: "#4b5563" }}>
                              {row.dealership || defaultDealer}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Default Dealership Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Default dealership (for rows without a dealership column) *
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={defaultDealer}
                    onChange={(e) => setDefaultDealer(e.target.value)}
                    style={{
                      width: "100%",
                      appearance: "none",
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      padding: "9px 32px 9px 12px",
                      fontSize: "13.5px",
                      color: "#111827",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {dealerships.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    {!dealerships.includes("BYD Fairfield VIC") && (
                      <option value="BYD Fairfield VIC">BYD Fairfield VIC</option>
                    )}
                  </select>
                  <ChevronDown
                    size={16}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "#6b7280",
                    }}
                  />
                </div>
              </div>

              {/* Send SMS Switch Row */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fafafa",
                  cursor: "pointer",
                }}
                onClick={() => setSendSms((prev) => !prev)}
              >
                <div>
                  <b
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "#111827",
                      marginBottom: "2px",
                    }}
                  >
                    Send opening SMS to imported prospects
                  </b>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>
                    Starts AI qualification for each newly imported lead (simulation-safe)
                  </small>
                </div>
                <div
                  style={{
                    width: "36px",
                    height: "20px",
                    borderRadius: "20px",
                    background: sendSms ? "#cf1d29" : "#d1d5db",
                    position: "relative",
                    transition: "background-color 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: "2px",
                      left: sendSms ? "18px" : "2px",
                      transition: "left 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "18px",
            paddingTop: "12px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          {importResult ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  fontSize: "13.5px",
                  fontWeight: "500",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Import another file
              </button>
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#cf1d29",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  fontSize: "13.5px",
                  fontWeight: "500",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || parsedRows.length === 0}
                onClick={handleImportSubmit}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    parsedRows.length === 0 || loading ? "#e57373" : "#cf1d29",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  color: "#fff",
                  cursor:
                    parsedRows.length === 0 || loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <span>
                    {parsedRows.length > 0
                      ? `Import ${parsedRows.length} row${
                          parsedRows.length === 1 ? "" : "s"
                        }`
                      : "Import"}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
