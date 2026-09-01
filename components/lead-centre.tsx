"use client";

import { useMemo, useState } from "react";
import { getSection } from "./lead-centre/registry";
import {
  Dashboard,
  Pipeline,
  Conversations,
  Inventory,
  Appointments,
  Compliance,
  SettingsPage,
} from "./lead-centre/sections";
import {
  Sidebar,
  TopBar,
  Modal,
  ModalField,
  ModalActions,
} from "./lead-centre/shared";
import { Network, Clock, Save } from "lucide-react";
import { dealershipDetails } from "./lead-centre/data";

export default function LeadCentre() {
  const [active, setActive] = useState("Dashboard");
  const [menu, setMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [modal, setModal] = useState<
    "prospect" | "csv" | "add-dealer" | "edit-dealer" | null
  >(null);
  const [editingDealership, setEditingDealership] = useState<string | null>(
    null,
  );
  const close = () => {
    setModal(null);
    setEditingDealership(null);
  };
  const content = useMemo(
    () =>
      (
        ({
          Dashboard: <Dashboard />,
          "Leads Pipeline": <Pipeline onModal={setModal} />,
          Conversations: <Conversations />,
          Inventory: <Inventory />,
          Appointments: <Appointments />,
          Compliance: <Compliance />,
          Settings: (
            <SettingsPage
              onAdd={() => setModal("add-dealer")}
              onEdit={(dealershipName) => {
                setEditingDealership(dealershipName);
                setModal("edit-dealer");
              }}
            />
          ),
        }) as Record<string, React.ReactNode>
      )[active],
    [active],
  );
  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onSelect={setActive}
        open={menu}
        onClose={() => setMenu(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />
      <main className={`main ${collapsed ? "collapsed" : ""}`}>
        <TopBar onMenu={() => setMenu(true)} />
        <div className="content">{content}</div>
      </main>
      {modal === "prospect" && (
        <Modal
          title="Add Test Prospect"
          description="Manually create a prospect to test the full SMS qualification flow. Test prospects always run in simulation — no real SMS is delivered."
          onClose={close}
        >
          <div className="modal-form">
            <ModalField label="First name *" placeholder="Alex" />
            <ModalField label="Last name" placeholder="Taylor" />
            <ModalField label="Mobile number *" placeholder="0491 570 199" />
            <ModalField label="Email" placeholder="alex@example.com" />
            <ModalField label="Dealership *" placeholder="Select dealership" />
            <ModalField
              label="Vehicle of interest"
              placeholder="No specific vehicle / general enquiry"
            />
            <ModalField
              label="Enquiry description"
              placeholder="e.g. 2025 BYD SEALION 6"
              wide
            />
            <ModalField
              label="Enquiry note (what the prospect asked)"
              placeholder="e.g. Is this still available?"
              wide
            />
            <div className="simulation">
              <div>
                <b>Send opening SMS immediately</b>
                <small>
                  Starts the AI qualification conversation as soon as the
                  prospect is created
                </small>
              </div>
              <span className="toggle on">
                <i />
              </span>
            </div>
          </div>
          <ModalActions onClose={close} primary="Create Prospect" />
        </Modal>
      )}
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
              <small>
                Starts AI qualification for each newly imported lead
                (simulation-safe)
              </small>
            </div>
            <span className="toggle">
              <i />
            </span>
          </div>
          <ModalActions onClose={close} primary="Import" />
        </Modal>
      )}
      {modal === "add-dealer" && (
        <Modal title="Add Dealership" onClose={close}>
          <div className="modal-form-dealer">
            <div className="dealer-fields-grid">
              <label>
                <span>Dealership Name</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Legal Entity Name (ACMA sender ID)</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Address</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Suburb</span>
                <input placeholder="" />
              </label>
              <label>
                <span>State (VIC/NSW...)</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Phone</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Email</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Timezone (IANA)</span>
                <input defaultValue="Australia/Melbourne" />
              </label>
              <label>
                <span>SMS Sender ID</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Autogate Seller ID</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Autogate Username</span>
                <input placeholder="" />
              </label>
              <label>
                <span>Autogate Password</span>
                <input type="password" placeholder="" />
              </label>
            </div>

            <div className="dealer-hours-row">
              <div className="hours-group">
                <span className="hours-label">Weekday Contact Hours</span>
                <div className="time-range-picker">
                  <div className="time-input-wrap">
                    <input type="text" defaultValue="09:00" />
                    <Clock size={15} className="time-icon" />
                  </div>
                  <span className="time-sep">–</span>
                  <div className="time-input-wrap">
                    <input type="text" defaultValue="08:00" />
                    <Clock size={15} className="time-icon" />
                  </div>
                </div>
              </div>

              <div className="hours-group">
                <span className="hours-label">Saturday Contact Hours</span>
                <div className="time-range-picker">
                  <div className="time-input-wrap">
                    <input type="text" defaultValue="09:00" />
                    <Clock size={15} className="time-icon" />
                  </div>
                  <span className="time-sep">–</span>
                  <div className="time-input-wrap">
                    <input type="text" defaultValue="05:00" />
                    <Clock size={15} className="time-icon" />
                  </div>
                </div>
              </div>
            </div>

            <div className="dealer-submit-wrap">
              <button
                type="button"
                className="dealer-submit-btn"
                onClick={close}
              >
                <Save size={16} />
                <span>Add Dealership</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
      {modal === "edit-dealer" &&
        editingDealership &&
        dealershipDetails[editingDealership] && (
          <Modal title={`Edit ${editingDealership}`} onClose={close}>
            <div className="modal-form-dealer">
              <div className="dealer-fields-grid">
                <label>
                  <span>Dealership Name</span>
                  <input
                    defaultValue={dealershipDetails[editingDealership].name}
                  />
                </label>
                <label>
                  <span>Legal Entity Name (ACMA sender ID)</span>
                  <input
                    defaultValue={
                      dealershipDetails[editingDealership].legalEntity
                    }
                  />
                </label>
                <label>
                  <span>Address</span>
                  <input
                    defaultValue={dealershipDetails[editingDealership].address}
                  />
                </label>
                <label>
                  <span>Suburb</span>
                  <input
                    defaultValue={dealershipDetails[editingDealership].suburb}
                  />
                </label>
                <label>
                  <span>State (VIC/NSW...)</span>
                  <input
                    defaultValue={dealershipDetails[editingDealership].state}
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    defaultValue={dealershipDetails[editingDealership].phone}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    defaultValue={dealershipDetails[editingDealership].email}
                  />
                </label>
                <label>
                  <span>Timezone (IANA)</span>
                  <input
                    defaultValue={dealershipDetails[editingDealership].timezone}
                  />
                </label>
                <label>
                  <span>SMS Sender ID</span>
                  <input
                    defaultValue={
                      dealershipDetails[editingDealership].smsSenderId
                    }
                  />
                </label>
                <label>
                  <span>Autogate Seller ID</span>
                  <input
                    defaultValue={
                      dealershipDetails[editingDealership].autogateId
                    }
                  />
                </label>
                <label>
                  <span>Autogate Username</span>
                  <input
                    defaultValue={
                      dealershipDetails[editingDealership].autogateUsername
                    }
                  />
                </label>
                <label>
                  <span>Autogate Password</span>
                  <input defaultValue="•••••••• (unchanged)" disabled />
                </label>
              </div>

              <div className="dealer-hours-row">
                <div className="hours-group">
                  <span className="hours-label">Weekday Contact Hours</span>
                  <div className="time-range-picker">
                    <div className="time-input-wrap">
                      <input
                        type="text"
                        defaultValue={
                          dealershipDetails[editingDealership]
                            .weekdayHoursStart || "09:00"
                        }
                      />
                      <Clock size={15} className="time-icon" />
                    </div>
                    <span className="time-sep">–</span>
                    <div className="time-input-wrap">
                      <input
                        type="text"
                        defaultValue={
                          dealershipDetails[editingDealership]
                            .weekdayHoursEnd || "08:00"
                        }
                      />
                      <Clock size={15} className="time-icon" />
                    </div>
                  </div>
                </div>

                <div className="hours-group">
                  <span className="hours-label">Saturday Contact Hours</span>
                  <div className="time-range-picker">
                    <div className="time-input-wrap">
                      <input
                        type="text"
                        defaultValue={
                          dealershipDetails[editingDealership]
                            .saturdayHoursStart || "09:00"
                        }
                      />
                      <Clock size={15} className="time-icon" />
                    </div>
                    <span className="time-sep">–</span>
                    <div className="time-input-wrap">
                      <input
                        type="text"
                        defaultValue={
                          dealershipDetails[editingDealership]
                            .saturdayHoursEnd || "05:00"
                        }
                      />
                      <Clock size={15} className="time-icon" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="dealer-submit-wrap">
                <button
                  type="button"
                  className="dealer-submit-btn"
                  onClick={close}
                >
                  <Save size={16} />
                  <span>Update Dealership</span>
                </button>
              </div>
            </div>
          </Modal>
        )}
    </div>
  );
}
