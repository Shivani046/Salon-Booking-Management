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
const [loggedIn, setLoggedIn] = useState(false);
const [profileName, setProfileName] = useState("User");

function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
setForm((prev) => ({ ...prev, [key]: value }));
}

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

// ✅ TIME LOGIC (FIXED POSITION)
const times = useMemo(() => {
const slots: string[] = [];
for (let hour = 10; hour <= 20; hour++) {
slots.push(`${hour.toString().padStart(2, "0")}:00`);
slots.push(`${hour.toString().padStart(2, "0")}:30`);
}
return slots;
}, []);

const today = new Date().toISOString().split("T")[0];

const filteredTimes = useMemo(() => {
if (form.date !== today) return times;


const now = new Date();
const current = now.getHours() * 60 + now.getMinutes();

return times.filter((t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m > current;
});


}, [form.date, times]);

return ( <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">


  {/* NAVBAR */}
  <header className="bg-[#cb7885] shadow">
    <nav className="flex justify-between px-6 py-4">
      <Link href="/">ERAILE BEAUTY</Link>

      {!loggedIn ? (
        <Link href="/login">Login</Link>
      ) : (
        <button onClick={() => router.push("/profile")}>
          {initials}
        </button>
      )}
    </nav>
  </header>

  {/* FORM */}
  <section className="max-w-4xl mx-auto p-6">
    <form onSubmit={onSubmit} className="space-y-6">

      <input
        value={form.fullName}
        onChange={(e) => update("fullName", e.target.value)}
        placeholder="Full Name"
        className="w-full border p-3"
      />

      <input
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        placeholder="Phone"
        className="w-full border p-3"
      />

      <select
        value={form.category}
        onChange={(e) => update("category", e.target.value)}
        className="w-full border p-3"
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <select
        value={form.serviceId}
        onChange={(e) => update("serviceId", e.target.value)}
        className="w-full border p-3"
      >
        <option value="">Select Service</option>
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
          className="border p-3"
        />

        <select
          value={form.time}
          onChange={(e) => update("time", e.target.value)}
          className="border p-3"
        >
          <option value="">Select Time</option>
          {filteredTimes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <button className="bg-[#cb7885] text-white px-6 py-3">
        Continue
      </button>

    </form>
  </section>

</main>


);
}


