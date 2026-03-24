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
const parts = name.trim().split(/\s+/).slice(0, 2);
return parts.map((p) => p[0].toUpperCase()).join("") || "U";
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
const [loadingServices, setLoadingServices] = useState(true);
const [loadingStaff, setLoadingStaff] = useState(true);

function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
setForm((prev) => ({ ...prev, [key]: value }));
}

// FETCH DATA
useEffect(() => {
(async () => {
try {
const [svcRes, staffRes] = await Promise.all([
fetch("/api/services"),
fetch("/api/staff"),
]);


    const svcData = await svcRes.json();
    const staffData = await staffRes.json();

    setServices(svcData);
    setStaff(staffData);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingServices(false);
    setLoadingStaff(false);
  }
})();


}, []);

// CATEGORY LIST
const categories = useMemo(() => {
return Array.from(
new Set(services.map((s) => s.category).filter(Boolean))
) as string[];
}, [services]);

// FILTERED SERVICES
const filteredServices = useMemo(() => {
if (!form.category) return [];
return services.filter((s) => s.category === form.category);
}, [services, form.category]);

// SELECTED SERVICE
const selectedService = useMemo(() => {
const id = Number(form.serviceId);
return services.find((s) => s.serviceId === id) || null;
}, [form.serviceId, services]);

// STAFF FILTER
const staffOptions = useMemo(() => {
const id = Number(form.serviceId);
return staff.filter((st) =>
(st.services ?? []).some((s) => s.serviceId === id)
);
}, [staff, form.serviceId]);

// RESET SERVICE WHEN CATEGORY CHANGES
useEffect(() => {
setForm((prev) => ({
...prev,
serviceId: "",
staffId: "any",
}));
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


  {/* HEADER */}
  <header className="bg-[#cb7885] text-black px-6 py-4">
    <Link href="/" className="text-xl font-semibold">
      ERAILE BEAUTY
    </Link>
  </header>

  {/* TITLE */}
  <section className="text-center py-10">
    <h1 className="text-4xl font-semibold">Book an Appointment</h1>
    <p className="text-[#7b6e68] mt-2">
      Fill in your details and select a service, date, and time.
    </p>
  </section>

  {/* FORM */}
  <section className="max-w-4xl mx-auto px-6 pb-12">
    <form onSubmit={onSubmit} className="space-y-6">

      {/* PERSONAL */}
      <input
        value={form.fullName}
        onChange={(e) => update("fullName", e.target.value)}
        placeholder="Full Name"
        className="w-full border p-2 rounded"
      />

      <input
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        placeholder="Phone"
        className="w-full border p-2 rounded"
      />

      {/* CATEGORY */}
      <select
        value={form.category}
        onChange={(e) => update("category", e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* SERVICE */}
      <select
        value={form.serviceId}
        onChange={(e) => update("serviceId", e.target.value)}
        disabled={!form.category}
        className="w-full border p-2 rounded"
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

      {/* DATE */}
      <input
        type="date"
        value={form.date}
        onChange={(e) => update("date", e.target.value)}
        className="w-full border p-2 rounded"
      />

      {/* TIME */}
      <input
        value={form.time}
        onChange={(e) => update("time", e.target.value)}
        placeholder="Time"
        className="w-full border p-2 rounded"
      />

      {/* STAFF */}
      <select
        value={form.staffId}
        onChange={(e) => update("staffId", e.target.value)}
        disabled={!form.serviceId}
        className="w-full border p-2 rounded"
      >
        <option value="any">Any staff</option>

        {staffOptions.map((st) => (
          <option key={st.staffId} value={st.staffId}>
            {st.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-[#cb7885] text-white px-6 py-2 rounded"
      >
        Continue
      </button>

    </form>
  </section>

</main>


);
}
