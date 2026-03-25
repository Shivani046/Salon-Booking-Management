"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BookingForm = {
  fullName: string;
  phone: string;
  category: string;
  serviceId: string;
  date: string;
  time: string;
  staffId: string;
};

type ServiceRow = {
  serviceId: number;
  type: string;
  category: string | null;
};

type StaffRow = {
  staffId: number;
  name: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function BookPage() {
  const router = useRouter();

  const [form, setForm] = useState<BookingForm>({
    fullName: "",
    phone: "",
    category: "",
    serviceId: "",
    date: "",
    time: "",
    staffId: "any",
  });

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffRow[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [profileName, setProfileName] = useState("User");
  const [loggedIn, setLoggedIn] = useState(false);

  function update<K extends keyof BookingForm>(
    key: K,
    value: BookingForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Navbar state
  useEffect(() => {
    const n = localStorage.getItem("profileName");
    const l = localStorage.getItem("isLoggedIn");
    setProfileName(n || "User");
    setLoggedIn(l === "true");
  }, []);

  const initials = useMemo(() => getInitials(profileName), [profileName]);

  // Fetch services
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
    })();
  }, []);

  // Reset service + staff when category changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      serviceId: "",
      staffId: "any",
    }));
  }, [form.category]);

  // Fetch staff based on selected service
  useEffect(() => {
    if (!form.serviceId) {
      setStaffOptions([]);
      return;
    }

    (async () => {
      try {
        setLoadingStaff(true);

        const res = await fetch(
          `/api/staff?serviceId=${Number(form.serviceId)}`
        );

        const data = await res.json();
        setStaffOptions(data);
      } catch (err) {
        console.error("Error fetching staff:", err);
      } finally {
        setLoadingStaff(false);
      }
    })();
  }, [form.serviceId]);

  // Categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        services
          .map((s) => s.category)
          .filter(Boolean)
          .map((c) => c!.toLowerCase())
      )
    );
  }, [services]);

  // Filter services by category
  const filteredServices = useMemo(() => {
    return services.filter(
      (s) =>
        s.category &&
        s.category.toLowerCase() === form.category.toLowerCase()
    );
  }, [services, form.category]);

  // Time slots
  const times = useMemo(() => {
    const arr: string[] = [];
    for (let h = 10; h <= 20; h++) {
      arr.push(`${h.toString().padStart(2, "0")}:00`);
      arr.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return arr;
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.serviceId) {
      alert("Please fill all required fields");
      return;
    }

    const params = new URLSearchParams({
      fullName: form.fullName,
      phone: form.phone,
      serviceId: form.serviceId,
      date: form.date,
      time: form.time,
      staffId: form.staffId,
    });

    router.push(`/payment?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      
      {/* NAVBAR */}
      <header className="bg-[#c27a82] shadow-md">
        <nav className="flex items-center justify-between px-8 py-4">
          <Link href="/" className="text-lg font-semibold">
            ERAILE BEAUTY
          </Link>

          <div className="flex items-center gap-6 text-sm uppercase">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>

            {!loggedIn ? (
              <Link
                href="/login"
                className="ml-4 bg-[#f4e6d8] px-4 py-2 rounded-full text-xs"
              >
                LOGIN
              </Link>
            ) : (
              <div
                onClick={() => router.push("/profile")}
                className="ml-4 h-10 w-10 rounded-full bg-[#f4e6d8] flex items-center justify-center cursor-pointer"
              >
                {initials}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* TITLE */}
      <section className="text-center pt-12">
        <h1 className="text-4xl font-semibold">Book an Appointment</h1>
        <p className="mt-2 text-gray-500">
          Choose your service and preferred staff
        </p>
      </section>

      {/* FORM */}
      <section className="max-w-5xl mx-auto mt-10 px-6">
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-8">

          {/* PERSONAL */}
          <div className="p-6 border rounded-2xl bg-white">
            <h2 className="text-sm font-semibold mb-4">
              PERSONAL INFO
            </h2>

            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Full Name"
              className="w-full mb-3 p-3 border rounded-lg"
            />

            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Phone"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* BOOKING */}
          <div className="p-6 border rounded-2xl bg-white">
            <h2 className="text-sm font-semibold mb-4">
              BOOKING DETAILS
            </h2>

            {/* CATEGORY */}
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full mb-3 p-3 border rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>

            {/* SERVICE */}
            <select
              value={form.serviceId}
              onChange={(e) => update("serviceId", e.target.value)}
              className="w-full mb-3 p-3 border rounded-lg"
            >
              <option value="">
                {form.category
                  ? "Choose service"
                  : "Select category first"}
              </option>

              {filteredServices.map((s) => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.type}
                </option>
              ))}
            </select>

            {/* DATE + TIME */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="p-3 border rounded-lg"
              />

              <select
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                className="p-3 border rounded-lg"
              >
                <option value="">Time</option>
                {times.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* STAFF */}
            <select
              value={form.staffId}
              onChange={(e) => update("staffId", e.target.value)}
              disabled={!form.serviceId || loadingStaff}
              className="w-full p-3 border rounded-lg"
            >
              <option value="any">
                {!form.serviceId
                  ? "Select service first"
                  : loadingStaff
                  ? "Loading staff..."
                  : "Any staff"}
              </option>

              {staffOptions.map((st) => (
                <option key={st.staffId} value={st.staffId}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* BUTTON */}
        <div className="text-center mt-8">
          <button
            onClick={onSubmit}
            className="bg-[#c27a82] text-white px-8 py-3 rounded-xl"
          >
            Continue
          </button>
        </div>
      </section>
    </main>
  );
}

