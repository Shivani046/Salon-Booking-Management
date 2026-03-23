"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const ADMIN_SESSION_KEY = "admin:isLoggedIn";

const COLORS = {
  olive: "#5A5E27",
  burgundy: "#640017",
  chocolate: "#2F1B1A",
  ivory: "#EFEFC9",
} as const;

type AppointmentStatus = "scheduled" | "cancelled";
type Tab = "appointments" | "staff";

type Appointment = {
  appId: number;
  custId: number;
  service: string;
  staff: string | null;
  appDate: string; // ISO
  appTime: string;
  amount: string | null;
  status: string;
  customer: { custId: number; name: string; phoneNo: string };
};

type StaffRow = {
  staffId: number;
  name: string;
  services?: { serviceId: number; type: string; category?: string | null }[];
};

type CustomerRow = {
  custId: number;
  name: string;
  phoneNo: string;
  emailId: string;
};

type ServiceRow = {
  serviceId: number;
  type: string;
  category: string | null;
};

type AppointmentDraft = {
  custId: string;
  service: string; // service.type
  staff: string; // staff.name OR "ANY STAFF"
  appDate: string; // YYYY-MM-DD
  appTime: string; // "10:30 AM"
  amount: string; // "1200/-"
  status: AppointmentStatus;
};

type Modal =
  | { open: false }
  | { open: true; type: "createAppt" }
  | { open: true; type: "editAppt"; id: number }
  | { open: true; type: "deleteAppt"; id: number };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

function useLocalStorageString(key: string): string | null {
  const subscribe = (onStoreChange: () => void) => {
    const handler = () => onStoreChange();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  };
  const getServerSnapshot = () => null;
  const getSnapshot = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export default function AdminPage() {
  const router = useRouter();

  // Auth (SSR-safe)
  const sessionValue = useLocalStorageString(ADMIN_SESSION_KEY);
  const authReady = sessionValue !== null;
  const isAuthed = sessionValue === "true";

  // UI state
  const [tab, setTab] = useState<Tab>("appointments");
  const [modal, setModal] = useState<Modal>({ open: false });

  // DB state
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);

  const [stats, setStats] = useState<{ todaysAppointments: number; todaysRevenue: number; activeStaff: number } | null>(
    null
  );

  const [loadingAppts, setLoadingAppts] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Draft
  const [apptDraft, setApptDraft] = useState<AppointmentDraft>(() => ({
    custId: "",
    service: "",
    staff: "ANY STAFF",
    appDate: toYmd(new Date()),
    appTime: "10:00 AM",
    amount: "",
    status: "scheduled",
  }));

  // ✅ FILTER: staff list based on selected service
  const staffForSelectedService = useMemo(() => {
    const selectedService = apptDraft.service?.trim();
    if (!selectedService) return staff;

    return staff.filter((s) => (s.services ?? []).some((svc) => svc.type === selectedService));
  }, [staff, apptDraft.service]);

  // Redirect
  useEffect(() => {
    if (authReady && !isAuthed) router.replace("/admin/login");
  }, [authReady, isAuthed, router]);

  function logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    router.push("/admin/login");
  }

  async function fetchJSON(url: string, init?: RequestInit) {
    const res = await fetch(url, init);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed ${res.status}: ${text}`);
    }
    return res.json();
  }

  async function loadStats() {
    setLoadingStats(true);
    try {
      const data = await fetchJSON("/api/admin/stats");
      setStats({
        todaysAppointments: Number(data?.todaysAppointments ?? 0),
        todaysRevenue: Number(data?.todaysRevenue ?? 0),
        activeStaff: Number(data?.activeStaff ?? 0),
      });
    } finally {
      setLoadingStats(false);
    }
  }

  async function loadAppointments() {
    setLoadingAppts(true);
    try {
      const data = await fetchJSON("/api/admin/appointments");
      setAppts(Array.isArray(data) ? data : []);
    } finally {
      setLoadingAppts(false);
    }
  }

  async function loadStaff() {
    setLoadingStaff(true);
    try {
      const data = await fetchJSON("/api/admin/staff");
      setStaff(Array.isArray(data) ? data : []);
    } finally {
      setLoadingStaff(false);
    }
  }

  async function loadCustomers() {
    setLoadingCustomers(true);
    try {
      const data = await fetchJSON("/api/admin/customers");
      setCustomers(Array.isArray(data) ? data : []);
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function loadServices() {
    setLoadingServices(true);
    try {
      const data = await fetchJSON("/api/admin/services");
      setServices(Array.isArray(data) ? data : []);
    } finally {
      setLoadingServices(false);
    }
  }

  async function refreshAll() {
    await Promise.all([loadStats(), loadAppointments(), loadStaff(), loadCustomers(), loadServices()]);
  }

  // initial load
  useEffect(() => {
    if (!isAuthed) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  // Modal helpers
  async function openCreateAppt() {
    // Ensure dropdowns have data
    if (customers.length === 0) await loadCustomers();
    if (services.length === 0) await loadServices();
    if (staff.length === 0) await loadStaff();

    const firstService = services[0]?.type ?? "";
    const validStaff = firstService
      ? staff.filter((s) => (s.services ?? []).some((svc) => svc.type === firstService))
      : staff;

    setApptDraft({
      custId: customers[0] ? String(customers[0].custId) : "",
      service: firstService,
      staff: validStaff[0]?.name ?? "ANY STAFF",
      appDate: toYmd(new Date()),
      appTime: "10:00 AM",
      amount: "",
      status: "scheduled",
    });

    setModal({ open: true, type: "createAppt" });
  }

  async function openEditAppt(appId: number) {
    const a = appts.find((x) => x.appId === appId);
    if (!a) return;

    if (customers.length === 0) await loadCustomers();
    if (services.length === 0) await loadServices();
    if (staff.length === 0) await loadStaff();

    // If stored staff doesn't match service anymore, pick the first valid one
    const validStaffForService = a.service
      ? staff.filter((s) => (s.services ?? []).some((svc) => svc.type === a.service))
      : staff;

    const nextStaff =
      a.staff && validStaffForService.some((s) => s.name === a.staff)
        ? a.staff
        : validStaffForService[0]?.name ?? "ANY STAFF";

    setApptDraft({
      custId: String(a.custId),
      service: a.service ?? "",
      staff: nextStaff,
      appDate: toYmd(new Date(a.appDate)),
      appTime: a.appTime ?? "10:00 AM",
      amount: a.amount ?? "",
      status: (a.status === "cancelled" ? "cancelled" : "scheduled") as AppointmentStatus,
    });

    setModal({ open: true, type: "editAppt", id: appId });
  }

  async function saveApptFromDraft(appId?: number) {
    if (!apptDraft.custId) return alert("Select customer.");
    if (!apptDraft.service.trim()) return alert("Select service.");
    if (!apptDraft.appDate) return alert("Select date.");
    if (!apptDraft.appTime.trim()) return alert("Enter time.");

    const payload = {
      custId: Number(apptDraft.custId),
      service: apptDraft.service.trim(),
      staff: apptDraft.staff.trim() === "ANY STAFF" ? null : apptDraft.staff.trim(),
      appDate: apptDraft.appDate,
      appTime: apptDraft.appTime.trim(),
      amount: apptDraft.amount.trim() ? apptDraft.amount.trim() : null,
      status: apptDraft.status,
    };

    try {
      if (!appId) {
        await fetchJSON("/api/admin/appointments", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJSON(`/api/admin/appointments/${appId}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setModal({ open: false });
      await refreshAll();
    } catch (e: any) {
      alert(e?.message ?? "Failed to save appointment");
    }
  }

  async function deleteAppt(appId: number) {
    try {
      await fetchJSON(`/api/admin/appointments/${appId}`, { method: "DELETE" });
      setModal({ open: false });
      await refreshAll();
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete appointment");
    }
  }

  // Returns last (NO hooks below these returns)
  if (!authReady) {
    return (
      <main style={{ minHeight: "100vh", background: COLORS.ivory, color: COLORS.chocolate, padding: 24 }}>
        <div style={{ fontWeight: 900, letterSpacing: "0.12em" }}>Loading admin…</div>
      </main>
    );
  }
  if (!isAuthed) return null;

  return (
    <main style={{ minHeight: "100vh", background: COLORS.ivory, color: COLORS.chocolate }}>
      <header style={topBar}>
        <div style={wrap}>
          <div>
            <div style={brand}>ERAILE BEAUTY</div>
            <div style={brandSub}>Admin Dashboard</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button style={tab === "appointments" ? tabBtnActive : tabBtn} onClick={() => setTab("appointments")}>
              Appointments
            </button>
            <button style={tab === "staff" ? tabBtnActive : tabBtn} onClick={() => setTab("staff")}>
              Staff
            </button>
            <button style={dangerBtn} onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <section style={wrap}>
        <div style={statsGrid}>
          <Metric
            title="TODAY'S APPOINTMENTS"
            value={loadingStats ? "…" : String(stats?.todaysAppointments ?? 0).padStart(2, "0")}
          />
          <Metric title="TODAY'S REVENUE" value={loadingStats ? "…" : `₹${stats?.todaysRevenue ?? 0}`} />
          <Metric title="ACTIVE STAFF" value={loadingStats ? "…" : String(stats?.activeStaff ?? 0).padStart(2, "0")} />
        </div>

        <div style={toolbar}>
          <div />
          {tab === "appointments" ? (
            <button style={primaryBtn} onClick={openCreateAppt}>
              + Add Appointment
            </button>
          ) : (
            <button style={primaryBtn} onClick={() => alert("Staff CRUD not enabled yet.")}>
              + Add Staff
            </button>
          )}
        </div>

        {tab === "appointments" ? (
          <Card title="Appointments">
            {loadingAppts ? (
              <Empty text="Loading appointments…" />
            ) : appts.length === 0 ? (
              <Empty text="No appointments found." />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Service</th>
                      <th style={th}>Client</th>
                      <th style={th}>Staff</th>
                      <th style={th}>Date</th>
                      <th style={th}>Time</th>
                      <th style={thRight}>Amount</th>
                      <th style={th}>Status</th>
                      <th style={thRight}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appts.map((a) => (
                      <tr key={a.appId} style={tr}>
                        <td style={tdStrong}>{String(a.service).toUpperCase()}</td>
                        <td style={td}>{String(a.customer?.name ?? "—").toUpperCase()}</td>
                        <td style={td}>{String(a.staff ?? "ANY STAFF").toUpperCase()}</td>
                        <td style={td}>{formatDate(a.appDate)}</td>
                        <td style={td}>{a.appTime}</td>
                        <td style={tdRight}>{a.amount ? `₹${a.amount}` : "—"}</td>
                        <td style={td}>
                          <span style={a.status === "cancelled" ? pillUnpaid : pillPaid}>
                            {String(a.status).toUpperCase()}
                          </span>
                        </td>
                        <td style={tdRight}>
                          <button style={miniBtn} onClick={() => openEditAppt(a.appId)}>
                            Edit
                          </button>
                          <button
                            style={{ ...miniBtn, marginLeft: 8, borderColor: "rgba(100,0,23,0.35)", color: COLORS.burgundy }}
                            onClick={() => setModal({ open: true, type: "deleteAppt", id: a.appId })}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ) : (
          <Card title="Staff">
            {loadingStaff ? (
              <Empty text="Loading staff…" />
            ) : staff.length === 0 ? (
              <Empty text="No staff found." />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Name</th>
                      <th style={th}>Services</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s.staffId} style={tr}>
                        <td style={tdStrong}>{String(s.name).toUpperCase()}</td>
                        <td style={td}>{s.services?.length ? s.services.map((x) => x.type).join(", ") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </section>

      {/* Modal */}
      {modal.open ? (
        <div style={overlay} onClick={() => setModal({ open: false })}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            {modal.type === "createAppt" || modal.type === "editAppt" ? (
              <>
                <div style={modalTitleRow}>
                  <div style={modalTitle}>{modal.type === "createAppt" ? "Add appointment" : "Edit appointment"}</div>
                  <button style={xBtn} onClick={() => setModal({ open: false })}>
                    ✕
                  </button>
                </div>

                <div style={grid2}>
                  <Field label="Customer">
                    <select
                      style={input}
                      value={apptDraft.custId}
                      onChange={(e) => setApptDraft((p) => ({ ...p, custId: e.target.value }))}
                      disabled={loadingCustomers}
                    >
                      <option value="" disabled>
                        {loadingCustomers ? "Loading customers..." : "Select customer"}
                      </option>
                      {customers.map((c) => (
                        <option key={c.custId} value={String(c.custId)}>
                          {c.name} ({c.phoneNo})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Service">
                    <select
                      style={input}
                      value={apptDraft.service}
                      onChange={(e) => {
                        const nextService = e.target.value;

                        const validStaff = staff.filter((s) =>
                          (s.services ?? []).some((svc) => svc.type === nextService)
                        );

                        setApptDraft((p) => ({
                          ...p,
                          service: nextService,
                          staff: validStaff[0]?.name ?? "ANY STAFF",
                        }));
                      }}
                      disabled={loadingServices}
                    >
                      <option value="" disabled>
                        {loadingServices ? "Loading services..." : "Select service"}
                      </option>
                      {services.map((s) => (
                        <option key={s.serviceId} value={s.type}>
                          {s.type}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Staff (filtered by service)">
                    <select
                      style={input}
                      value={apptDraft.staff}
                      onChange={(e) => setApptDraft((p) => ({ ...p, staff: e.target.value }))}
                      disabled={loadingStaff}
                    >
                      <option value="ANY STAFF">ANY STAFF</option>
                      {staffForSelectedService.map((s) => (
                        <option key={s.staffId} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Status">
                    <select
                      style={input}
                      value={apptDraft.status}
                      onChange={(e) => setApptDraft((p) => ({ ...p, status: e.target.value as AppointmentStatus }))}
                    >
                      <option value="scheduled">scheduled</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </Field>

                  <Field label="Date">
                    <input
                      style={input}
                      type="date"
                      value={apptDraft.appDate}
                      onChange={(e) => setApptDraft((p) => ({ ...p, appDate: e.target.value }))}
                    />
                  </Field>

                  <Field label="Time">
                    <input
                      style={input}
                      value={apptDraft.appTime}
                      onChange={(e) => setApptDraft((p) => ({ ...p, appTime: e.target.value }))}
                      placeholder='e.g. "10:30 AM"'
                    />
                  </Field>

                  <Field label="Amount">
                    <input
                      style={input}
                      value={apptDraft.amount}
                      onChange={(e) => setApptDraft((p) => ({ ...p, amount: e.target.value }))}
                      placeholder='e.g. "1200/-"'
                    />
                  </Field>
                </div>

                <div style={actions}>
                  <button style={ghostBtn} onClick={() => setModal({ open: false })}>
                    Cancel
                  </button>
                  <button
                    style={primaryBtn}
                    onClick={() => (modal.type === "createAppt" ? saveApptFromDraft() : saveApptFromDraft(modal.id))}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : null}

            {modal.type === "deleteAppt" ? (
              <>
                <div style={modalTitleRow}>
                  <div style={modalTitle}>Delete appointment?</div>
                  <button style={xBtn} onClick={() => setModal({ open: false })}>
                    ✕
                  </button>
                </div>
                <p style={modalText}>This will permanently remove the appointment.</p>
                <div style={actions}>
                  <button style={ghostBtn} onClick={() => setModal({ open: false })}>
                    Cancel
                  </button>
                  <button style={dangerBtn} onClick={() => deleteAppt(modal.id)}>
                    Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

/* Small components */
function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div style={metricCard}>
      <div style={metricTitle}>{title}</div>
      <div style={metricValue}>{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={card}>
      <div style={cardHeader}>{title}</div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ padding: 14, color: "rgba(47,27,26,0.70)" }}>{text}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={fieldLabel}>{label}</div>
      {children}
    </div>
  );
}

/* Styles */
const wrap: React.CSSProperties = { maxWidth: 1150, margin: "0 auto", padding: "18px 22px" };

const topBar: React.CSSProperties = {
  background: COLORS.burgundy,
  color: COLORS.ivory,
  borderBottom: "1px solid rgba(47,27,26,0.18)",
};

const brand: React.CSSProperties = { fontSize: 22, fontWeight: 900, letterSpacing: "0.14em" };
const brandSub: React.CSSProperties = { marginTop: 6, opacity: 0.85 };

const statsGrid: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
};

const metricCard: React.CSSProperties = {
  borderRadius: 18,
  padding: "18px 18px",
  background: "rgba(255,255,255,0.60)",
  border: "1px solid rgba(47,27,26,0.12)",
  boxShadow: "0 18px 60px rgba(47,27,26,0.10)",
};

const metricTitle: React.CSSProperties = { fontSize: 12, fontWeight: 900, letterSpacing: "0.16em" };
const metricValue: React.CSSProperties = { marginTop: 10, fontSize: 32, fontWeight: 900, letterSpacing: "0.04em" };

const toolbar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 20,
  flexWrap: "wrap",
};

const card: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 18,
  border: "1px solid rgba(47,27,26,0.12)",
  background: "rgba(255,255,255,0.60)",
  boxShadow: "0 18px 60px rgba(47,27,26,0.08)",
  overflow: "hidden",
};

const cardHeader: React.CSSProperties = {
  padding: 14,
  borderBottom: "1px solid rgba(47,27,26,0.12)",
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const table: React.CSSProperties = { width: "100%", borderCollapse: "separate", borderSpacing: 0 };

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "12px 12px",
  color: "rgba(47,27,26,0.75)",
  borderBottom: "1px solid rgba(47,27,26,0.12)",
};

const thRight: React.CSSProperties = { ...th, textAlign: "right" };

const tr: React.CSSProperties = { borderBottom: "1px solid rgba(47,27,26,0.08)" };

const td: React.CSSProperties = { padding: "12px 12px", borderBottom: "1px solid rgba(47,27,26,0.08)" };
const tdStrong: React.CSSProperties = { ...td, fontWeight: 900, letterSpacing: "0.04em" };
const tdRight: React.CSSProperties = { ...td, textAlign: "right", whiteSpace: "nowrap" };

const pillBase: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const pillPaid: React.CSSProperties = { ...pillBase, color: COLORS.ivory, background: COLORS.olive };
const pillUnpaid: React.CSSProperties = { ...pillBase, color: COLORS.ivory, background: COLORS.chocolate };

const primaryBtn: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: COLORS.olive,
  color: COLORS.ivory,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  cursor: "pointer",
};

const tabBtn: React.CSSProperties = {
  height: 40,
  padding: "0 12px",
  borderRadius: 999,
  border: "1px solid rgba(239,239,201,0.35)",
  background: "transparent",
  color: COLORS.ivory,
  fontWeight: 900,
  letterSpacing: "0.10em",
  cursor: "pointer",
};

const tabBtnActive: React.CSSProperties = { ...tabBtn, background: "rgba(239,239,201,0.14)" };

const ghostBtn: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(47,27,26,0.18)",
  background: "transparent",
  color: COLORS.chocolate,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  height: 40,
  padding: "0 12px",
  borderRadius: 999,
  border: "1px solid rgba(239,239,201,0.35)",
  background: "rgba(239,239,201,0.12)",
  color: COLORS.ivory,
  fontWeight: 900,
  letterSpacing: "0.10em",
  cursor: "pointer",
};

const miniBtn: React.CSSProperties = {
  height: 34,
  padding: "0 10px",
  borderRadius: 12,
  border: "1px solid rgba(47,27,26,0.18)",
  background: "rgba(255,255,255,0.80)",
  color: COLORS.chocolate,
  fontWeight: 900,
  letterSpacing: "0.10em",
  cursor: "pointer",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(47,27,26,0.60)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modalBox: React.CSSProperties = {
  width: "100%",
  maxWidth: 740,
  borderRadius: 18,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(47,27,26,0.14)",
  boxShadow: "0 26px 90px rgba(47,27,26,0.20)",
  padding: 16,
};

const modalTitleRow: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };
const modalTitle: React.CSSProperties = { fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" };
const modalText: React.CSSProperties = { color: "rgba(47,27,26,0.75)" };

const xBtn: React.CSSProperties = {
  height: 36,
  width: 36,
  borderRadius: 12,
  border: "1px solid rgba(47,27,26,0.18)",
  background: "transparent",
  cursor: "pointer",
  fontWeight: 900,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 14,
};

const fieldLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.14em",
  marginBottom: 8,
  textTransform: "uppercase",
  color: "rgba(47,27,26,0.80)",
};

const input: React.CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: 14,
  border: "1px solid rgba(47,27,26,0.18)",
  padding: "0 12px",
  outline: "none",
  background: "rgba(255,255,255,0.90)",
};

const actions: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 };