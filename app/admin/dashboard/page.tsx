"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [tab, setTab] = useState("appointments");

  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStaff, setNewStaff] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    loadAppointments();
    loadServices();
    loadStaff();
  };

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
  const addService = async () => {
    if (!newService || !newPrice) return;

    await fetch("/api/admin/services", {
      method: "POST",
      body: JSON.stringify({
        type: newService,
        price: Number(newPrice),
      }),
    });

    setNewService("");
    setNewPrice("");
    loadServices();
  };

  const deleteService = async (id: number) => {
    await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    loadServices();
  };

  // ===== STAFF CRUD =====
  const addStaff = async () => {
    if (!newStaff) return;

    await fetch("/api/admin/staff", {
      method: "POST",
      body: JSON.stringify({ name: newStaff }),
    });

    setNewStaff("");
    loadStaff();
  };

  const deleteStaff = async (id: number) => {
    await fetch(`/api/admin/staff?id=${id}`, { method: "DELETE" });
    loadStaff();
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen w-full">
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
              className={`px-4 py-2 rounded-lg text-sm ${
                tab === t
                  ? "bg-black text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ================= APPOINTMENTS ================= */}
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
                    <td>{a.service}</td>
                    <td>{a.staff}</td>
                    <td>{a.customer?.name || "-"}</td>
                    <td className="font-medium">₹{a.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= SERVICES ================= */}
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
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Add
            </button>
          </div>

          {/* TABLE */}
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-3 text-left">Service</th>
                <th className="text-left">Price</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {services.map((s) => (
                <tr key={s.serviceId} className="border-b hover:bg-gray-50">
                  <td className="py-3">{s.type}</td>
                  <td>₹{s.price}</td>
                  <td>
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

      {/* ================= STAFF ================= */}
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
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Add
            </button>
          </div>

          {/* TABLE */}
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-3 text-left">Name</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {staff.map((s) => (
                <tr key={s.staffId} className="border-b hover:bg-gray-50">
                  <td className="py-3">{s.name}</td>
                  <td>
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