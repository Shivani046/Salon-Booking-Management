"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BookingForm = {
  fullName: string;
  phone: string;
  serviceId: string; // store id in <select>
  date: string;
  time: string;
  staffId: string; // "any" or staffId
};

type ServiceRow = {
  serviceId: number;
  type: string;
  category: string | null;
};

type StaffRow = {
  staffId: number;
  name: string;
  // ✅ important: include services so we can filter on the client
  services?: { serviceId: number; type: string; category: string | null }[];
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function BookPage() {
  const router = useRouter();

  // Navbar auth UI state (no dropdown; initials click -> /profile)
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("User");

  useEffect(() => {
    const v = localStorage.getItem("isLoggedIn");
    const n = localStorage.getItem("profileName");
    setLoggedIn(v === "true");
    setProfileName(n?.trim() ? n : "User");
  }, []);

  const initials = useMemo(() => getInitials(profileName), [profileName]);

  const [form, setForm] = useState<BookingForm>({
    fullName: "",
    phone: "",
    serviceId: "",
    date: "",
    time: "",
    staffId: "any",
  });

  const times = useMemo(
    () => [
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM",
      "05:30 PM",
      "06:00 PM",
      "06:30 PM",
    ],
    []
  );

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);

  function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Load services + staff once (staff must include services[])
  useEffect(() => {
    (async () => {
      try {
        setLoadingServices(true);
        setLoadingStaff(true);

        const [svcRes, staffRes] = await Promise.all([
          fetch("/api/services", { cache: "no-store" }),
          // ✅ IMPORTANT: this route should return staff with services included
          fetch("/api/staff", { cache: "no-store" }),
        ]);

        const svcData = await svcRes.json();
        const staffData = await staffRes.json();

        setServices(Array.isArray(svcData) ? svcData : []);
        setStaff(Array.isArray(staffData) ? staffData : []);
      } finally {
        setLoadingServices(false);
        setLoadingStaff(false);
      }
    })();
  }, []);

  const selectedService = useMemo(() => {
    const id = Number(form.serviceId);
    if (!Number.isFinite(id)) return null;
    return services.find((s) => s.serviceId === id) ?? null;
  }, [form.serviceId, services]);

  // ✅ Filter staff based on selected serviceId
  const staffOptions = useMemo(() => {
    const serviceId = Number(form.serviceId);
    if (!Number.isFinite(serviceId)) return [];

    return staff.filter((st) => (st.services ?? []).some((svc) => svc.serviceId === serviceId));
  }, [staff, form.serviceId]);

  // ✅ When service changes, reset staffId safely
  useEffect(() => {
    if (!form.serviceId) {
      // service cleared
      setForm((p) => ({ ...p, staffId: "any" }));
      return;
    }

    // if current staff selection is not valid anymore, reset to "any"
    if (form.staffId === "any") return;

    const staffIdNum = Number(form.staffId);
    const stillValid = staffOptions.some((s) => s.staffId === staffIdNum);
    if (!stillValid) setForm((p) => ({ ...p, staffId: "any" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.serviceId, staffOptions]);

  const selectedStaffName = useMemo(() => {
    if (form.staffId === "any") return "Any staff";
    const id = Number(form.staffId);
    const st = staffOptions.find((x) => x.staffId === id);
    return st?.name ?? "Any staff";
  }, [form.staffId, staffOptions]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const required: (keyof BookingForm)[] = ["fullName", "phone", "serviceId", "date", "time"];
    const missing = required.filter((k) => String(form[k]).trim() === "");

    if (missing.length) {
      alert("Please fill all required fields.");
      return;
    }

    // Send IDs (for DB) + names (for UI display)
    const params = new URLSearchParams({
      fullName: form.fullName,
      phone: form.phone,

      serviceId: form.serviceId,
      service: selectedService?.type ?? "",

      staffId: form.staffId,
      staff: selectedStaffName,

      date: form.date,
      time: form.time,
    });

    router.push(`/payment?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      {/* Navbar */}
      <header className="bg-[#cb7885] text-black shadow-[0_8px_18px_rgba(98,46,56,0.14)]">
        <nav className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-12">
          <Link href="/" className="text-[1.55rem] font-semibold tracking-[0.04em]">
            ERAILE BEAUTY
          </Link>

          <div className="hidden items-center gap-8 text-[0.92rem] font-medium uppercase tracking-[0.12em] md:flex">
            <Link href="/" className="transition hover:opacity-75">
              Home
            </Link>
            <Link href="/services" className="transition hover:opacity-75">
              Services
            </Link>
            <Link href="/book" className="transition hover:opacity-75">
              Book
            </Link>
            <Link href="/contact" className="transition hover:opacity-75">
              Contact
            </Link>

            {!loggedIn ? (
              <Link
                href="/login"
                className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#8f3c4e] shadow-sm transition hover:bg-white"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#f8edd9] text-[0.85rem] font-bold tracking-[0.08em] text-[#7a2f3f] shadow-[0_10px_22px_rgba(0,0,0,0.10)] transition hover:opacity-90"
                aria-label="Go to profile"
                title="Profile"
              >
                {initials}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Title */}
      <section className="mx-auto max-w-6xl px-6 pt-12 md:px-10 md:pt-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#a24e5f]">Appointment</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[0.03em] md:text-5xl">
            Book an Appointment
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#7b6e68] md:text-lg">
            Fill in your details and select a service, date, and time.
          </p>
        </div>

        <div className="mt-8 h-px bg-[#cdbfac]" />
      </section>

      {/* Form */}
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-10 md:px-10 md:pt-12">
        <div className="rounded-[28px] border border-[#eadcc6] bg-[#f8ecd8]/70 px-6 py-8 shadow-[0_22px_60px_rgba(88,65,36,0.10)] md:px-12 md:py-12">
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              {/* Personal info */}
              <div className="rounded-[22px] border border-[#eadcc6] bg-white/55 p-6 shadow-[0_12px_28px_rgba(88,65,36,0.08)] md:p-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">
                  Personal Information
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#23181a]">
                      Full Name <span className="text-[#a24e5f]">*</span>
                    </label>
                    <input
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#23181a]">
                      Phone No. <span className="text-[#a24e5f]">*</span>
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15"
                    />
                  </div>
                </div>
              </div>

              {/* Booking details */}
              <div className="rounded-[22px] border border-[#eadcc6] bg-white/55 p-6 shadow-[0_12px_28px_rgba(88,65,36,0.08)] md:p-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">
                  Booking Details
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#23181a]">
                      Select Service <span className="text-[#a24e5f]">*</span>
                    </label>

                    <select
                      value={form.serviceId}
                      onChange={(e) => update("serviceId", e.target.value)}
                      disabled={loadingServices}
                      className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15 disabled:opacity-60"
                    >
                      <option value="" disabled>
                        {loadingServices ? "Loading services..." : "Choose a service"}
                      </option>
                      {services.map((s) => (
                        <option key={s.serviceId} value={String(s.serviceId)}>
                          {s.type}
                        </option>
                      ))}
                    </select>

                    {selectedService ? (
                      <p className="mt-2 text-xs text-[#7b6e68]">
                        Category:{" "}
                        <span className="font-semibold text-[#23181a]">{selectedService.category ?? "—"}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#23181a]">
                        Select Date <span className="text-[#a24e5f]">*</span>
                      </label>
                      <input
                        value={form.date}
                        onChange={(e) => update("date", e.target.value)}
                        type="date"
                        className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-[#23181a]">
                        Select Time <span className="text-[#a24e5f]">*</span>
                      </label>
                      <select
                        value={form.time}
                        onChange={(e) => update("time", e.target.value)}
                        className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15"
                      >
                        <option value="" disabled>
                          Choose time
                        </option>
                        {times.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#23181a]">
                      Select Staff (filtered by service)
                    </label>

                    <select
                      value={form.staffId}
                      onChange={(e) => update("staffId", e.target.value)}
                      disabled={!form.serviceId || loadingStaff}
                      className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15 disabled:opacity-60"
                    >
                      <option value="any">
                        {!form.serviceId
                          ? "Select a service first"
                          : loadingStaff
                            ? "Loading staff..."
                            : "Any staff"}
                      </option>

                      {staffOptions.map((st) => (
                        <option key={st.staffId} value={String(st.staffId)}>
                          {st.name}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-[#7b6e68]">Choosing “Any staff” helps us confirm faster.</p>

                    {form.serviceId && !loadingStaff && staffOptions.length === 0 ? (
                      <p className="mt-2 text-xs text-[#a24e5f]">
                        No staff found for this service. Please choose “Any staff” or assign staff to this service in
                        Admin/Prisma Studio.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <button
                type="submit"
                className="w-full max-w-md rounded-xl bg-[#cb7885] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_34px_rgba(98,46,56,0.22)] transition hover:bg-[#b96877]"
              >
                Continue to Payment
              </button>
              <p className="text-xs text-[#7b6e68]">You’ll choose the payment method next.</p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}