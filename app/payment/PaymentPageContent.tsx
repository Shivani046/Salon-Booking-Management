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

  // AUTH
  useEffect(() => {
    const isLogged = localStorage.getItem("isLoggedIn");
    const name = localStorage.getItem("profileName");

    setLoggedIn(isLogged === "true");
    setProfileName(name || "User");
  }, []);

  const initials = useMemo(() => getInitials(profileName), [profileName]);

  // GET PARAMS
  const appointment = useMemo(() => {
    return {
      fullName: searchParams.get("fullName") || "",
      phone: searchParams.get("phone") || "",
      service: searchParams.get("service") || "",
      staff: searchParams.get("staff") || "ANY",
      date: searchParams.get("date") || "",
      time: searchParams.get("time") || "",
      total: searchParams.get("total") || "0",
    };
  }, [searchParams]);

  if (!appointment.fullName) {
    return (
      <div className="p-10 text-center text-red-500">
        No booking data found
      </div>
    );
  }

  // ✅ FIXED CONFIRM
  async function onConfirm() {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: appointment.fullName,
          phone: appointment.phone,
          service: appointment.service,
          staff: appointment.staff,
          date: appointment.date,
          time: appointment.time,
          total: appointment.total,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save appointment");
      }

      // redirect
      const params = new URLSearchParams({
        service: appointment.service,
        staff: appointment.staff,
        date: appointment.date,
        time: appointment.time,
        total: appointment.total,
        method,
      });

      router.push(`/confirmed?${params.toString()}`);

    } catch (err) {
      console.error(err);
      alert("Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // UI
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