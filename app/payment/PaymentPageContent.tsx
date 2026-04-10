"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type PaymentMethod = "Cash at the salon" | "UPI" | "Card payment";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("User");
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("Cash at the salon");

  useEffect(() => {
    const isLogged = localStorage.getItem("isLoggedIn");
    const name = localStorage.getItem("profileName");
    setLoggedIn(isLogged === "true");
    setProfileName(name || "User");
  }, []);

  const initials = useMemo(() => getInitials(profileName), [profileName]);

  // Get all params, including IDs
  const appointment = useMemo(() => ({
    fullName: searchParams.get("fullName") || "",
    phone: searchParams.get("phone") || "",
    service: searchParams.get("service") || "",
    staff: searchParams.get("staff") || "ANY",
    date: searchParams.get("date") || "",
    time: searchParams.get("time") || "",
    total: searchParams.get("total") || "0",
    serviceId: searchParams.get("serviceId") || "",
    staffId: searchParams.get("staffId") || "",
  }), [searchParams]);

  if (!appointment.fullName) {
    return (
      <div className="p-10 text-center text-red-500">
        No booking data found
      </div>
    );
  }

  function toDateStringISO(dateStr: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
  }

  async function onConfirm() {
    if (loading) return;

    try {
      setLoading(true);

      // 1. Get logged-in customer ID
      const custId = localStorage.getItem("custId");
      if (!custId) {
        alert("You must be logged in to confirm a booking.");
        setLoading(false);
        return;
      }

      // 2. Parse and send IDs
      const serviceId = Number(appointment.serviceId);
      let staffId: number | null = null;
      if (appointment.staffId && appointment.staffId !== "any") {
        staffId = Number(appointment.staffId);
      }

      if (!serviceId) {
        alert("Invalid Service selection. Please go back and try again.");
        setLoading(false);
        return;
      }

      // Step 1: POST to create the Appointment
      const appointmentPayload: any = {
        custId: Number(custId),
        serviceId,
        staffId: staffId ?? 1,
        appDate: toDateStringISO(appointment.date),
        appTime: appointment.time,
        amount: Number(appointment.total),
        status: "UPCOMING",
        paymentMethod: method, // optional for receipts/bookkeeping, but not stored now
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentPayload),
      });

      if (!res.ok) {
        try {
          const data = await res.json();
          throw new Error(data?.error || "Failed to save appointment");
        } catch {
          throw new Error("Failed to save appointment");
        }
      }

      const apptResult = await res.json();
      const appointmentId = apptResult?.appointment?.appId; // from backend response

      // Step 2: POST to billing (i.e., add payment)
      // Only if appointment create worked!
      if (appointmentId) {
        await fetch("/api/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            customerId: Number(custId),
            method: (method === "Cash at the salon" ? "Cash" : method.replace(" payment", "")), // match your Payment method
            amount: Number(appointment.total),
          }),
        });
      }

      // Success: redirect
      const params = new URLSearchParams({
        service: appointment.service,
        staff: appointment.staff,
        date: appointment.date,
        time: appointment.time,
        total: appointment.total,
        method,
      });

      router.push(`/confirmed?${params.toString()}`);
    } catch (err: any) {
      console.error(err);
      alert("Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // UI unchanged (your current design)
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      {/* NAVBAR */}
      <header className="bg-[#cb7885] shadow-md">
        <nav className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            ERAILE BEAUTY
          </Link>
          <div className="flex items-center gap-6 text-sm uppercase">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>
            {!loggedIn ? (
              <Link href="/login" className="bg-white px-4 py-2 rounded-full text-xs">
                Login
              </Link>
            ) : (
              <button
                onClick={() => router.push("/profile")}
                className="h-10 w-10 rounded-full bg-[#f8edd9] flex items-center justify-center"
              >
                {initials}
              </button>
            )}
          </div>
        </nav>
      </header>
      {/* TITLE */}
      <section className="text-center pt-10">
        <h1 className="text-3xl font-semibold">Payment</h1>
      </section>
      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-8">
        {/* SUMMARY */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="font-semibold mb-4">Summary</h2>
          <p><b>Name:</b> {appointment.fullName}</p>
          <p><b>Phone:</b> {appointment.phone}</p>
          <p><b>Service:</b> {appointment.service}</p>
          <p><b>Staff:</b> {appointment.staff}</p>
          <p><b>Date:</b> {appointment.date}</p>
          <p><b>Time:</b> {appointment.time}</p>
          <hr className="my-4" />
          <p className="text-lg font-semibold">
            Total: ₹{appointment.total}
          </p>
        </div>
        {/* PAYMENT */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-center font-semibold mb-4">
            Payment Method
          </h2>
          <div className="space-y-3">
            {(["Cash at the salon", "UPI", "Card payment"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`w-full py-2 rounded ${
                  method === m
                    ? "bg-[#cb7885] text-white"
                    : "bg-gray-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="mt-6 w-full bg-[#cb7885] text-white py-3 rounded-xl"
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </section>
    </main>
  );
}