"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BookingForm = {
  fullName: string;
  phone: string;
  category: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
};

type Service = {
  serviceId: number;
  type: string;
  category: string;
  price: number;
};

type Staff = {
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
    staffId: "any",
    date: "",
    time: "",
  });

  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [profileName, setProfileName] = useState("User");
  const [loggedIn, setLoggedIn] = useState(false);

  function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage(""); // clear errors when user changes input
  }

  const isValid =
    form.fullName.trim() &&
    form.phone.trim() &&
    form.category &&
    form.serviceId &&
    form.date &&
    form.time;

  useEffect(() => {
    setProfileName(localStorage.getItem("profileName") || "User");
    setLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  const initials = useMemo(() => getInitials(profileName), [profileName]);

  // ---------------- SERVICES ----------------
  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices)
      .catch((err) => console.error("Service fetch error:", err));
  }, []);

  // ---------------- STAFF ----------------
  useEffect(() => {
    if (!form.serviceId) {
      setStaffList([]);
      return;
    }

    setLoadingStaff(true);

    fetch(`/api/staff?serviceId=${Number(form.serviceId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch staff");
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      })
      .then(setStaffList)
      .catch((err) => {
        console.error("Staff fetch error:", err);
        setStaffList([]);
      })
      .finally(() => setLoadingStaff(false));
  }, [form.serviceId]);

  // ---------------- CATEGORY ----------------
  const categories = useMemo(() => {
    return Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
  }, [services]);

  // ---------------- FILTER SERVICES ----------------
  const filteredServices = useMemo(() => {
    if (!form.category) return [];
    return services.filter((s) => s.category === form.category);
  }, [services, form.category]);

  // ---------------- TIME ----------------
  const times = useMemo(() => {
    const arr: string[] = [];
    for (let h = 10; h <= 20; h++) {
      arr.push(`${h.toString().padStart(2, "0")}:00`);
      arr.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return arr;
  }, []);

  // ---------------- SUBMIT ----------------
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValid) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    const service = services.find(
      (s) => String(s.serviceId) === form.serviceId
    );

    const staff =
      form.staffId === "any"
        ? "ANY"
        : staffList.find((s) => String(s.staffId) === form.staffId)?.name || "ANY";

    const params = new URLSearchParams({
      fullName: form.fullName,
      phone: form.phone,
      service: service?.type || "",
      staff,
      date: form.date,
      time: form.time,
      total: String(service?.price || 0),
    });

    router.push(`/payment?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#f7ecd8] text-[#23181a]">

      {/* NAVBAR */}
      <header className="bg-[#cb7885] shadow-md">
        <nav className="flex justify-between items-center px-8 py-4">
          <Link href="/" className="text-lg font-semibold">
            ERAILE BEAUTY
          </Link>

          <div className="flex gap-6 items-center text-sm uppercase">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>

            {!loggedIn ? (
              <Link
                href="/login"
                className="bg-white px-4 py-2 rounded-full text-xs"
              >
                Login
              </Link>
            ) : (
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                {initials}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* TITLE */}
      <section className="text-center pt-12">
        <h1 className="text-4xl font-semibold">Book an Appointment</h1>
        <p className="text-gray-600 mt-2">
          Choose your service and preferred staff
        </p>
      </section>

      {/* FORM */}
      <section className="max-w-5xl mx-auto mt-10 px-6">
        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="bg-white p-6 rounded-2xl shadow space-y-4">
            <h2 className="font-semibold">Personal Info</h2>

            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg"
            />

            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Phone"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* RIGHT */}
          <div className="bg-white p-6 rounded-2xl shadow space-y-4">
            <h2 className="font-semibold">Booking Details</h2>

            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={form.serviceId}
              onChange={(e) => update("serviceId", e.target.value)}
              className="w-full p-3 border rounded-lg"
              disabled={!form.category}
            >
              <option value="">Select Service</option>
              {filteredServices.map((s) => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.type}
                </option>
              ))}
            </select>

            <select
              value={form.staffId}
              onChange={(e) => update("staffId", e.target.value)}
              className="w-full p-3 border rounded-lg"
              disabled={!form.serviceId}
            >
              {loadingStaff && <option>Loading...</option>}
              {!loadingStaff && (
                <>
                  <option value="any">Any staff</option>
                  {staffList.map((s) => (
                    <option key={s.staffId} value={s.staffId}>
                      {s.name}
                    </option>
                  ))}
                </>
              )}
            </select>

            <div className="flex gap-3">
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-1/2 p-3 border rounded-lg"
              />

              <select
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                className="w-1/2 p-3 border rounded-lg"
              >
                <option value="">Time</option>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

                    {/* BUTTON */}
          <div className="col-span-2 text-center mt-4">
            <button
              type="submit"
              disabled={!isValid}
              className={`px-10 py-3 rounded-xl text-white transition ${
                isValid
                  ? "bg-[#cb7885] hover:bg-[#b46a75]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>

        </form>
        {errorMessage && (
          <p className="text-red-600 text-center mt-4">{errorMessage}</p>
        )}
      </section>
    </main>
  );
}
