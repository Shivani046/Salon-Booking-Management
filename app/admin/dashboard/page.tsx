"use client";

import { useEffect, useState } from "react";
import { FaPen, FaTrash, FaSignOutAlt, FaUsers, FaCog, FaCalendarDay, FaRupeeSign, FaPlus } from "react-icons/fa";

// Sapphire palette (from image 5)
const PALETTE = {
  sapphire: "#3C507D",
  royalBlue: "#112E50",
  quicksand: "#E0C58F",
  swanWing: "#F5F0E9",
  shellstone: "#D9CBC2"
};

export default function DashboardPage() {
  const [tab, setTab] = useState("dashboard");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Service form state
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingService, setEditingService] = useState<any | null>(null);

  // Staff form state
  const [newStaff, setNewStaff] = useState("");
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Quick Add Appointment (stub logic)
  const [quickApp, setQuickApp] = useState({ date: "", serviceId: "", staffId: "", customer: "", amount: "" });
  const [quickAddMsg, setQuickAddMsg] = useState("");

  // -------- LOAD DATA --------
  useEffect(() => { loadAll(); }, []);
  const loadAll = async () => { await Promise.all([loadAppointments(), loadServices(), loadStaff()]); };

  const loadAppointments = async () => {
    const res = await fetch("/api/appointments");
    setAppointments(await res.json());
  };
  const loadServices = async () => {
    const res = await fetch("/api/services");
    setServices(await res.json());
  };
  const loadStaff = async () => {
    const res = await fetch("/api/staff");
    setStaff(await res.json());
  };

  // ==== SERVICES CRUD ====
  const addService = async () => {
    if (!newService || !newPrice) return;
    await fetch("/api/admin/services", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ type: newService, price: Number(newPrice) }),
    });
    setNewService(""); setNewPrice(""); loadServices();
  };
  const startEditService = (svc: any) => setEditingService({ ...svc });
  const updateService = async () => {
    if (!editingService.type || !editingService.price) return;
    await fetch(`/api/admin/services?id=${editingService.serviceId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ type: editingService.type, price: Number(editingService.price) }),
    });
    setEditingService(null); loadServices();
  };
  const deleteService = async (id: number) => {
    await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    loadServices();
  };

  // ==== STAFF CRUD ====
  const addStaff = async () => {
    if (!newStaff) return;
    await fetch("/api/staff", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name: newStaff }),
    });
    setNewStaff(""); loadStaff();
  };
  const startEditStaff = (person: any) => setEditingStaff({ ...person });
  const updateStaff = async () => {
    if (!editingStaff.name) return;
    await fetch(`/api/admin/staff?id=${editingStaff.staffId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name: editingStaff.name }),
    });
    setEditingStaff(null); loadStaff();
  };
  const deleteStaff = async (id: number) => {
    await fetch(`/api/admin/staff?id=${id}`, { method: "DELETE" });
    loadStaff();
  };

  // ==== LOGOUT ====
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ==== ANALYTICS ====
  const today = new Date().toISOString().slice(0, 10);
  const appointmentsToday = appointments.filter(a => a.appDate && a.appDate.slice(0, 10) === today);
  const revenue = appointments.reduce((sum, a) => sum + (a.amount ? Number(a.amount) : 0), 0);

  const analytics = [
    {
      icon: <FaCalendarDay size={28}/>,
      label: "Appointments Today",
      count: appointmentsToday.length,
      color: PALETTE.royalBlue,
      bg: PALETTE.swanWing
    },
    {
      icon: <FaRupeeSign size={28}/>,
      label: "Total Revenue",
      count: `₹${revenue}`,
      color: PALETTE.sapphire,
      bg: PALETTE.quicksand
    },
    {
      icon: <FaUsers size={28}/>,
      label: "Active Staff",
      count: staff.length,
      color: PALETTE.royalBlue,
      bg: PALETTE.shellstone
    }
  ];

  return (
    <div className="min-h-screen w-full" style={{ background: PALETTE.swanWing }}>
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-8 py-6" style={{ background: PALETTE.sapphire }}>
        <div className="flex items-center gap-3">
          <FaCog style={{ color: PALETTE.swanWing, fontSize: "28px" }} />
          <span className="text-2xl font-extrabold" style={{ color: PALETTE.swanWing, letterSpacing: "0.02em" }}>
            Salon Admin
          </span>
          <span className="text-sm" style={{ color: "#b6bed1" }}>Business Dashboard</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-white"
          style={{
            background: PALETTE.royalBlue, padding: "10px 25px", borderRadius: "10px",
            fontWeight: "bold", letterSpacing: "0.04em", boxShadow: "0 2px 6px #112E5070"
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mt-8 px-10">
        {["dashboard", "appointments", "services", "staff"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-7 py-2 rounded-full font-semibold tracking-wide border transition`}
            style={
              tab === t
                ? { background: PALETTE.sapphire, color: PALETTE.swanWing, borderColor: PALETTE.sapphire, boxShadow: "0 1px 6px #3C507D50" }
                : { background: PALETTE.shellstone, color: PALETTE.royalBlue, borderColor: PALETTE.royalBlue }
            }
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ========== DASHBOARD SUMMARY ========== */}
      {tab === "dashboard" && (
        <>
          {/* Analytics cards */}
          <div className="flex flex-wrap gap-7 items-center mt-9 px-10">
            {analytics.map((a) => (
              <div
                key={a.label}
                className="rounded-2xl flex-1 min-w-[210px] max-w-[320px] p-7 shadow-md flex gap-4 items-center border-l-[7px]"
                style={{
                  borderColor: a.color, background: a.bg,
                  borderLeftWidth: 7, borderStyle: "solid"
                }}
              >
                <div className="rounded-full p-4" style={{ background: "#f1eedf", color: a.color }}>{a.icon}</div>
                <div>
                  <div className="text-4xl font-extrabold" style={{ color: a.color }}>{a.count}</div>
                  <div className="font-semibold mt-1" style={{ color: PALETTE.royalBlue }}>{a.label}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Today’s Appointments */}
          <div className="mt-12 px-10">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: PALETTE.royalBlue }}>
              <FaCalendarDay /> Today's Appointments
            </h2>
            <div
              className="rounded-xl border shadow px-6 py-4"
              style={{ background: PALETTE.swanWing, borderColor: PALETTE.shellstone }}
            >
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b" style={{ color: PALETTE.royalBlue, background: PALETTE.shellstone }}>
                    <th className="py-3 text-left">Time</th>
                    <th className="text-left">Service</th>
                    <th className="text-left">Staff</th>
                    <th className="text-left">Customer</th>
                    <th className="text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsToday.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center" style={{ color: PALETTE.royalBlue + "77" }}>
                        No appointments today
                      </td>
                    </tr>
                  ) : (
                    appointmentsToday.map((a) => (
                      <tr key={a.appId} className="border-b hover:opacity-90" style={{ borderColor: PALETTE.shellstone }}>
                        <td className="py-3">{a.appTime || "--"}</td>
                        <td>{a.service?.type || ""}</td>
                        <td>{a.staff?.name || "-"}</td>
                        <td>{a.customer?.name || "-"}</td>
                        <td>₹{a.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Quick Add Appointment (UI only demo) */}
          <div className="mt-10 px-10 flex flex-col md:flex-row gap-8">
            <div className="rounded-xl p-6 border flex-1 shadow" style={{ background: PALETTE.quicksand, borderColor: PALETTE.shellstone }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: PALETTE.royalBlue }}>
                <FaPlus /> Quick Add Appointment
              </h3>
              <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
                <input className="border rounded-lg px-3 py-2" type="date" value={quickApp.date}
                  onChange={e => setQuickApp(q => ({ ...q, date: e.target.value }))} />
                <select className="border rounded-lg px-3 py-2" value={quickApp.serviceId}
                  onChange={e => setQuickApp(q => ({ ...q, serviceId: e.target.value }))}>
                  <option value="">Select Service</option>
                  {services.map(s => <option value={s.serviceId} key={s.serviceId}>{s.type}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2" value={quickApp.staffId}
                  onChange={e => setQuickApp(q => ({ ...q, staffId: e.target.value }))}>
                  <option value="">Assign Staff</option>
                  {staff.map(s => <option value={s.staffId} key={s.staffId}>{s.name}</option>)}
                </select>
                <input className="border rounded-lg px-3 py-2 col-span-1 md:col-span-2" placeholder="Customer name"
                  value={quickApp.customer} onChange={e => setQuickApp(q => ({ ...q, customer: e.target.value }))} />
                <input className="border rounded-lg px-3 py-2" placeholder="Amount"
                  value={quickApp.amount} type="number"
                  onChange={e => setQuickApp(q => ({ ...q, amount: e.target.value }))} />
              </div>
              {quickAddMsg && <div style={{ color: PALETTE.royalBlue, marginTop: 8 }}>{quickAddMsg}</div>}
              <button
                className="mt-4 flex items-center gap-2 px-5 py-2 rounded-lg font-semibold hover:opacity-85"
                style={{ background: PALETTE.sapphire, color: PALETTE.swanWing }}
                onClick={() => {
                  setQuickAddMsg("Demo: Appointment would be added!");
                  setTimeout(() => setQuickAddMsg(""), 1500);
                  setQuickApp({ date: "", serviceId: "", staffId: "", customer: "", amount: "" });
                }}
              >
                <FaPlus /> Add
              </button>
            </div>
            {/* Staff at a glance */}
            <div className="flex-1 rounded-xl p-6 border shadow min-w-[260px]" style={{ background: PALETTE.swanWing, borderColor: PALETTE.shellstone }}>
              <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: PALETTE.royalBlue }}>
                <FaUsers /> Staff
              </h4>
              <ul>
                {staff.length === 0 && (
                  <li style={{ color: PALETTE.sapphire }}>No staff</li>
                )}
                {staff.map((s) => (
                  <li key={s.staffId} className="py-1 border-b last:border-0" style={{ borderColor: PALETTE.shellstone }}>
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* ========== APPOINTMENTS ========== */}
      {tab === "appointments" && (
        <div
          className="rounded-2xl shadow border mt-8 mx-10 px-8 py-7"
          style={{ background: PALETTE.swanWing, borderColor: PALETTE.shellstone }}
        >
          <h2 className="font-semibold text-lg mb-5" style={{ color: PALETTE.royalBlue }}>All Appointments</h2>
          <table className="w-full text-base">
            <thead>
              <tr style={{ background: PALETTE.shellstone, color: PALETTE.royalBlue }}>
                <th className="py-3 text-left">Date</th>
                <th className="text-left">Service</th>
                <th className="text-left">Staff</th>
                <th className="text-left">Customer</th>
                <th className="text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center" style={{ color: PALETTE.royalBlue + "77" }}>
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.appId} className="border-b hover:bg-[#e9e5df]" style={{ borderColor: PALETTE.shellstone }}>
                    <td className="py-3">{new Date(a.appDate).toLocaleDateString()}</td>
                    <td>{a.service?.type || ""}</td>
                    <td>{a.staff?.name || "-"}</td>
                    <td>{a.customer?.name || "-"}</td>
                    <td className="font-medium">₹{a.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== SERVICES ========== */}
      {tab === "services" && (
        <div
          className="rounded-2xl shadow border mt-8 mx-10 px-8 py-7"
          style={{ background: PALETTE.shellstone, borderColor: PALETTE.royalBlue }}
        >
          <h2 className="font-semibold text-lg mb-5" style={{ color: PALETTE.royalBlue }}>Services</h2>
          {/* ADD */}
          <div className="flex gap-3 mb-7">
            <input
              className="border rounded-lg px-3 py-2 w-1/3"
              placeholder="Service name"
              value={newService}
              onChange={e => setNewService(e.target.value)}
              style={{ borderColor: PALETTE.royalBlue }}
            />
            <input
              className="border rounded-lg px-3 py-2 w-1/4"
              placeholder="Price"
              type="number"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              style={{ borderColor: PALETTE.royalBlue }}
            />
            <button
              onClick={addService}
              className="px-6 py-2 rounded-lg font-semibold hover:opacity-85"
              style={{ background: PALETTE.sapphire, color: PALETTE.swanWing }}
            >
              Add
            </button>
          </div>
          {/* EDIT MODAL */}
          {editingService && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="p-8 rounded-2xl shadow-xl w-full max-w-sm border-2" style={{ background: PALETTE.shellstone, borderColor: PALETTE.royalBlue }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: PALETTE.royalBlue }}>Edit Service</h3>
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-3"
                  placeholder="Service name"
                  value={editingService.type}
                  onChange={e => setEditingService((s: any) => ({ ...s, type: e.target.value }))}
                  style={{ borderColor: PALETTE.royalBlue }}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-5"
                  placeholder="Price"
                  type="number"
                  value={editingService.price}
                  onChange={e => setEditingService((s: any) => ({ ...s, price: e.target.value }))}
                  style={{ borderColor: PALETTE.royalBlue }}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 rounded font-medium hover:opacity-80"
                    style={{ background: PALETTE.swanWing, color: PALETTE.royalBlue }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateService}
                    className="px-4 py-2 rounded font-semibold hover:opacity-90"
                    style={{ background: PALETTE.sapphire, color: PALETTE.swanWing }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* TABLE */}
          <table className="w-full text-base">
            <thead>
              <tr style={{ background: PALETTE.swanWing, color: PALETTE.royalBlue }}>
                <th className="py-3 text-left">Service</th>
                <th className="text-left">Price</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.serviceId} className="border-b hover:bg-[#e9e5df]" style={{ borderColor: PALETTE.royalBlue }}>
                  <td className="py-3">{s.type}</td>
                  <td>₹{s.price}</td>
                  <td>
                    <button
                      onClick={() => startEditService(s)}
                      className="inline-flex items-center mr-4"
                      style={{ color: PALETTE.sapphire }}
                      title="Edit"
                    >
                      <FaPen className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteService(s.serviceId)}
                      className="inline-flex items-center"
                      style={{ color: PALETTE.royalBlue }}
                      title="Delete"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== STAFF ========== */}
      {tab === "staff" && (
        <div
          className="rounded-2xl shadow border mt-8 mx-10 px-8 py-7"
          style={{ background: PALETTE.shellstone, borderColor: PALETTE.royalBlue }}
        >
          <h2 className="font-semibold text-lg mb-5" style={{ color: PALETTE.royalBlue }}>Staff</h2>
          {/* ADD */}
          <div className="flex gap-3 mb-7">
            <input
              className="border rounded-lg px-3 py-2 w-1/3"
              placeholder="Staff name"
              value={newStaff}
              onChange={e => setNewStaff(e.target.value)}
              style={{ borderColor: PALETTE.royalBlue }}
            />
            <button
              onClick={addStaff}
              className="px-6 py-2 rounded-lg font-semibold hover:opacity-85"
              style={{ background: PALETTE.sapphire, color: PALETTE.swanWing }}
            >
              Add
            </button>
          </div>
          {/* EDIT MODAL */}
          {editingStaff && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="p-8 rounded-2xl shadow-xl w-full max-w-sm border-2" style={{ background: PALETTE.swanWing, borderColor: PALETTE.royalBlue }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: PALETTE.royalBlue }}>Edit Staff</h3>
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-5"
                  placeholder="Staff name"
                  value={editingStaff.name}
                  onChange={e => setEditingStaff((s: any) => ({ ...s, name: e.target.value }))}
                  style={{ borderColor: PALETTE.royalBlue }}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingStaff(null)}
                    className="px-4 py-2 rounded font-medium hover:opacity-80"
                    style={{ background: PALETTE.royalBlue + "22", color: PALETTE.royalBlue }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateStaff}
                    className="px-4 py-2 rounded font-semibold hover:opacity-90"
                    style={{ background: PALETTE.sapphire, color: PALETTE.swanWing }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* TABLE */}
          <table className="w-full text-base">
            <thead>
              <tr style={{ background: PALETTE.swanWing, color: PALETTE.royalBlue }}>
                <th className="py-3 text-left">Name</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.staffId} className="border-b hover:bg-[#e9e5df]" style={{ borderColor: PALETTE.royalBlue }}>
                  <td className="py-3">{s.name}</td>
                  <td>
                    <button
                      onClick={() => startEditStaff(s)}
                      className="inline-flex items-center mr-4"
                      style={{ color: PALETTE.sapphire }}
                      title="Edit"
                    >
                      <FaPen className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteStaff(s.staffId)}
                      className="inline-flex items-center"
                      style={{ color: PALETTE.royalBlue }}
                      title="Delete"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}