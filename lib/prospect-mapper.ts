import type { Lead } from "@/lib/api";

export function mapLeadToProspect(l: Lead) {
  const parts = (l.name || "").trim().split(" ");
  const firstName = parts[0] || l.name || "Customer";
  const lastName = parts.slice(1).join(" ") || "";

  return {
    _id: l._id,
    id: l._id,
    firstName,
    lastName,
    phone: l.phone || "",
    email: l.email || "",
    dealership: l.dealer || "BYD Fairfield VIC",
    vehicle: l.vehicle || "2025 BYD ATTO 1",
    enquiryDesc: l.enquiryDesc || `${l.vehicle} with ${l.dealer}`,
    enquiryNote: l.enquiryNote || "",
    stage: l.stage || "NEW ENQUIRIES",
    status: l.control || "AI active",
    stockNum: l.stockNum || "",
    price: l.price || "$23,990",
    color: l.paintColor || "Apricity White",
  };
}

export function createProspectFromMetadata(data: {
  id?: string;
  _id?: string;
  name?: string;
  phone?: string;
  dealer?: string;
  dealership?: string;
  vehicle?: string;
  status?: string;
  control?: string;
}) {
  const rawName = data.name || "Customer";
  const parts = rawName.trim().split(" ");
  const firstName = parts[0] || rawName;
  const lastName = parts.slice(1).join(" ") || "";
  const dealer = data.dealership || data.dealer || "BYD Fairfield VIC";

  return {
    _id: data._id || data.id,
    id: data._id || data.id || `MANUAL-${Date.now()}`,
    firstName,
    lastName,
    phone: data.phone || "",
    email: "",
    dealership: dealer,
    vehicle: data.vehicle || "2025 BYD ATTO 1",
    enquiryDesc: `${data.vehicle || "BYD vehicle"} with ${dealer}`,
    enquiryNote: "",
    stage: "NEW ENQUIRIES",
    status: data.control || "AI active",
    stockNum: "",
    price: "$23,990",
    color: "Apricity White",
  };
}
