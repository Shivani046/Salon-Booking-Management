"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function ConfirmedPage() {
  const searchParams = useSearchParams();
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

  const details = useMemo(() => {
    const service = searchParams.get("service") || "—";
    const staff = searchParams.get("staff") || "—";
    const date = searchParams.get("date") || "—";
    const time = searchParams.get("time") || "—";
    const total = searchParams.get("total") || "—";
    return { service, staff, date, time, total };
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

            {/* initials avatar -> goes to profile */}
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

      {/* Center panel */}
      <section className="mx-auto flex min-h-[calc(100vh-76px)] items-center justify-center px-6 py-10 md:px-10">
        <div className="w-full max-w-[860px] rounded-[28px] border border-[#eadcc6] bg-white/55 shadow-[0_22px_60px_rgba(88,65,36,0.12)] backdrop-blur">
          <div className="grid gap-0 md:grid-cols-[1fr_1.15fr]">
            {/* Left: check + message */}
            <div className="flex flex-col items-center justify-center gap-4 px-8 py-10 text-center md:px-10">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-[#98a07b] shadow-[0_18px_50px_rgba(88,65,36,0.18)]">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20 7L9 18l-5-5"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#a24e5f]">
                  Success
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[0.10em] md:text-4xl">
                  Booking Confirmed
                </h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#6f6460]">
                  Your appointment has been scheduled successfully. Please keep the details below for
                  reference.
                </p>
              </div>
            </div>

            {/* Right: details card */}
            <div className="border-t border-[#eadcc6] bg-[#fff9f2] px-8 py-10 md:border-l md:border-t-0 md:px-10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.38em] text-[#3b2a2d]">
                Appointment Details
              </h2>

              <div className="mt-5 h-px bg-[#cdbfac]" />

              <dl className="mt-6 space-y-5">
                <Row label="Service" value={details.service} />
                <Row label="Staff" value={details.staff} />
                <Row label="Date" value={details.date} />
                <Row label="Time" value={details.time} />
                <Row label="Amount" value={details.total} />
              </dl>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-8 w-full rounded-xl bg-[#cb7885] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_34px_rgba(98,46,56,0.22)] transition hover:bg-[#b96877]"
              >
                OK
              </button>

              <Link
                href="/"
                className="mt-4 block text-center text-sm text-[#23181a] underline underline-offset-4 opacity-80 transition hover:opacity-100"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <dt className="text-xs font-semibold uppercase tracking-[0.32em] text-[#3b2a2d]">
        {label}
      </dt>
      <dd className="text-right text-base font-semibold text-[#23181a]">{value}</dd>
    </div>
  );
}