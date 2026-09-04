"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import {
  Dashboard,
  Pipeline,
  Conversations,
  Inventory,
  Appointments,
  Compliance,
  SettingsPage,
  ProspectDetail,
} from "./lead-centre/sections";
import {
  Sidebar,
  TopBar,
  Modal,
  ModalField,
  ModalActions,
} from "./lead-centre/shared";
import { Network, Clock, Save, Loader2 } from "lucide-react";
import {
  getDealerships,
  createDealership,
  updateDealership,
  createLead,
  type Dealership,
} from "@/lib/api";

// ── Dealership Form State ─────────────────────────────────────────────────────
const EMPTY_DEALER: Omit<Dealership, "_id"> = {
  name: "",
  legalEntity: "",
  address: "",
  suburb: "",
  state: "",
  phone: "",
  email: "",
  timezone: "Australia/Melbourne",
  smsSenderId: "",
  autogateId: "",
  autogateUsername: "",
  autogatePassword: "",
  weekdayHoursStart: "09:00",
  weekdayHoursEnd: "20:00",
  saturdayHoursStart: "09:00",
  saturdayHoursEnd: "17:00",
};

// ── Prospect Form State ───────────────────────────────────────────────────────
const EMPTY_PROSPECT = {
  firstName: "muhammad",
  lastName: "Ahmed",
  phone: "0412 345 678",
  email: "muhammad@example.com",
  dealership: "BYD Fairfield VIC",
  vehicle: "2025 BYD ATTO 1",
  enquiryDesc: "2025 BYD ATTO 1 with BYD Fairfield VIC",
  enquiryNote: "Manually added test prospect",
  sendSms: true,
};

export default function LeadCentre() {
  const [active, setActive] = useState("Dashboard");
  const [menu, setMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [modal, setModal] = useState<
    "prospect" | "csv" | "add-dealer" | "edit-dealer" | null
  >(null);
  const [editingDealership, setEditingDealership] = useState<Dealership | null>(null);
  const [dealerForm, setDealerForm] = useState<Omit<Dealership, "_id">>(EMPTY_DEALER);
  const [prospectForm, setProspectForm] = useState(EMPTY_PROSPECT);
  const [selectedProspect, setSelectedProspect] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Ref to trigger Settings page re-fetch after save
  const settingsRefreshRef = useRef<(() => void) | null>(null);

  const close = () => {
    setModal(null);
    setEditingDealership(null);
    setDealerForm(EMPTY_DEALER);
    setSaveError(null);
  };

  const openEdit = useCallback(async (dealershipName: string) => {
    try {
      const all = await getDealerships();
      const found = all.find((d) => d.name === dealershipName);
      if (found) {
        setEditingDealership(found);
        setDealerForm({ ...found } as any);
        setModal("edit-dealer");
      }
    } catch (err: any) {
      console.error("Failed to load dealership:", err.message);
    }
  }, []);

  const handleDealerSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (modal === "add-dealer") {
        await createDealership(dealerForm);
      } else if (modal === "edit-dealer" && editingDealership) {
        await updateDealership(editingDealership._id, dealerForm);
      }
      close();
      // Trigger Settings page refresh
      settingsRefreshRef.current?.();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProspectCreate = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const firstName = prospectForm.firstName || "muhammad";
      const lastName = prospectForm.lastName || "Ahmed";
      const lead = await createLead({
        name: `${firstName} ${lastName}`.trim(),
        phone: prospectForm.phone || "0412 345 678",
        email: prospectForm.email || "muhammad@example.com",
        dealer: prospectForm.dealership || "BYD Fairfield VIC",
        vehicle: prospectForm.vehicle || "2025 BYD ATTO 1",
        enquiryDesc: prospectForm.enquiryDesc || "2025 BYD ATTO 1 with BYD Fairfield VIC",
        enquiryNote: prospectForm.enquiryNote || "Manually added test prospect",
        stage: "NEW ENQUIRIES",
        status: "new",
        tag: "Contact",
        control: "AI active",
        score: 10,
        source: "Manual",
        price: "$23,990",
        paintColor: "Apricity White",
        stockNum: "6944",
      });

      close();
      setSelectedProspect({
        _id: lead._id,
        id: lead._id,
        firstName,
        lastName,
        phone: lead.phone,
        email: lead.email,
        dealership: lead.dealer,
        vehicle: lead.vehicle,
        enquiryDesc: lead.enquiryDesc,
        enquiryNote: lead.enquiryNote,
        stage: lead.stage,
        status: lead.control,
        stockNum: lead.stockNum,
        price: lead.price,
        color: lead.paintColor,
      });
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof Omit<Dealership, "_id">) => ({
    value: (dealerForm as any)[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setDealerForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const content = useMemo(() => {
    if (selectedProspect) {
      return (
        <ProspectDetail
          prospect={selectedProspect}
          onBack={() => setSelectedProspect(null)}
        />
      );
    }

    return (
      ({
        Dashboard: (
          <Dashboard
            onNavigate={(section) => {
              setSelectedProspect(null);
              setActive(section);
            }}
            onSelectProspect={(p) => setSelectedProspect(p)}
          />
        ),
        "Leads Pipeline": (
          <Pipeline
            onModal={setModal}
            onSelectProspect={(p) => setSelectedProspect(p)}
          />
        ),
        Conversations: (
          <Conversations onSelectProspect={(p) => setSelectedProspect(p)} />
        ),
        Inventory: <Inventory />,
        Appointments: (
          <Appointments onSelectProspect={(p) => setSelectedProspect(p)} />
        ),
        Compliance: <Compliance onSelectProspect={(p) => setSelectedProspect(p)} />,
        Settings: (
          <SettingsPage
            onAdd={() => {
              setDealerForm(EMPTY_DEALER);
              setModal("add-dealer");
            }}
            onEdit={openEdit}
          />
        ),
      }) as Record<string, React.ReactNode>
    )[active];
  }, [active, openEdit, selectedProspect]);

  return (
    <div className="app-shell">
      <Sidebar
        active={selectedProspect ? "" : active}
        onSelect={(tab) => {
          setSelectedProspect(null);
          setActive(tab);
        }}
        open={menu}
        onClose={() => setMenu(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />
      <main className={`main ${collapsed ? "collapsed" : ""}`}>
        <TopBar onMenu={() => setMenu(true)} />
        <div className="content">{content}</div>
      </main>

      {/* ── Add / Edit Test Prospect ── */}
      {modal === "prospect" && (
        <Modal
          title="Add Test Prospect"
          description="Manually create a prospect to test the full SMS qualification flow. Test prospects always run in simulation — no real SMS is delivered."
          onClose={close}
        >
          <div className="modal-form">
            <ModalField
              label="First name *"
              placeholder="e.g. muhammad"
              value={prospectForm.firstName}
              onChange={(e) =>
                setProspectForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
            <ModalField
              label="Last name"
              placeholder="e.g. Ahmed"
              value={prospectForm.lastName}
              onChange={(e) =>
                setProspectForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />
            <ModalField
              label="Mobile number *"
              placeholder="0412 345 678"
              value={prospectForm.phone}
              onChange={(e) =>
                setProspectForm((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
            <ModalField
              label="Email"
              placeholder="alex@example.com"
              value={prospectForm.email}
              onChange={(e) =>
                setProspectForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <ModalField
              label="Dealership *"
              placeholder="BYD Fairfield VIC"
              value={prospectForm.dealership}
              onChange={(e) =>
                setProspectForm((prev) => ({ ...prev, dealership: e.target.value }))
              }
            />
            <ModalField
              label="Vehicle of interest"
              placeholder="2025 BYD ATTO 1"
              value={prospectForm.vehicle}
              onChange={(e) =>
                setProspectForm((prev) => ({ ...prev, vehicle: e.target.value }))
              }
            />
            <ModalField
              label="Enquiry description"
              placeholder="e.g. 2025 BYD ATTO 1 with BYD Fairfield VIC"
              value={prospectForm.enquiryDesc}
              onChange={(e) =>
                setProspectForm((prev) => ({ ...prev, enquiryDesc: e.target.value }))
              }
              wide
            />
            <ModalField
              label="Enquiry note (what the prospect asked)"
              placeholder="e.g. Is this still available?"
              value={prospectForm.enquiryNote}
              onChange={(e) =>
                setProspectForm((prev) => ({ ...prev, enquiryNote: e.target.value }))
              }
              wide
            />
            <div
              className="simulation"
              style={{ cursor: "pointer", userSelect: "none" }}
              onClick={() =>
                setProspectForm((prev) => ({ ...prev, sendSms: !prev.sendSms }))
              }
            >
              <div>
                <b>Send opening SMS immediately</b>
                <small>
                  Starts the AI qualification conversation as soon as the prospect is created
                </small>
              </div>
              <span className={`toggle ${prospectForm.sendSms ? "on" : ""}`}>
                <i />
              </span>
            </div>
          </div>
          {saveError && (
            <p style={{ color: "#cf1d29", fontSize: "13px", marginTop: "8px" }}>{saveError}</p>
          )}
          <ModalActions
            onClose={close}
            onPrimary={handleProspectCreate}
            primary={saving ? "Creating..." : "Create Prospect"}
            disabled={saving}
          />
        </Modal>
      )}

      {/* ── CSV Import ── */}
      {modal === "csv" && (
        <Modal
          title="Import Prospects from CSV"
          description="Duplicates are detected automatically by mobile number (and Autogate ID) — only new prospects are imported. Recognised columns: First Name / Name, Last Name, Mobile, Email, Dealership, Vehicle, Notes, Suburb, State, Lead ID."
          onClose={close}
        >
          <div className="upload-zone">
            <Network size={27} />
            <b>Click to choose a CSV file</b>
            <small>Max 500 rows per import</small>
          </div>
          <ModalField
            label="Default dealership (for rows without a dealership column) *"
            placeholder="Select dealership"
          />
          <div className="simulation">
            <div>
              <b>Send opening SMS to imported prospects</b>
              <small>Starts AI qualification for each newly imported lead (simulation-safe)</small>
            </div>
            <span className="toggle">
              <i />
            </span>
          </div>
          <ModalActions onClose={close} primary="Import" />
        </Modal>
      )}

      {/* ── Add Dealership ── */}
      {modal === "add-dealer" && (
        <Modal title="Add Dealership" onClose={close}>
          <div className="modal-form-dealer">
            <div className="dealer-fields-grid">
              <label><span>Dealership Name</span><input {...field("name")} /></label>
              <label><span>Legal Entity Name (ACMA sender ID)</span><input {...field("legalEntity")} /></label>
              <label><span>Address</span><input {...field("address")} /></label>
              <label><span>Suburb</span><input {...field("suburb")} /></label>
              <label><span>State (VIC/NSW...)</span><input {...field("state")} /></label>
              <label><span>Phone</span><input {...field("phone")} /></label>
              <label><span>Email</span><input {...field("email")} /></label>
              <label><span>Timezone (IANA)</span><input {...field("timezone")} /></label>
              <label><span>SMS Sender ID</span><input {...field("smsSenderId")} /></label>
              <label><span>Autogate Seller ID</span><input {...field("autogateId")} /></label>
              <label><span>Autogate Username</span><input {...field("autogateUsername")} /></label>
              <label><span>Autogate Password</span><input type="password" {...field("autogatePassword")} /></label>
            </div>

            <div className="dealer-hours-row">
              <div className="hours-group">
                <span className="hours-label">Weekday Contact Hours</span>
                <div className="time-range-picker">
                  <div className="time-input-wrap">
                    <input type="text" {...field("weekdayHoursStart")} />
                    <Clock size={15} className="time-icon" />
                  </div>
                  <span className="time-sep">–</span>
                  <div className="time-input-wrap">
                    <input type="text" {...field("weekdayHoursEnd")} />
                    <Clock size={15} className="time-icon" />
                  </div>
                </div>
              </div>
              <div className="hours-group">
                <span className="hours-label">Saturday Contact Hours</span>
                <div className="time-range-picker">
                  <div className="time-input-wrap">
                    <input type="text" {...field("saturdayHoursStart")} />
                    <Clock size={15} className="time-icon" />
                  </div>
                  <span className="time-sep">–</span>
                  <div className="time-input-wrap">
                    <input type="text" {...field("saturdayHoursEnd")} />
                    <Clock size={15} className="time-icon" />
                  </div>
                </div>
              </div>
            </div>

            {saveError && (
              <p style={{ color: "#cf1d29", fontSize: "13px", marginTop: "8px" }}>{saveError}</p>
            )}

            <div className="dealer-submit-wrap">
              <button
                type="button"
                className="dealer-submit-btn"
                onClick={handleDealerSave}
                disabled={saving}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{saving ? "Saving..." : "Add Dealership"}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit Dealership ── */}
      {modal === "edit-dealer" && editingDealership && (
        <Modal title={`Edit ${editingDealership.name}`} onClose={close}>
          <div className="modal-form-dealer">
            <div className="dealer-fields-grid">
              <label><span>Dealership Name</span><input {...field("name")} /></label>
              <label><span>Legal Entity Name (ACMA sender ID)</span><input {...field("legalEntity")} /></label>
              <label><span>Address</span><input {...field("address")} /></label>
              <label><span>Suburb</span><input {...field("suburb")} /></label>
              <label><span>State (VIC/NSW...)</span><input {...field("state")} /></label>
              <label><span>Phone</span><input {...field("phone")} /></label>
              <label><span>Email</span><input {...field("email")} /></label>
              <label><span>Timezone (IANA)</span><input {...field("timezone")} /></label>
              <label><span>SMS Sender ID</span><input {...field("smsSenderId")} /></label>
              <label><span>Autogate Seller ID</span><input {...field("autogateId")} /></label>
              <label><span>Autogate Username</span><input {...field("autogateUsername")} /></label>
              <label><span>Autogate Password</span><input defaultValue="•••••••• (unchanged)" disabled /></label>
            </div>

            <div className="dealer-hours-row">
              <div className="hours-group">
                <span className="hours-label">Weekday Contact Hours</span>
                <div className="time-range-picker">
                  <div className="time-input-wrap">
                    <input type="text" {...field("weekdayHoursStart")} />
                    <Clock size={15} className="time-icon" />
                  </div>
                  <span className="time-sep">–</span>
                  <div className="time-input-wrap">
                    <input type="text" {...field("weekdayHoursEnd")} />
                    <Clock size={15} className="time-icon" />
                  </div>
                </div>
              </div>
              <div className="hours-group">
                <span className="hours-label">Saturday Contact Hours</span>
                <div className="time-range-picker">
                  <div className="time-input-wrap">
                    <input type="text" {...field("saturdayHoursStart")} />
                    <Clock size={15} className="time-icon" />
                  </div>
                  <span className="time-sep">–</span>
                  <div className="time-input-wrap">
                    <input type="text" {...field("saturdayHoursEnd")} />
                    <Clock size={15} className="time-icon" />
                  </div>
                </div>
              </div>
            </div>

            {saveError && (
              <p style={{ color: "#cf1d29", fontSize: "13px", marginTop: "8px" }}>{saveError}</p>
            )}

            <div className="dealer-submit-wrap">
              <button
                type="button"
                className="dealer-submit-btn"
                onClick={handleDealerSave}
                disabled={saving}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{saving ? "Saving..." : "Update Dealership"}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
