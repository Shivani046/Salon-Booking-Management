"use client";

import { useEffect, useState } from "react";
import {
  FaPen, FaTrash, FaSignOutAlt, FaUsers, FaCog, FaCalendarDay, FaRupeeSign, FaPlus, FaSortAlphaDown, FaSortAlphaUp, FaTimes
} from "react-icons/fa";

// Sapphire palette
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
  const [editModalStaff, setEditModalStaff] = useState<any | null>(null);
  const [modalStaffName, setModalStaffName] = useState("");
  const [modalServiceAddId, setModalServiceAddId] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [quickApp, setQuickApp] = useState({
    date: "",
    serviceId: "",
    staffId: "",
    customer: "",
    amount: "",
  });
  const [quickAddMsg, setQuickAddMsg] = useState("");
  const [error, setError] = useState<string>("");

  // Fetch all data on mount
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
      body: JSON.stringify({
        type: editingService.type,
        price: Number(editingService.price),
      }),
    });
    setEditingService(null); loadServices();
  };
  const deleteService = async (id: number) => {
    await fetch(`/api/services?id=${id}`, { method: "DELETE" });
    loadServices();
  };

  // Staff CRUD + Modal (Name/Services together)
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
    setEditModalStaff(person);
    setModalStaffName(person.name);
    setModalServiceAddId("");
  };
  const handleSaveEditStaff = async () => {
    setModalLoading(true);
    await fetch(`/api/staff?id=${editModalStaff.staffId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modalStaffName }),
    });
    setModalLoading(false);
    setEditModalStaff(null);
    setModalStaffName("");
    await loadStaff();
  };
  const handleDeleteStaff = async (staffId: number) => {
    if (!window.confirm("Delete this staff member?")) return;
    await fetch(`/api/staff?id=${staffId}`, { method: "DELETE" });
    await loadStaff();
  };
  const handleAddServiceToModalStaff = async () => {
    if (!modalServiceAddId) return;
    setModalLoading(true);
    await fetch("/api/staff/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId: editModalStaff.staffId, serviceId: Number(modalServiceAddId) }),
    });
    setModalServiceAddId("");
    // update modal staff
    const allStaff = await (await fetch("/api/staff?withServices=true")).json();
    setEditModalStaff(allStaff.find((s: any) => s.staffId === editModalStaff.staffId));
    setModalLoading(false);
    await loadStaff();
  };
  const handleRemoveServiceFromModalStaff = async (serviceId: number) => {
    setModalLoading(true);
    await fetch(`/api/staff/services?staffId=${editModalStaff.staffId}&serviceId=${serviceId}`, {
      method: "DELETE",
    });
    const allStaff = await (await fetch("/api/staff?withServices=true")).json();
    setEditModalStaff(allStaff.find((s: any) => s.staffId === editModalStaff.staffId));
    setModalLoading(false);
    await loadStaff();
  };

  // Data and computed lists
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
    editModalStaff && services.length
      ? services.filter(
          (svc) =>
            !(editModalStaff.services ?? []).some(
              (assigned: any) => assigned.serviceId === svc.serviceId
            )
        )
      : [];

  // Analytics
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

  // Logout
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // === UI BEGIN ===
  return (
    <div className="min-h-screen w-full" style={{ background: PALETTE.swanWing }}>
      {/* HEADER */}
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
      {/* ERROR */}
      {error && <div className="bg-red-100 text-red-700 px-8 py-4 m-5 rounded">{error}</div>}
      {/* DASHBOARD COMPONENTS - Analytics, QuickAdd, Appointments, etc (as above) */}
      {/* ...Same as previous completions for these tabs... */}
      {/* STAFF TAB */}
      {tab === "staff" && (
        <div className="rounded-2xl shadow border mt-8 mx-10 px-8 py-7"
          style={{ background: PALETTE.shellstone, borderColor: PALETTE.royalBlue }}>
          {/* ...Add, Sort, Table ... */}
          {/* ...use openEditStaffModal, handleSaveEditStaff, handleAddServiceToModalStaff... */}
          {/* ...render the Edit Staff Modal as shown previously ... */}
          {/* (Copy modal code from previous completion above) */}
        </div>
      )}
      {/* ...Other tabs code... */}
    </div>
  );
}