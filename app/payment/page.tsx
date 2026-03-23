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

  const appointment = useMemo(() => {
    const fullName = searchParams.get("fullName") || "—";
    const phone = searchParams.get("phone") || "—";
    const service = searchParams.get("service") || "—";
    const staff = searchParams.get("staff") || "—";
    const date = searchParams.get("date") || "—";
    const time = searchParams.get("time") || "—";
    const total = searchParams.get("total") || "—";
    return { fullName, phone, service, staff, date, time, total };
  }, [searchParams]);

  const [method, setMethod] = useState<PaymentMethod>("Cash at the salon");

  function onConfirm() {
    const params = new URLSearchParams({
      service: appointment.service,
      staff: appointment.staff,
      date: appointment.date,
      time: appointment.time,
      total: appointment.total,
      method,
    });

    router.push(`/confirmed?${params.toString()}`);
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

      {/* Compact Title */}
      <section className="mx-auto max-w-5xl px-6 pt-8 md:px-10 md:pt-10">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#a24e5f]">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[0.03em] md:text-4xl">
            Payment
          </h1>
        </div>
      </section>

      {/* Extra-compact cards */}
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-6 md:px-10 md:pb-12">
        <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
          {/* Appointment details */}
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[18px] border border-[#eadcc6] bg-white/55 shadow-[0_12px_28px_rgba(88,65,36,0.10)]">
            <div className="bg-[#6f85a8] px-5 py-3 text-center text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-white/80">
                Appointment Details
              </p>
              <h2 className="mt-0.5 text-base font-semibold tracking-[0.06em]">
                Summary
              </h2>
            </div>

            <div className="bg-[#e7c0b6] px-5 py-4">
              <dl className="space-y-3 text-[0.86rem]">
                <MiniRow k="Service" v={appointment.service} />
                <MiniRow k="Staff" v={appointment.staff} />
                <MiniRow k="Date" v={appointment.date} />
                <MiniRow k="Time" v={appointment.time} />

                <div className="h-px bg-black/15" />

                <div className="flex items-center justify-between">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3b2a2d]">
                    Total
                  </dt>
                  <dd className="text-sm font-bold text-[#23181a]">{appointment.total}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payment methods */}
          <div className="mx-auto w-full max-w-[420px] space-y-4">
            <div className="rounded-[18px] border border-[#eadcc6] bg-white/55 p-5 shadow-[0_12px_28px_rgba(88,65,36,0.10)]">
              <h2 className="text-center text-lg font-semibold tracking-[0.04em]">
                Payment Methods
              </h2>

              <div className="mt-4 space-y-2.5">
                {(["Cash at the salon", "UPI", "Card payment"] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`w-full rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition
                      ${
                        method === m
                          ? "bg-[#cb7885] text-white shadow-[0_10px_22px_rgba(98,46,56,0.18)]"
                          : "bg-[#e6e2dc] text-[#23181a] hover:bg-[#ddd7cf]"
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onConfirm}
              className="w-full rounded-full border-2 border-black bg-[#cb7885] px-7 py-2.5 text-sm font-semibold uppercase tracking-[0.22em] text-black shadow-[0_14px_34px_rgba(0,0,0,0.12)] transition hover:opacity-90"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3b2a2d]">
        {k}
      </dt>
      <dd className="max-w-[62%] text-right text-[0.9rem] font-medium leading-5 text-[#23181a]">
        {v}
      </dd>
    </div>
  );
}