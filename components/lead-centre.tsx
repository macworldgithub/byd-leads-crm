"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
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
import { ImportCsvModal } from "./lead-centre/import-csv-modal";
import { Network, Clock, Save, Loader2 } from "lucide-react";
import {
  getDealerships,
  createDealership,
  updateDealership,
  createLead,
  getLeadDealerships,
  type Dealership,
  getToken,
  getLockedSite,
  getStoredUser,
  clearToken,
} from "@/lib/api";
import { LoginView } from "./auth/LoginView";

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

const EMPTY_PROSPECT = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  dealership: "",
  vehicle: "",
  enquiryDesc: "",
  enquiryNote: "",
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
  const [refreshKey, setRefreshKey] = useState(0);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return Boolean(getToken());
    }
    return false;
  });
  const [user, setUser] = useState<any>(() => getStoredUser());
  const lockedSite = (typeof window !== "undefined" ? getLockedSite() : "") || (user?.locked_site || "");

  // Overall Location / Yard Filter State
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const lock = getLockedSite();
      if (lock) return lock;
      return localStorage.getItem("byd_leads_yard") || "All Locations";
    }
    return "All Locations";
  });
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    if (lockedSite) {
      setSelectedLocation(lockedSite);
      setLocations([lockedSite]);
      return;
    }
    getLeadDealerships()
      .then((dealers) => {
        const fallback = [
          "BYD Melbourne City",
          "BYD Caroline Springs",
          "Holding Yard VIC",
          "BYD Fairfield",
          "BYD Nunawading",
          "BYD Wodonga",
          "BYD Wollongong",
          "BYD Doncaster",
          "BYD Haberfield",
          "BYD Dealership",
        ];
        const combined = Array.from(new Set([...dealers, ...fallback]))
          .filter(Boolean)
          .sort();
        setLocations(combined);
      })
      .catch(() => {});
  }, [refreshKey, lockedSite]);

  const handleLocationChange = (newLoc: string) => {
    if (lockedSite) return;
    setSelectedLocation(newLoc);
    if (typeof window !== "undefined") {
      localStorage.setItem("byd_leads_yard", newLoc);
    }
  };

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Ref to trigger Settings page re-fetch after save
  const settingsRefreshRef = useRef<(() => void) | null>(null);

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
    settingsRefreshRef.current?.();
  };

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
      const firstName = prospectForm.firstName;
      const lastName = prospectForm.lastName;
      const lead = await createLead({
        name: `${firstName} ${lastName}`.trim(),
        phone: prospectForm.phone,
        email: prospectForm.email,
        dealer: prospectForm.dealership,
        vehicle: prospectForm.vehicle,
        enquiryDesc: prospectForm.enquiryDesc,
        enquiryNote: prospectForm.enquiryNote,
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
      triggerRefresh();
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

    const effectiveLocation = lockedSite || selectedLocation;
    const activeYard = effectiveLocation !== "All Locations" ? effectiveLocation : "";

    return (
      ({
        Dashboard: (
          <Dashboard
            key={`${refreshKey}-${effectiveLocation}`}
            locationFilter={activeYard}
            onClearFilter={() => handleLocationChange("All Locations")}
            onNavigate={(section) => {
              setSelectedProspect(null);
              setActive(section);
            }}
            onSelectProspect={(p) => setSelectedProspect(p)}
          />
        ),
        "Leads Pipeline": (
          <Pipeline
            key={`${refreshKey}-${effectiveLocation}`}
            locationFilter={activeYard}
            onLocationChange={handleLocationChange}
            onModal={setModal}
            onSelectProspect={(p) => setSelectedProspect(p)}
          />
        ),
        Conversations: (
          <Conversations
            key={`${refreshKey}-${effectiveLocation}`}
            locationFilter={activeYard}
            onClearFilter={() => handleLocationChange("All Locations")}
            onSelectProspect={(p) => setSelectedProspect(p)}
          />
        ),
        Inventory: (
          <Inventory
            key={`${refreshKey}-${effectiveLocation}`}
            locationFilter={activeYard}
            onLocationChange={handleLocationChange}
          />
        ),
        Appointments: (
          <Appointments
            key={`${refreshKey}-${effectiveLocation}`}
            locationFilter={activeYard}
            onLocationChange={handleLocationChange}
            onSelectProspect={(p) => setSelectedProspect(p)}
          />
        ),
        Compliance: (
          <Compliance
            key={refreshKey}
            onSelectProspect={(p) => setSelectedProspect(p)}
          />
        ),
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
  }, [active, openEdit, selectedProspect, refreshKey, selectedLocation, lockedSite]);

  if (!isAuthenticated) {
    return (
      <LoginView
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          setIsAuthenticated(true);
          const lock = loggedUser?.locked_site || (typeof window !== "undefined" ? getLockedSite() : "");
          if (lock) {
            setSelectedLocation(lock);
          }
        }}
      />
    );
  }

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
        user={user}
      />
      <main className={`main ${collapsed ? "collapsed" : ""}`}>
        <TopBar
          onMenu={() => setMenu(true)}
          selectedLocation={lockedSite || selectedLocation}
          onLocationChange={handleLocationChange}
          locations={lockedSite ? [lockedSite] : locations}
          user={user}
          lockedSite={lockedSite}
          onLogout={handleLogout}
        />
        <div className="content">{content}</div>
      </main>

      {/* ── Add Prospect ── */}
      {modal === "prospect" && (
        <Modal title="Add Prospect" onClose={close}>
          <div className="modal-form">
            <label>
              <span>First Name</span>
              <input
                value={prospectForm.firstName}
                onChange={(e) =>
                  setProspectForm((p) => ({ ...p, firstName: e.target.value }))
                }
                placeholder="e.g. Sarah"
              />
            </label>
            <label>
              <span>Last Name</span>
              <input
                value={prospectForm.lastName}
                onChange={(e) =>
                  setProspectForm((p) => ({ ...p, lastName: e.target.value }))
                }
                placeholder="e.g. Jenkins"
              />
            </label>
            <label>
              <span>Mobile Phone</span>
              <input
                value={prospectForm.phone}
                onChange={(e) =>
                  setProspectForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="e.g. 0412 345 678"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                value={prospectForm.email}
                onChange={(e) =>
                  setProspectForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="e.g. sarah.j@example.com"
              />
            </label>
            <label>
              <span>Dealership</span>
              <input
                value={prospectForm.dealership}
                onChange={(e) =>
                  setProspectForm((p) => ({ ...p, dealership: e.target.value }))
                }
                placeholder="e.g. BYD Fairfield VIC"
              />
            </label>
            <label>
              <span>Vehicle of Interest</span>
              <input
                value={prospectForm.vehicle}
                onChange={(e) =>
                  setProspectForm((p) => ({ ...p, vehicle: e.target.value }))
                }
                placeholder="e.g. 2025 BYD SHARK 6"
              />
            </label>
            <label className="wide-field">
              <span>Enquiry Description</span>
              <input
                value={prospectForm.enquiryDesc}
                onChange={(e) =>
                  setProspectForm((p) => ({ ...p, enquiryDesc: e.target.value }))
                }
                placeholder="e.g. Interested in test drive this Saturday"
              />
            </label>
            <label className="wide-field">
              <span>Internal Notes</span>
              <input
                value={prospectForm.enquiryNote}
                onChange={(e) =>
                  setProspectForm((p) => ({ ...p, enquiryNote: e.target.value }))
                }
                placeholder="e.g. Pre-approved finance, trade-in: 2019 RAV4"
              />
            </label>
            <div
              className="simulation wide-field"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <b>Send opening SMS immediately</b>
                <small>
                  Starts the AI qualification conversation as soon as the prospect is created
                </small>
              </div>
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

      {/* ── CSV Import Modal ── */}
      <ImportCsvModal
        isOpen={modal === "csv"}
        onClose={close}
        onSuccess={triggerRefresh}
      />

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
