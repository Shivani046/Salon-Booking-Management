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

const PALETTE = {
  sapphire: "#3C507D",
  royalBlue: "#112E50",
  quicksand: "#E0C58F",
  swanWing: "#F5F0E9",
  shellstone: "#D9CBC2",
};

export default function DashboardPage() {
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
  // --- Modal for unified edit staff ---
  const [editStaffModal, setEditStaffModal] = useState<any | null>(null);
  const [modalStaffName, setModalStaffName] = useState("");
  const [modalServiceAddId, setModalServiceAddId] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [serviceAssignStaffId, setServiceAssignStaffId] = useState<number | null>(null);
  const [addServiceId, setAddServiceId] = useState("");

  const [quickApp, setQuickApp] = useState({
    date: "",
    serviceId: "",
    staffId: "",
    customer: "",
    amount: "",
  });
  const [quickAddMsg, setQuickAddMsg] = useState("");

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
    // Get staff and their assigned services
    const res = await fetch("/api/staff?withServices=true");
    setStaff(await res.json());
  };

  // ==== SERVICES CRUD ====
  const addService = async () => {
    if (!newService || !newPrice) return;
    await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newService, price: Number(newPrice) }),
    });
    setNewService("");
    setNewPrice("");
    loadServices();
  };
  const startEditService = (svc: any) => setEditingService({ ...svc });
  const updateService = async () => {
    if (!editingService.type || !editingService.price) return;
    await fetch(`/api/services?id=${editingService.serviceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: editingService.type,
        price: Number(editingService.price),
      }),
    });
    setEditingService(null);
    loadServices();
  };
  const deleteService = async (id: number) => {
    await fetch(`/api/services?id=${id}`, { method: "DELETE" });
    loadServices();
  };

  // === Add Staff ===
  const addStaff = async () => {
    if (!newStaff) return;
    await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStaff }),
    });
    setNewStaff("");
    loadStaff();
  };

  // === Unified Edit Staff Modal ===
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

  // === Service assignment (inside modal) ===
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
    const allStaff = await (await fetch("/api/staff?withServices=true")).json();
    setEditStaffModal(allStaff.find((s: any) => s.staffId === editStaffModal.staffId));
    setModalLoading(false);
    await loadStaff();
  };
  const handleRemoveServiceFromModalStaff = async (serviceId: number) => {
    setModalLoading(true);
    await fetch(`/api/staff/services?staffId=${editStaffModal.staffId}&serviceId=${serviceId}`, {
      method: "DELETE",
    });
    // update modal staff
    const allStaff = await (await fetch("/api/staff?withServices=true")).json();
    setEditStaffModal(allStaff.find((s: any) => s.staffId === editStaffModal.staffId));
    setModalLoading(false);
    await loadStaff();
  };

  // ==== Inline Add/Remove for staff in table (remains, for your original assign feature) ====
  const assignServiceToStaff = async (staffId: number, serviceId: number) => {
    await fetch("/api/staff/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId, serviceId }),
    });
    setAddServiceId("");
    loadStaff();
  };
  const removeServiceFromStaff = async (staffId: number, serviceId: number) => {
    await fetch(`/api/staff/services?staffId=${staffId}&serviceId=${serviceId}`, { method: "DELETE" });
    loadStaff();
  };

  // ==== LOGOUT ====
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ==== ANALYTICS ====
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

  return (
    <div className="min-h-screen w-full" style={{ background: PALETTE.swanWing }}>
      {/* HEADER BAR ETC... */}
      {/* ...Other code for header, dashboard, analytics, appointments, services unchanged ... */}

      {/* STAFF SECTION */}
      {tab === "staff" && (
        <div
          className="rounded-2xl shadow border mt-8 mx-10 px-8 py-7"
          style={{
            background: PALETTE.shellstone,
            borderColor: PALETTE.royalBlue,
          }}
        >
          <h2
            className="font-semibold text-lg mb-5 flex items-center gap-2"
            style={{ color: PALETTE.royalBlue }}
          >
            Staff
            <button
              title="Sort staff"
              onClick={() =>
                setStaffSort((prev) => (prev === "az" ? "za" : "az"))
              }
              className="ml-2 px-2 py-1 bg-white rounded hover:bg-[#eee] border transition flex items-center gap-1 text-[#3C507D]"
            >
              {staffSort === "az" ? (
                <>
                  <FaSortAlphaDown className="text-lg" /> A-Z
                </>
              ) : (
                <>
                  <FaSortAlphaUp className="text-lg" /> Z-A
                </>
              )}
            </button>
          </h2>
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
              }}
            >
              Add
            </button>
          </div>
          {/* TABLE */}
          <table className="w-full text-base">
            <thead>
              <tr style={{
                background: PALETTE.swanWing,
                color: PALETTE.royalBlue,
              }}>
                <th className="py-3 text-left">Name</th>
                <th className="text-left w-52">Assigned Services</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStaff.map((s) => (
                <tr
                  key={s.staffId}
                  className="border-b hover:bg-[#e9e5df]"
                  style={{ borderColor: PALETTE.royalBlue }}
                >
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
                      title="Edit staff"
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

          {/* EDIT STAFF MODAL */}
          {editStaffModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="rounded-2xl shadow-xl bg-[#faf6f0] border-2 border-[#112E50] px-8 py-6 min-w-[350px] max-w-[90vw] w-full md:w-[420px] relative">
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