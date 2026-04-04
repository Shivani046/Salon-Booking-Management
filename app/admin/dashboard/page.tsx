"use client";

import { useEffect, useState } from "react";
import {
  FaPen,
  FaTrash,
  FaSignOutAlt,
  FaUsers,
  FaCog,
  FaCalendarDay,
  FaRupeeSign,
  FaPlus,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaTimes,
} from "react-icons/fa";

// COLOR PALETTE
const PALETTE = {
  sapphire: "#3C507D",
  royalBlue: "#112E50",
  quicksand: "#E0C58F",
  swanWing: "#F5F0E9",
  shellstone: "#D9CBC2",
};

export default function DashboardPage() {
  // ---- TABS & STATE ----
  const [tab, setTab] = useState("dashboard");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [serviceSort, setServiceSort] = useState<"az" | "za">("az");
  const [staffSort, setStaffSort] = useState<"az" | "za">("az");
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingService, setEditingService] = useState<any | null>(null);
  const [newStaff, setNewStaff] = useState("");
  // Unified Edit Staff Modal
  const [editStaffModal, setEditStaffModal] = useState<any | null>(null);
  const [modalStaffName, setModalStaffName] = useState("");
  const [modalServiceAddId, setModalServiceAddId] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Quick Add Appointment
  const [quickApp, setQuickApp] = useState({
    date: "",
    serviceId: "",
    staffId: "",
    customer: "",
    amount: "",
  });
  const [quickAddMsg, setQuickAddMsg] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => { loadAll(); }, []);
  const loadAll = async () => {
    try {
      await Promise.all([loadAppointments(), loadServices(), loadStaff()]);
    } catch (err) {
      setError("Could not load dashboard data");
    }
  };
  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      setAppointments(await res.json());
    } catch {
      setError("Could not load appointments");
    }
  };
  const loadServices = async () => {
    try {
      const res = await fetch("/api/services");
      setServices(await res.json());
    } catch {
      setError("Could not load services");
    }
  };
  const loadStaff = async () => {
    try {
      const res = await fetch("/api/staff?withServices=true");
      setStaff(await res.json());
    } catch {
      setError("Could not load staff");
    }
  };

  // Services CRUD
  const addService = async () => {
    if (!newService || !newPrice) return;
    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newService, price: Number(newPrice) }),
    });
    setNewService(""); setNewPrice(""); loadServices();
  };
  const startEditService = (svc: any) => setEditingService({ ...svc });
  const updateService = async () => {
    if (!editingService.type || !editingService.price) return;
    await fetch(`/api/services?id=${editingService.serviceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: editingService.type, price: Number(editingService.price) }),
    });
    setEditingService(null); loadServices();
  };
  const deleteService = async (id: number) => {
    await fetch(`/api/services?id=${id}`, { method: "DELETE" });
    loadServices();
  };

  // Staff CRUD + Modal
  const addStaff = async () => {
    if (!newStaff) return;
    await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStaff }),
    });
    setNewStaff(""); loadStaff();
  };
  const openEditStaffModal = (person: any) => {
    setEditStaffModal(person);
    setModalStaffName(person.name);
    setModalServiceAddId("");
  };
  const handleSaveEditStaff = async () => {
    setModalLoading(true);
    await fetch(`/api/staff?id=${editStaffModal.staffId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modalStaffName }),
    });
    setModalLoading(false);
    setEditStaffModal(null);
    setModalStaffName("");
    await loadStaff();
  };
  const handleDeleteStaff = async (staffId: number) => {
    if (!window.confirm("Delete this staff member?")) return;
    await fetch(`/api/staff?id=${staffId}`, { method: "DELETE" });
    await loadStaff();
  };
  // Staff service assign/removal in Modal
  const handleAddServiceToModalStaff = async () => {
    if (!modalServiceAddId) return;
    setModalLoading(true);
    await fetch("/api/staff/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId: editStaffModal.staffId, serviceId: Number(modalServiceAddId) }),
    });
    setModalServiceAddId("");
    // update modal staff
    const s = await (await fetch("/api/staff?withServices=true")).json();
    setEditStaffModal(s.find((x: any) => x.staffId === editStaffModal.staffId));
    setModalLoading(false);
    await loadStaff();
  };
  const handleRemoveServiceFromModalStaff = async (serviceId: number) => {
    setModalLoading(true);
    await fetch(`/api/staff/services?staffId=${editStaffModal.staffId}&serviceId=${serviceId}`, { method: "DELETE" });
    const s = await (await fetch("/api/staff?withServices=true")).json();
    setEditStaffModal(s.find((x: any) => x.staffId === editStaffModal.staffId));
    setModalLoading(false);
    await loadStaff();
  };

  // Analytics, sorts, etc.
  const sortedServices = [...services].sort((a, b) =>
    serviceSort === "az"
      ? a.type.localeCompare(b.type)
      : b.type.localeCompare(a.type)
  );
  const sortedStaff = [...staff].sort((a, b) =>
    staffSort === "az"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );
  const editModalAvailableServices =
    editStaffModal && services.length
      ? services.filter(
          (svc) =>
            !(editStaffModal.services ?? []).some(
              (assigned: any) => assigned.serviceId === svc.serviceId
            )
        )
      : [];
  const today = new Date().toISOString().slice(0, 10);
  const appointmentsToday = appointments.filter(
    (a) => a.appDate && a.appDate.slice(0, 10) === today
  );
  const revenue = appointments.reduce(
    (sum, a) => sum + (a.amount ? Number(a.amount) : 0),
    0
  );
  const analytics = [
    {
      icon: <FaCalendarDay size={28} />,
      label: "Appointments Today",
      count: appointmentsToday.length,
      color: PALETTE.royalBlue,
      bg: PALETTE.swanWing,
    },
    {
      icon: <FaRupeeSign size={28} />,
      label: "Total Revenue",
      count: `₹${revenue}`,
      color: PALETTE.sapphire,
      bg: PALETTE.quicksand,
    },
    {
      icon: <FaUsers size={28} />,
      label: "Active Staff",
      count: staff.length,
      color: PALETTE.royalBlue,
      bg: PALETTE.shellstone,
    },
  ];

  // LOGOUT
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // --- MAIN RENDER ---
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
          }}>
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
                ? {
                    background: PALETTE.sapphire,
                    color: PALETTE.swanWing,
                    borderColor: PALETTE.sapphire,
                    boxShadow: "0 1px 6px #3C507D50",
                  }
                : {
                    background: PALETTE.shellstone,
                    color: PALETTE.royalBlue,
                    borderColor: PALETTE.royalBlue,
                  }
            }
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {error && <div className="bg-red-100 text-red-700 px-8 py-4 m-5 rounded">{error}</div>}

      {/* DASHBOARD SUMMARY */}
      {tab === "dashboard" && (
        <>
          <div className="flex flex-wrap gap-7 items-center mt-9 px-10">
            {analytics.map((a) => (
              <div
                key={a.label}
                className="rounded-2xl flex-1 min-w-[210px] max-w-[320px] p-7 shadow-md flex gap-4 items-center border-l-[7px]"
                style={{
                  borderColor: a.color,
                  background: a.bg,
                  borderLeftWidth: 7,
                  borderStyle: "solid",
                }}>
                <div className="rounded-full p-4" style={{ background: "#f1eedf", color: a.color }}>
                  {a.icon}
                </div>
                <div>
                  <div className="text-4xl font-extrabold" style={{ color: a.color }}>
                    {a.count}
                  </div>
                  <div className="font-semibold mt-1" style={{ color: PALETTE.royalBlue }}>
                    {a.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Today’s Appointments */}
          <div className="mt-12 px-10">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: PALETTE.royalBlue }}>
              <FaCalendarDay /> Today's Appointments
            </h2>
            <div className="rounded-xl border shadow px-6 py-4"
              style={{ background: PALETTE.swanWing, borderColor: PALETTE.shellstone }}>
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
        </>
      )}
      {/* APPOINTMENTS TAB */}
      {tab === "appointments" && (
        <div className="rounded-2xl shadow border mt-8 mx-10 px-8 py-7"
          style={{ background: PALETTE.swanWing, borderColor: PALETTE.shellstone }}>
          <h2 className="font-semibold text-lg mb-5" style={{ color: PALETTE.royalBlue }}>
            All Appointments
          </h2>
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
                    <td className="py-3">{a.appDate ? new Date(a.appDate).toLocaleDateString() : "-"}</td>
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

      {/* SERVICES TAB */}
      {tab === "services" && (
        <div className="rounded-2xl shadow border mt-8 mx-10 px-8 py-7" style={{
          background: PALETTE.shellstone, borderColor: PALETTE.royalBlue,
        }}>
          <h2 className="font-semibold text-lg mb-5" style={{ color: PALETTE.royalBlue }}>
            Services
          </h2>
          {/* FILTER/SORT */}
          <div className="flex items-center gap-3 mb-3">
            <span className="font-medium text-sm" style={{ color: PALETTE.royalBlue }}>
              Sort by:
            </span>
            <button
              onClick={() => setServiceSort("az")}
              className={`px-3 py-1 rounded-lg border transition font-semibold text-sm ${
                serviceSort === "az"
                  ? "bg-[#3C507D] text-white"
                  : "bg-white text-[#3C507D] border-[#3C507D]"
              } hover:bg-[#3C507D]/10`}
            >
              <FaSortAlphaDown className="inline mr-1" />
              A-Z
            </button>
            <button
              onClick={() => setServiceSort("za")}
              className={`px-3 py-1 rounded-lg border transition font-semibold text-sm ${
                serviceSort === "za"
                  ? "bg-[#3C507D] text-white"
                  : "bg-white text-[#3C507D] border-[#3C507D]"
              } hover:bg-[#3C507D]/10`}
            >
              <FaSortAlphaUp className="inline mr-1" />
              Z-A
            </button>
          </div>
          {/* ADD service */}
          <div className="flex gap-3 mb-7">
            <input
              className="border rounded-lg px-3 py-2 w-1/3"
              placeholder="Service name"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              style={{ borderColor: PALETTE.royalBlue }}
            />
            <input
              className="border rounded-lg px-3 py-2 w-1/4"
              placeholder="Price"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              style={{ borderColor: PALETTE.royalBlue }}
            />
            <button
              onClick={addService}
              className="px-6 py-2 rounded-lg font-semibold hover:opacity-85"
              style={{
                background: PALETTE.sapphire,
                color: PALETTE.swanWing,
              }}
            >
              Add
            </button>
          </div>
          {/* EDIT SERVICE MODAL */}
          {editingService && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="p-8 rounded-2xl shadow-xl w-full max-w-sm border-2"
                style={{
                  background: PALETTE.shellstone,
                  borderColor: PALETTE.royalBlue,
                }}>
                <h3 className="font-bold text-lg mb-4"
                  style={{ color: PALETTE.royalBlue }}>
                  Edit Service
                </h3>
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-3"
                  placeholder="Service name"
                  value={editingService.type}
                  onChange={(e) =>
                    setEditingService((s: any) => ({
                      ...s,
                      type: e.target.value,
                    }))
                  }
                  style={{ borderColor: PALETTE.royalBlue }}
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-5"
                  placeholder="Price"
                  type="number"
                  value={editingService.price}
                  onChange={(e) =>
                    setEditingService((s: any) => ({
                      ...s,
                      price: e.target.value,
                    }))
                  }
                  style={{ borderColor: PALETTE.royalBlue }}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 rounded font-medium hover:opacity-80"
                    style={{
                      background: PALETTE.swanWing,
                      color: PALETTE.royalBlue,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateService}
                    className="px-4 py-2 rounded font-semibold hover:opacity-90"
                    style={{
                      background: PALETTE.sapphire,
                      color: PALETTE.swanWing,
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          <table className="w-full text-base">
            <thead>
              <tr style={{ background: PALETTE.swanWing, color: PALETTE.royalBlue }}>
                <th className="py-3 text-left">Service</th>
                <th className="text-left">Price</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedServices.map((s) => (
                <tr
                  key={s.serviceId}
                  className="border-b hover:bg-[#e9e5df]"
                  style={{ borderColor: PALETTE.royalBlue }}>
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

      {/* STAFF TAB */}
      {tab === "staff" && (
        <div className="rounded-2xl shadow border mt-8 mx-10 px-8 py-7"
          style={{ background: PALETTE.shellstone, borderColor: PALETTE.royalBlue }}>
          {/* Add staff */}
          <div className="flex gap-3 mb-7">
            <input
              className="border rounded-lg px-3 py-2 w-1/3"
              placeholder="Staff name"
              value={newStaff}
              onChange={(e) => setNewStaff(e.target.value)}
              style={{ borderColor: PALETTE.royalBlue }}
            />
            <button
              onClick={addStaff}
              className="px-6 py-2 rounded-lg font-semibold hover:opacity-85"
              style={{
                background: PALETTE.sapphire,
                color: PALETTE.swanWing,
              }}>
              Add
            </button>
          </div>
          <table className="w-full text-base">
            <thead>
              <tr style={{ background: PALETTE.swanWing, color: PALETTE.royalBlue }}>
                <th className="py-3 text-left">Name</th>
                <th className="text-left w-60">Assigned Services</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStaff.map((s) => (
                <tr
                  key={s.staffId}
                  className="border-b hover:bg-[#e9e5df]"
                  style={{ borderColor: PALETTE.royalBlue }}>
                  <td className="py-3">{s.name}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(s.services ?? []).map((svc: any) => (
                        <span key={svc.serviceId} className="inline-flex items-center px-2 py-1 bg-[#e0d7c7] rounded text-xs mr-1 mb-1">
                          {svc.type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => openEditStaffModal(s)}
                      className="inline-flex items-center mr-4"
                      style={{ color: PALETTE.sapphire }}
                      title="Edit"
                    >
                      <FaPen className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(s.staffId)}
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
          {/* --- EDIT STAFF MODAL --- */}
          {editStaffModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="rounded-2xl shadow-xl bg-[#faf6f0] border-2 border-[#112E50] px-8 py-6 min-w-[350px] max-w-[90vw] w-full md:w-[440px] relative">
                <button
                  aria-label="Close"
                  onClick={() => setEditStaffModal(null)}
                  className="absolute top-3 right-3 rounded-full bg-[#fff] hover:bg-[#eee] border shadow p-2"
                >
                  <FaTimes className="text-2xl text-[#cb7885]" />
                </button>
                <h3 className="font-bold text-xl mb-5 text-[#112E50]">Edit Staff</h3>
                <label className="block mb-2 text-[#23181a] font-semibold text-sm">Name</label>
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-5 text-base"
                  placeholder="Staff name"
                  value={modalStaffName}
                  onChange={e => setModalStaffName(e.target.value)}
                  disabled={modalLoading}
                />
                {/* Services Editor */}
                <div className="mb-5">
                  <div className="font-semibold mb-1 text-[#23181a]">Services</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(editStaffModal.services ?? []).map((svc: any) => (
                      <span
                        key={svc.serviceId}
                        className="inline-flex items-center px-3 py-1 bg-[#dceae5] rounded text-sm font-medium"
                      >
                        {svc.type}
                        <button
                          className="ml-2 text-[#cb7885] hover:text-red-800"
                          title="Remove"
                          type="button"
                          disabled={modalLoading}
                          onClick={() => handleRemoveServiceFromModalStaff(svc.serviceId)}
                        >
                          <FaTrash />
                        </button>
                      </span>
                    ))}
                  </div>
                  {editModalAvailableServices.length > 0 && (
                    <div className="flex gap-2 items-center mb-2">
                      <select
                        className="border rounded py-1 px-2 text-sm"
                        value={modalServiceAddId}
                        onChange={e => setModalServiceAddId(e.target.value)}
                        disabled={modalLoading}
                      >
                        <option value="">Add service…</option>
                        {editModalAvailableServices.map((svc: any) =>
                          <option key={svc.serviceId} value={svc.serviceId}>{svc.type}</option>
                        )}
                      </select>
                      <button
                        type="button"
                        disabled={!modalServiceAddId || modalLoading}
                        className="bg-[#cb7885] text-white px-2 py-1 rounded disabled:opacity-40"
                        onClick={handleAddServiceToModalStaff}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditStaffModal(null)}
                    className="px-5 py-2 rounded font-medium bg-gray-200 text-[#112E50] hover:opacity-80"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditStaff}
                    className="px-5 py-2 rounded font-semibold bg-[#112E50] text-white hover:opacity-90"
                    type="button"
                    disabled={!modalStaffName.trim() || modalLoading}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}