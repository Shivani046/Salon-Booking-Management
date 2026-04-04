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
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function BookPage() {
  const router = useRouter();

  const [form, setForm] = useState<BookingForm>({
    fullName: "",
    phone: "",
    category: "",
    serviceId: "",
    staffId: "",
    date: "",
    time: "",
  });

  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [profileName, setProfileName] = useState("User");
  const [loggedIn, setLoggedIn] = useState(false);

  // Profile / avatar
  useEffect(() => {
    const name = localStorage.getItem("profileName");
    const isLogged = localStorage.getItem("isLoggedIn");
    if (name) setProfileName(name);
    setLoggedIn(isLogged === "true");
  }, []);
  const initials = useMemo(() => getInitials(profileName), [profileName]);

  // Fetch services list
  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices)
      .catch((err) => setErrorMessage("Unable to load services."));
  }, []);

  // Fetch staff for chosen service
  useEffect(() => {
    if (!form.serviceId) {
      setStaffList([]);
      return;
    }
    setLoadingStaff(true);
    fetch(`/api/staff?serviceId=${Number(form.serviceId)}`)
      .then(res => res.ok ? res.json() : [])
      .then(setStaffList)
      .catch(() => setErrorMessage("Could not load staff for this service."))
      .finally(() => setLoadingStaff(false));
  }, [form.serviceId]);

  // Unique categories for dropdown
  const categories = useMemo(
    () =>
      Array.from(
        new Set(services.map((s) => s.category).filter(Boolean))
      ),
    [services]
  );

  // Filtered services by category
  const filteredServices = useMemo(
    () => services.filter((s) => s.category === form.category),
    [services, form.category]
  );

  // Service object for selected ID
  const selectedService = useMemo(
    () =>
      services.find((s) => String(s.serviceId) === form.serviceId),
    [services, form.serviceId]
  );

  // For time slots
  const times = useMemo(() => {
    const arr: string[] = [];
    for (let h = 10; h <= 20; h++) {
      arr.push(`${h.toString().padStart(2, "0")}:00`);
      arr.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return arr;
  }, []);

  // Validate
  const isValid =
    form.fullName.trim() &&
    form.phone.trim().length === 10 &&
    form.category &&
    form.serviceId &&
    form.staffId &&
    form.date &&
    form.time;

  // Update form
  function update<K extends keyof BookingForm>(
    key: K,
    value: BookingForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage("");
  }

  // On submit, pick random staff if "any", always pass IDs!
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    // Handle "any staff"
    let finalStaffId = form.staffId;
    let finalStaffName = "Any staff";
    if (form.staffId === "any" || !form.staffId) {
      if (staffList.length > 0) {
        const rand = staffList[Math.floor(Math.random() * staffList.length)];
        finalStaffId = String(rand.staffId);
        finalStaffName = rand.name;
      } else {
        setErrorMessage("No staff available for the selected service.");
        return;
      }
    } else {
      const staff = staffList.find((s) => String(s.staffId) === form.staffId);
      finalStaffName = staff ? staff.name : "Staff";
    }

    const params = new URLSearchParams({
      fullName: form.fullName,
      phone: form.phone,
      service: selectedService?.type || "",
      serviceId: form.serviceId,            // always ID
      staff: finalStaffName,
      staffId: finalStaffId,                // always ID
      date: form.date,
      time: form.time,
      total: String(selectedService?.price || 0),
    });

    router.push(`/payment?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faebe2] via-[#f6eadc] to-[#fbe9e7] text-[#23181a]">
      {/* NAVBAR */}
      <header className="bg-[#cb7885] shadow-md sticky top-0 z-50">
        <nav className="flex justify-between items-center px-8 py-4">
          <Link href="/" className="text-2xl font-bold tracking-widest text-white drop-shadow">
            ERAILE BEAUTY
          </Link>
          <div className="flex gap-6 items-center text-base font-medium uppercase">
            <Link href="/" className="hover:text-accent transition">Home</Link>
            <Link href="/services" className="hover:text-accent transition">Services</Link>
            <Link href="/book" className="hover:text-accent transition">Book</Link>
            <Link href="/contact" className="hover:text-accent transition">Contact</Link>
            {!loggedIn ? (
              <Link
                href="/login"
                className="bg-white/80 px-4 py-2 rounded-full text-xs font-semibold hover:bg-white"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-[#cb7885] hover:ring-2 ring-[#cb7885] transition"
                title="Go to profile"
                aria-label="Go to profile"
                onClick={() => router.push("/profile")}
                tabIndex={0}
              >
                <span className="text-lg font-bold text-accent">{initials}</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* TITLE */}
      <section className="text-center pt-8 mb-4">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 drop-shadow-sm">Book an Appointment</h1>
        <p className="text-gray-700 text-lg mb-2">
          Choose your service, your staff and book your perfect slot!
        </p>
      </section>

      {/* FORM */}
      <section className="max-w-4xl mx-auto my-8 px-4">
        <form
          onSubmit={onSubmit}
          className="bg-white/70 rounded-2xl shadow-xl border p-8 grid gap-8 md:grid-cols-2"
        >
          {/* LEFT - Personal Info */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg mb-1">Personal Info</h2>
            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg focus:ring-2 ring-[#cb7885] bg-white"
              autoComplete="name"
            />
            <input
              value={form.phone}
              onChange={(e) =>
                update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Phone (10 digits)"
              className="w-full p-3 border rounded-lg focus:ring-2 ring-[#cb7885] bg-white"
              maxLength={10}
              autoComplete="tel"
            />
          </div>

          {/* RIGHT - Booking Details */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg mb-1">Booking Details</h2>
            {/* Category */}
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full p-3 border rounded-lg bg-white focus:ring-2 ring-[#cb7885]"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Service */}
            <select
              value={form.serviceId}
              onChange={(e) => update("serviceId", e.target.value)}
              className="w-full p-3 border rounded-lg bg-white focus:ring-2 ring-[#cb7885]"
              disabled={!form.category}
            >
              <option value="">Select Service</option>
              {filteredServices.map((s) => (
                <option key={s.serviceId} value={String(s.serviceId)}>
                  {s.type} &ndash; ₹{s.price}
                </option>
              ))}
            </select>

            {/* Staff */}
            <select
              value={form.staffId}
              onChange={(e) => update("staffId", e.target.value)}
              className="w-full p-3 border rounded-lg bg-white focus:ring-2 ring-[#cb7885]"
              disabled={!form.serviceId}
            >
              {loadingStaff && <option>Loading...</option>}
              {!loadingStaff && (
                <>
                  <option value="any">Any staff</option>
                  {staffList.map((s) => (
                    <option key={s.staffId} value={String(s.staffId)}>
                      {s.name}
                    </option>
                  ))}
                </>
              )}
            </select>

            {/* Date & Time */}
            <div className="flex gap-3">
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-1/2 p-3 border rounded-lg bg-white focus:ring-2 ring-[#cb7885]"
                min={new Date().toISOString().split("T")[0]}
              />
              <select
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                className="w-1/2 p-3 border rounded-lg bg-white focus:ring-2 ring-[#cb7885]"
              >
                <option value="">Select Time</option>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BUTTON */}
          <div className="col-span-2 text-center pt-2">
            <button
              type="submit"
              disabled={!isValid}
              className={`px-12 py-3 rounded-xl text-lg font-semibold transition shadow ${
                isValid
                  ? "bg-[#cb7885] text-white hover:bg-[#b46a75]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Payment
            </button>
            {errorMessage && (
              <p className="text-red-600 text-center mt-3">{errorMessage}</p>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}