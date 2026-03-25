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
const [staff, setStaff] = useState<StaffRow[]>([]);
const [profileName, setProfileName] = useState("User");
const [loggedIn, setLoggedIn] = useState(false);

function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
setForm((prev) => ({ ...prev, [key]: value }));
}

useEffect(() => {
const n = localStorage.getItem("profileName");
const l = localStorage.getItem("isLoggedIn");
setProfileName(n || "User");
setLoggedIn(l === "true");
}, []);

const initials = useMemo(() => getInitials(profileName), [profileName]);

useEffect(() => {
(async () => {
const [svcRes, staffRes] = await Promise.all([
fetch("/api/services"),
fetch("/api/staff"),
]);


  setServices(await svcRes.json());
  setStaff(await staffRes.json());
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

const staffOptions = useMemo(() => {
return staff.filter((st) =>
(st.services ?? []).some(
(s) => s.serviceId === Number(form.serviceId)
)
);
}, [staff, form.serviceId]);

// 24h time slots
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
  alert("Fill required fields");
  return;
}

const params = new URLSearchParams({
  fullName: form.fullName,
  phone: form.phone,
  serviceId: form.serviceId,
  date: form.date,
  time: form.time,
});

router.push(`/payment?${params.toString()}`);

}

return ( <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">

  {/* NAVBAR */}
  <header className="bg-[#c27a82] shadow">
    <nav className="flex items-center justify-between px-10 py-4">

      <div className="flex gap-10 uppercase text-sm tracking-widest">
        <Link href="/">Home</Link>
        <Link href="/services">Services</Link>
        <Link href="/book">Book</Link>
        <Link href="/contact">Contact</Link>
      </div>

      {loggedIn && (
        <div
          onClick={() => router.push("/profile")}
          className="h-10 w-10 rounded-full bg-[#f4e6d8] flex items-center justify-center font-semibold cursor-pointer"
        >
          {initials}
        </div>
      )}
    </nav>
  </header>

  {/* TITLE */}
  <section className="text-center pt-12">
    <h1 className="text-5xl font-semibold">Book an Appointment</h1>
    <p className="mt-3 text-[#7b6e68]">
      Fill in your details and select a service, date, and time.
    </p>
    <div className="mt-6 h-px bg-[#cdbfac] max-w-4xl mx-auto" />
  </section>

  {/* CARDS */}
  <section className="max-w-6xl mx-auto mt-12 px-6">
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-10">

      {/* PERSONAL CARD */}
      <div className="rounded-3xl bg-white/70 border border-[#eadcc6] p-8 shadow-lg">
        <h2 className="text-sm tracking-[0.3em] text-[#a24e5f] font-semibold">
          PERSONAL INFORMATION
        </h2>

        <div className="mt-6 space-y-4">
          <input
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="Phone"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>
      </div>

      {/* BOOKING CARD */}
      <div className="rounded-3xl bg-white/70 border border-[#eadcc6] p-8 shadow-lg">
        <h2 className="text-sm tracking-[0.3em] text-[#a24e5f] font-semibold">
          BOOKING DETAILS
        </h2>

        <div className="mt-6 space-y-4">

          {/* CATEGORY */}
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* SERVICE */}
          <select
            value={form.serviceId}
            onChange={(e) => update("serviceId", e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">
              {form.category ? "Choose service" : "Select category first"}
            </option>
            {filteredServices.map((s) => (
              <option key={s.serviceId} value={s.serviceId}>
                {s.type}
              </option>
            ))}
          </select>

          {/* DATE + TIME */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="rounded-xl border px-4 py-3"
            />

            <select
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className="rounded-xl border px-4 py-3"
            >
              <option value="">Select Time</option>
              {times.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* STAFF */}
          <select
            value={form.staffId}
            onChange={(e) => update("staffId", e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
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

    </form>

    {/* BUTTON */}
    <div className="flex justify-center mt-10">
      <button
        onClick={onSubmit}
        className="bg-[#c27a82] text-white px-10 py-3 rounded-xl"
      >
        Continue
      </button>
    </div>
  </section>

</main>


);
}
