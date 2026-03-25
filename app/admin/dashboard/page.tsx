"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const ADMIN_SESSION_KEY = "admin:isLoggedIn";

type Tab = "appointments" | "staff" | "services";

export default function AdminPage() {
  const router = useRouter();

  const sessionValue = useLocalStorageString(ADMIN_SESSION_KEY);
  const authReady = sessionValue !== null;
  const isAuthed = sessionValue === "true";

  const [tab, setTab] = useState<Tab>("appointments");

  const [appts, setAppts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // 🔥 ANALYTICS
 const analytics = useMemo(() => {
  if (!appts.length) return null;

  let totalRevenue = 0;

  const status: Record<string, number> = {
    scheduled: 0,
    cancelled: 0,
  };

  appts.forEach((a: any) => {
    status[a.status] = (status[a.status] || 0) + 1;

    totalRevenue += Number(
      a.amount?.replace(/[^\d]/g, "") || 0
    );
  });

  return {
    totalRevenue,
    totalAppointments: appts.length,
    avg:
      appts.length > 0
        ? Math.round(totalRevenue / appts.length)
        : 0,
    status,
  };
}, [appts]);

  useEffect(() => {
    if (!isAuthed) return;

    loadAll();
  }, [isAuthed]);

  async function loadAll() {
    const [a, s, sv] = await Promise.all([
      fetch("/api/admin/appointments").then((r) => r.json()),
      fetch("/api/admin/staff").then((r) => r.json()),
      fetch("/api/admin/services").then((r) => r.json()),
    ]);

    setAppts(a);
    setStaff(s);
    setServices(sv);
  }

  function logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    router.push("/admin/login");
  }

  if (!authReady) return null;
  if (!isAuthed) return null;

  return (
    <main style={{ padding: 30 }}>

      {/* HEADER */}
      <h1>Admin Dashboard</h1>

      {/* TABS */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setTab("appointments")}>Appointments</button>
        <button onClick={() => setTab("staff")}>Staff</button>
        <button onClick={() => setTab("services")}>Services</button>
        <button onClick={logout}>Logout</button>
      </div>

      {/* 🔥 ANALYTICS */}
      {analytics && (
        <div style={{ marginTop: 20 }}>
          <h2>Analytics</h2>
          <p>Total Revenue: ₹{analytics.totalRevenue}</p>
          <p>Total Appointments: {analytics.totalAppointments}</p>
          <p>Avg Revenue: ₹{analytics.avg}</p>
          <p>Scheduled: {analytics.status.scheduled}</p>
          <p>Cancelled: {analytics.status.cancelled}</p>
        </div>
      )}

      {/* APPOINTMENTS */}
      {tab === "appointments" && (
        <div>
          <h2>Appointments</h2>
          {appts.map((a) => (
            <div key={a.appId}>
              {a.service} - {a.customer?.name}
            </div>
          ))}
        </div>
      )}

      {/* STAFF */}
      {tab === "staff" && (
        <div>
          <h2>Staff</h2>
          {staff.map((s) => (
            <div key={s.staffId}>{s.name}</div>
          ))}
        </div>
      )}

      {/* 🔥 SERVICES CRUD */}
      {tab === "services" && (
        <div>
          <h2>Services</h2>

          <button
            onClick={async () => {
              const name = prompt("Service name");
              const category = prompt("Category");

              if (!name) return;

              await fetch("/api/admin/services", {
                method: "POST",
                body: JSON.stringify({ type: name, category }),
              });

              loadAll();
            }}
          >
            + Add Service
          </button>

          {services.map((s) => (
            <div key={s.serviceId} style={{ marginTop: 10 }}>
              {s.type} ({s.category})

              <button
                onClick={async () => {
                  const newName = prompt("Edit name", s.type);
                  if (!newName) return;

                  await fetch(`/api/admin/services/${s.serviceId}`, {
                    method: "PUT",
                    body: JSON.stringify({ type: newName }),
                  });

                  loadAll();
                }}
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  await fetch(`/api/admin/services/${s.serviceId}`, {
                    method: "DELETE",
                  });

                  loadAll();
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/* hook */
function useLocalStorageString(key: string): string | null {
  const subscribe = (onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    return () => window.removeEventListener("storage", onStoreChange);
  };

  const getSnapshot = () => localStorage.getItem(key);
  const getServerSnapshot = () => null;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}