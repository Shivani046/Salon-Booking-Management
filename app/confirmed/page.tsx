"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function ConfirmedPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("User");

  useEffect(() => {
    const v = localStorage.getItem("isLoggedIn");
    const n = localStorage.getItem("profileName");
    setLoggedIn(v === "true");
    setProfileName(n?.trim() ? n : "User");
  }, []);

  const initials = useMemo(() => getInitials(profileName), [profileName]);

  const details = useMemo(() => {
    return {
      service: searchParams.get("service") || "—",
      staff: searchParams.get("staff") || "—",
      date: searchParams.get("date") || "—",
      time: searchParams.get("time") || "—",
      total: searchParams.get("total") || "—",
    };
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8d9e3_0%,#f8edd9_36%,#f7ecd8_100%)] text-[#23181a]">
      {/* Navbar */}
      <header className="bg-[#cb7885] text-black shadow-[0_8px_18px_rgba(98,46,56,0.14)]">
        <nav className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-12">
          <Link href="/" className="text-[1.55rem] font-semibold tracking-[0.04em]">
            ERAILE BEAUTY
          </Link>

          <div className="hidden items-center gap-8 text-[0.92rem] font-medium uppercase tracking-[0.12em] md:flex">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>

            {!loggedIn ? (
              <Link href="/login" className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-[#8f3c4e]">
                Login
              </Link>
            ) : (
              <button onClick={() => router.push("/profile")} className="h-10 w-10 rounded-full bg-[#f8edd9] font-bold text-[#7a2f3f]">
                {initials}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Content */}
      <section className="mx-auto flex min-h-[calc(100vh-76px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-[860px] rounded-[28px] border bg-white/55 backdrop-blur">
          <div className="grid md:grid-cols-[1fr_1.15fr]">
            <div className="flex flex-col items-center justify-center px-8 py-10 text-center">
              <div className="h-28 w-28 rounded-full bg-[#98a07b] flex items-center justify-center">
                ✔
              </div>

              <h1 className="mt-4 text-3xl font-semibold">Booking Confirmed</h1>
              <p className="mt-2 text-sm text-[#6f6460]">
                Your appointment has been scheduled successfully.
              </p>
            </div>

            <div className="bg-[#fff9f2] px-8 py-10">
              <h2 className="text-sm font-semibold uppercase">Details</h2>

              <div className="mt-4 space-y-4">
                <Row label="Service" value={details.service} />
                <Row label="Staff" value={details.staff} />
                <Row label="Date" value={details.date} />
                <Row label="Time" value={details.time} />
                <Row label="Amount" value={details.total} />
              </div>

              <button onClick={() => router.push("/")} className="mt-6 w-full bg-[#cb7885] text-white py-2 rounded">
                OK
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}