"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [tab, setTab] = useState("appointments");

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

  // Load all on mount
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    loadAppointments();
    loadServices();
    loadStaff();
  };

  // -------- LOADERS --------
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

  // ===== SERVICES CRUD =====

  // Create
  const addService = async () => {
    if (!newService || !newPrice) return;
    await fetch("/api/admin/services", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ type: newService, price: Number(newPrice) }),
    });
    setNewService("");
    setNewPrice("");
    loadServices();
  };

  // Edit (open editing UI)
  const startEditService = (svc: any) => setEditingService({ ...svc });

  // Update
  const updateService = async () => {
    if (!editingService.type || !editingService.price) return;
    await fetch(`/api/admin/services?id=${editingService.serviceId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        type: editingService.type,
        price: Number(editingService.price),
      }),
    });
    setEditingService(null);
    loadServices();
  };

  // Delete
  const deleteService = async (id: number) => {
    await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    loadServices();
  };

  // ===== STAFF CRUD =====

  // Create
  const addStaff = async () => {
    if (!newStaff) return;
    await fetch("/api/admin/staff", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name: newStaff }),
    });
    setNewStaff("");
    loadStaff();
  };

  // Edit (open editing UI)
  const startEditStaff = (person: any) => setEditingStaff({ ...person });

  // Update
  const updateStaff = async () => {
    if (!editingStaff.name) return;
    await fetch(`/api/admin/staff?id=${editingStaff.staffId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: editingStaff.name,
      }),
    });
    setEditingStaff(null);
    loadStaff();
  };

  // Delete
  const deleteStaff = async (id: number) => {
    await fetch(`/api/admin/staff?id=${id}`, { method: "DELETE" });
    loadStaff();
  };

  // --------- UI ---------
  return (
    <div className="p-8 bg-[#f7ecd8] min-h-screen w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Manage services, staff and bookings
          </p>
        </div>
        <div className="flex gap-2">
          {["appointments", "services", "staff"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                tab === t
                  ? "bg-[#cb7885] text-white font-bold shadow"
                  : "bg-white border text-gray-600 hover:bg-[#f9edef]"
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ================= APPOINTMENTS TABLE ================= */}
      {tab === "appointments" && (
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="font-semibold mb-4">Appointments</h2>

          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
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
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.appId} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      {new Date(a.appDate).toLocaleDateString()}
                    </td>
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

      {/* ================= SERVICES CRUD TABLE ================= */}
      {tab === "services" && (
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="font-semibold mb-4">Services</h2>

          {/* ADD */}
          <div className="flex gap-3 mb-6">
            <input
              className="border rounded-lg px-3 py-2 w-1/3"
              placeholder="Service name"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
            />
            <input
              className="border rounded-lg px-3 py-2 w-1/4"
              placeholder="Price"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <button
              onClick={addService}
              className="bg-[#cb7885] text-white px-4 py-2 rounded-lg font-semibold"
            >
              Add
            </button>
          </div>

          {/* EDIT MODAL */}
          {editingService && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="font-bold text-lg mb-4">Edit Service</h3>
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-3"
                  placeholder="Service name"
                  value={editingService.type}
                  onChange={(e) =>
                    setEditingService((s: any) => ({ ...s, type: e.target.value }))
                  }
                />
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-5"
                  placeholder="Price"
                  type="number"
                  value={editingService.price}
                  onChange={(e) =>
                    setEditingService((s: any) => ({ ...s, price: e.target.value }))
                  }
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateService}
                    className="px-4 py-2 rounded bg-[#cb7885] text-white font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TABLE */}
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-3 text-left">Service</th>
                <th className="text-left">Price</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {services.map((s) => (
                <tr key={s.serviceId} className="border-b hover:bg-gray-50">
                  <td className="py-3">{s.type}</td>
                  <td>₹{s.price}</td>
                  <td>
                    <button
                      onClick={() => startEditService(s)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteService(s.serviceId)}
                      className="text-red-500 hover:underline"
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

      {/* ================= STAFF CRUD TABLE ================= */}
      {tab === "staff" && (
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="font-semibold mb-4">Staff</h2>

          {/* ADD */}
          <div className="flex gap-3 mb-6">
            <input
              className="border rounded-lg px-3 py-2 w-1/3"
              placeholder="Staff name"
              value={newStaff}
              onChange={(e) => setNewStaff(e.target.value)}
            />
            <button
              onClick={addStaff}
              className="bg-[#cb7885] text-white px-4 py-2 rounded-lg font-semibold"
            >
              Add
            </button>
          </div>

          {/* EDIT MODAL */}
          {editingStaff && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="font-bold text-lg mb-4">Edit Staff</h3>
                <input
                  className="border rounded-lg px-3 py-2 w-full mb-5"
                  placeholder="Staff name"
                  value={editingStaff.name}
                  onChange={(e) =>
                    setEditingStaff((s: any) => ({ ...s, name: e.target.value }))
                  }
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingStaff(null)}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateStaff}
                    className="px-4 py-2 rounded bg-[#cb7885] text-white font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TABLE */}
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-3 text-left">Name</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {staff.map((s) => (
                <tr key={s.staffId} className="border-b hover:bg-gray-50">
                  <td className="py-3">{s.name}</td>
                  <td>
                    <button
                      onClick={() => startEditStaff(s)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteStaff(s.staffId)}
                      className="text-red-500 hover:underline"
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
    </div>
  );
}