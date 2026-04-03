"use client";

import { useEffect, useState } from "react";
import { FaPen, FaTrash, FaSignOutAlt, FaUsers, FaCog, FaCalendarDay, FaRupeeSign, FaPlus } from "react-icons/fa";

const PALETTE = {
  spaceCadet: "#253A4F",
  slateGray: "#617891",
  tan: "#D8B893",
  coffee: "#6F4D3B",
  caputMortuum: "#632024",
  offWhite: "#f7f7fa"
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

  // Quick Add Appointment
  const [quickApp, setQuickApp] = useState({ date: "", serviceId: "", staffId: "", customer: "", amount: "" });
  const [quickAddMsg, setQuickAddMsg] = useState("");

  // -------- LOAD --------
  useEffect(() => { loadAll(); }, []);
  const loadAll = async () => { loadAppointments(); loadServices(); loadStaff(); };

  const loadAppointments = async () => {
    const res = await fetch("/api/appointments");
    setAppointments(await res.json());
  };
  const loadServices = async () => {
    const res = await fetch("/api/admin/services");
    setServices(await res.json());
  };
  const loadStaff = async () => {
    const res = await fetch("/api/admin/staff");
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
    await fetch("/api/admin/staff", {
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

  // ==== QUICK ADD APPOINTMENT DEMO (stub, does not actually save to back end) ====
  const quickAddAppointment = async () => {
    setQuickAddMsg("");
    if (!quickApp.date || !quickApp.serviceId || !quickApp.staffId || !quickApp.customer || !quickApp.amount) {
      setQuickAddMsg("Please fill all fields");
      return;
    }
    // Would POST to API here
    setQuickAddMsg("Demo: Appointment would be added!");
    setQuickApp({ date: "", serviceId: "", staffId: "", customer: "", amount: "" });
    // loadAppointments(); // Enable if you connect this to your actual API!
  };

  // ==== LOGOUT ====
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ==== CALCULATIONS ====
  const today = new Date().toISOString().slice(0, 10);
  const appointmentsToday = appointments.filter(a => a.appDate && a.appDate.slice(0, 10) === today);
  const revenue = appointments.reduce((sum, a) => sum + (a.amount ? Number(a.amount) : 0), 0);

  // ==== ANALYTICS CARDS ====
  const analytics = [
    {
      icon: <FaCalendarDay size={28}/>,
      label: "Appointments Today",
      count: appointmentsToday.length,
      color: PALETTE.slateGray,
      bg: PALETTE.offWhite
    },
    {
      icon: <FaRupeeSign size={28}/>,
      label: "Total Revenue",
      count: `₹${revenue}`,
      color: PALETTE.coffee,
      bg: PALETTE.tan
    },
    {
      icon: <FaUsers size={28}/>,
      label: "Active Staff",
      count: staff.length,
      color: PALETTE.spaceCadet,
      bg: PALETTE.offWhite
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#D8B893]/80 relative">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-8 py-6 bg-[#253A4F]">
        <div className="flex items-center gap-3">
          <FaCog className="text-[#D8B893] text-2xl" />
          <span className="text-2xl font-bold text-[#D8B893] tracking-wide">Salon Admin</span>
          <span className="text-sm text-[#D8B893]/70 font-normal">Business Dashboard</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-white bg-[#632024] hover:bg-[#7e2a38] px-5 py-2.5 rounded-lg font-semibold shadow transition"
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
            className={`px-7 py-2 rounded-full font-semibold tracking-wide border transition
            ${
              tab === t
                ? "bg-[#253A4F] text-white shadow border-[#253A4F]"
                : "bg-[#F4F1ED] text-[#253A4F] border-[#617891] hover:bg-[#617891]/10"
            }`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* =============== SUMMARY (Dashboard) ================ */}
      {tab === "dashboard" && (
        <div>
          {/* Analytics */}
          <div className="flex flex-wrap gap-7 items-center mt-8 px-10">
            {analytics.map((a) => (
              <div
                key={a.label}
                className="rounded-2xl flex-1 min-w-[210px] max-w-[320px] p-7 shadow-md bg-white flex gap-4 items-center border-l-[7px]"
                style={{ borderColor: a.color, background: a.bg }}
              >
                <div className="rounded-full p-4 bg-[#D8B893]/30 flex items-center justify-center">{a.icon}</div>
                <div>
                  <div className="text-4xl font-extrabold" style={{ color: a.color }}>{a.count}</div>
                  <div className="text-[#253A4F] font-medium">{a.label}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Today’s Appointments */}
          <div className="mt-12 px-10">
            <h2 className="text-xl font-bold text-[#253A4F] mb-3 flex items-center gap-2">
              <FaCalendarDay /> Today's Appointments
            </h2>
            <div className="bg-white rounded-xl border shadow px-6 py-4">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b text-[#617891] bg-[#f7f7fa]">
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
                      <td colSpan={5} className="py-8 text-center text-[#617891]/60">No appointments today</td>
                    </tr>
                  ) : (
                    appointmentsToday.map((a) => (
                      <tr key={a.appId} className="border-b hover:bg-[#f7f7fa]">
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
          {/* Quick Add Appointment */}
          <div className="mt-10 px-10 flex flex-col md:flex-row gap-8">
            <div className="bg-white rounded-xl p-6 border flex-1 shadow">
              <h3 className="text-lg font-semibold text-[#253A4F] mb-4 flex items-center gap-2">
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
              {quickAddMsg && <div className="text-[#632024] mt-2">{quickAddMsg}</div>}
              <button
                className="mt-4 bg-[#6F4D3B] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#533c2c] flex items-center gap-2"
                onClick={quickAddAppointment}
              >
                <FaPlus /> Add
              </button>
            </div>
            {/* Staff at a glance */}
            <div className="flex-1 bg-white rounded-xl p-6 border shadow min-w-[260px]">
              <h4 className="font-semibold text-[#253A4F] mb-3 flex items-center gap-2">
                <FaUsers /> Staff
              </h4>
              <ul>
                {staff.length === 0 && (
                  <li className="text-[#617891]">No staff</li>
                )}
                {staff.map((s) => (
                  <li key={s.staffId} className="py-1 border-b last:border-0">
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ===================== APPOINTMENTS TAB ===================== */}
      {tab === "appointments" && (
        <div className="bg-white rounded-2xl shadow border mt-8 mx-10 px-8 py-7">
          <h2 className="font-semibold text-[#253A4F] text-lg mb-5">All Appointments</h2>
          <table className="w-full text-base">
            <thead className="border-b text-[#617891] bg-[#f7f7fa]">
              <tr>
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
                  <td colSpan={5} className="py-10 text-center text-[#617891]/60">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.appId} className="border-b hover:bg-[#f7f7fa]">
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

      {/* =================== SERVICES TAB ================== */}
      {tab === "services" && (
        <div className="bg-white rounded-2xl shadow border mt-8 mx-10 px-8 py-7">
          <h2 className="font-semibold text-[#253A4F] text-lg mb-5">Services</h2>
          {/* ADD */}
          <div className="flex gap-3 mb-7">
            <input
              className="border rounded-lg px-3 py-2 w-1/3"
              placeholder="Service name"
              value={newService}
              onChange={e => setNewService(e.target.value)}
            />
            <input
              className="border rounded-lg px-3 py-2 w-1/4"
              placeholder="Price"
              type="number"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
            />
            <button
              onClick={addService}
              className="bg-[#6F4D3B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#533c2c]"
            >
              Add
            </button>
          </div>
          {/* EDIT MODAL */}
          {editingService && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border-2 border-[#253A4F]">
                <h3 className="font-bold text-lg mb-4 text-[#253A4F]">Edit Service</h3>
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-3"
                  placeholder="Service name"
                  value={editingService.type}
                  onChange={e => setEditingService((s: any) => ({ ...s, type: e.target.value }))}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-5"
                  placeholder="Price"
                  type="number"
                  value={editingService.price}
                  onChange={e => setEditingService((s: any) => ({ ...s, price: e.target.value }))}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 rounded bg-[#617891]/30 text-[#253A4F] font-medium hover:bg-[#617891]/40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateService}
                    className="px-4 py-2 rounded bg-[#6F4D3B] text-white font-semibold hover:bg-[#533c2c]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* TABLE */}
          <table className="w-full text-base">
            <thead className="border-b text-[#617891] bg-[#f7f7fa]">
              <tr>
                <th className="py-3 text-left">Service</th>
                <th className="text-left">Price</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.serviceId} className="border-b hover:bg-[#f7f7fa]">
                  <td className="py-3">{s.type}</td>
                  <td>₹{s.price}</td>
                  <td>
                    <button
                      onClick={() => startEditService(s)}
                      className="inline-flex items-center text-[#253A4F] hover:text-[#617891] mr-4"
                      title="Edit"
                    >
                      <FaPen className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteService(s.serviceId)}
                      className="inline-flex items-center text-[#632024] hover:text-red-700"
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

      {/* ================= STAFF TAB ================ */}
      {tab === "staff" && (
        <div className="bg-white rounded-2xl shadow border mt-8 mx-10 px-8 py-7">
          <h2 className="font-semibold text-[#253A4F] text-lg mb-5">Staff</h2>
          {/* ADD */}
          <div className="flex gap-3 mb-7">
            <input
              className="border rounded-lg px-3 py-2 w-1/3"
              placeholder="Staff name"
              value={newStaff}
              onChange={e => setNewStaff(e.target.value)}
            />
            <button
              onClick={addStaff}
              className="bg-[#6F4D3B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#533c2c]"
            >
              Add
            </button>
          </div>
          {/* EDIT MODAL */}
          {editingStaff && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border-2 border-[#253A4F]">
                <h3 className="font-bold text-lg mb-4 text-[#253A4F]">Edit Staff</h3>
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-5"
                  placeholder="Staff name"
                  value={editingStaff.name}
                  onChange={e => setEditingStaff((s: any) => ({ ...s, name: e.target.value }))}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingStaff(null)}
                    className="px-4 py-2 rounded bg-[#617891]/30 text-[#253A4F] font-medium hover:bg-[#617891]/40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateStaff}
                    className="px-4 py-2 rounded bg-[#6F4D3B] text-white font-semibold hover:bg-[#533c2c]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* TABLE */}
          <table className="w-full text-base">
            <thead className="border-b text-[#617891] bg-[#f7f7fa]">
              <tr>
                <th className="py-3 text-left">Name</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.staffId} className="border-b hover:bg-[#f7f7fa]">
                  <td className="py-3">{s.name}</td>
                  <td>
                    <button
                      onClick={() => startEditStaff(s)}
                      className="inline-flex items-center text-[#253A4F] hover:text-[#617891] mr-4"
                      title="Edit"
                    >
                      <FaPen className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteStaff(s.staffId)}
                      className="inline-flex items-center text-[#632024] hover:text-red-700"
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