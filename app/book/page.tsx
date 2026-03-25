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
services?: { serviceId: number }[];
};

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
const [staff, setStaff] = useState<StaffRow[]>([]);
const [loading, setLoading] = useState(true);

const [loggedIn, setLoggedIn] = useState(false);
const [profileName, setProfileName] = useState("User");

function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
setForm((prev) => ({ ...prev, [key]: value }));
}

// AUTH STATE
useEffect(() => {
const v = localStorage.getItem("isLoggedIn");
const n = localStorage.getItem("profileName");
setLoggedIn(v === "true");
setProfileName(n || "User");
}, []);

const initials = useMemo(() => {
return profileName
.split(" ")
.map((n) => n[0])
.join("")
.toUpperCase();
}, [profileName]);

// FETCH DATA
useEffect(() => {
(async () => {
try {
const [svcRes, staffRes] = await Promise.all([
fetch("/api/services"),
fetch("/api/staff"),
]);


    setServices(await svcRes.json());
    setStaff(await staffRes.json());
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
})();


}, []);

const categories = useMemo(() => {
return Array.from(
new Set(services.map((s) => s.category).filter(Boolean))
) as string[];
}, [services]);

const filteredServices = useMemo(() => {
return services.filter((s) => s.category === form.category);
}, [services, form.category]);

const selectedService = services.find(
(s) => s.serviceId === Number(form.serviceId)
);

const staffOptions = staff.filter((st) =>
(st.services ?? []).some(
(s) => s.serviceId === Number(form.serviceId)
)
);

useEffect(() => {
setForm((p) => ({ ...p, serviceId: "", staffId: "any" }));
}, [form.category]);

function onSubmit(e: React.FormEvent) {
e.preventDefault();


if (!form.fullName || !form.phone || !form.serviceId) {
  alert("Please fill all required fields.");
  return;
}

const params = new URLSearchParams({
  fullName: form.fullName,
  phone: form.phone,
  serviceId: form.serviceId,
  service: selectedService?.type || "",
  date: form.date,
  time: form.time,
});

router.push(`/payment?${params.toString()}`);

}

return ( <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">


  {/* NAVBAR */}
  <header className="bg-[#cb7885] shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
    <nav className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-12">

      <Link href="/" className="text-[1.4rem] font-semibold tracking-[0.05em]">
        ERAILE BEAUTY
      </Link>

      <div className="hidden md:flex items-center gap-10 text-[0.85rem] uppercase tracking-[0.2em]">
        <Link href="/">Home</Link>
        <Link href="/services">Services</Link>
        <Link href="/book">Book</Link>
        <Link href="/contact">Contact</Link>
      </div>

      {!loggedIn ? (
        <Link
          href="/login"
          className="rounded-full bg-white/80 px-5 py-2 text-xs font-semibold text-[#8f3c4e]"
        >
          Login
        </Link>
      ) : (
        <button
          onClick={() => router.push("/profile")}
          className="h-11 w-11 rounded-full bg-[#f8edd9] flex items-center justify-center text-sm font-bold text-[#7a2f3f]"
        >
          {initials}
        </button>
      )}

    </nav>
  </header>

  {/* TITLE */}
  <section className="text-center py-10">
    <h1 className="text-4xl font-semibold">Book an Appointment</h1>
    <p className="text-[#7b6e68] mt-2">
      Fill in your details and select a service, date, and time.
    </p>
  </section>

  {/* FORM */}
  <section className="max-w-6xl mx-auto px-6 pb-14">
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-8">

      {/* PERSONAL CARD */}
      <div className="rounded-[24px] bg-white/70 border border-[#eadcc6] px-8 py-8 shadow-md max-w-[520px] w-full mx-auto">
        <h2 className="text-xs uppercase tracking-[0.35em] text-[#a24e5f] text-center font-semibold">
          Personal Information
        </h2>

        <div className="mt-8 space-y-6">
          <input
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-2xl border px-5 py-3"
          />

          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="Phone"
            className="w-full rounded-2xl border px-5 py-3"
          />
        </div>
      </div>

      {/* BOOKING CARD */}
      <div className="rounded-[24px] bg-white/70 border border-[#eadcc6] px-8 py-8 shadow-md max-w-[520px] w-full mx-auto">
        <h2 className="text-xs uppercase tracking-[0.35em] text-[#a24e5f] text-center font-semibold">
          Booking Details
        </h2>

        <div className="mt-8 space-y-5">

          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-2xl border px-5 py-3"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={form.serviceId}
            onChange={(e) => update("serviceId", e.target.value)}
            disabled={!form.category}
            className="w-full rounded-2xl border px-5 py-3"
          >
            <option value="">
              {!form.category ? "Select category first" : "Choose service"}
            </option>

            {filteredServices.map((s) => (
              <option key={s.serviceId} value={s.serviceId}>
                {s.type}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="rounded-2xl border px-5 py-3"
            />

            <input
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              placeholder="Time"
              className="rounded-2xl border px-5 py-3"
            />
          </div>

          <select
            value={form.staffId}
            onChange={(e) => update("staffId", e.target.value)}
            disabled={!form.serviceId}
            className="w-full rounded-2xl border px-5 py-3"
          >
            <option value="any">Any staff</option>

            {staffOptions.map((st) => (
              <option key={st.staffId} value={st.staffId}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BUTTON */}
      <div className="md:col-span-2 flex justify-center pt-6">
        <button
          type="submit"
          className="bg-[#cb7885] text-white px-10 py-3 rounded-xl font-semibold hover:bg-[#b96877]"
        >
          Continue
        </button>
      </div>

    </form>
  </section>

</main>


);
}

