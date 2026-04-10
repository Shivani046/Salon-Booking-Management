"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function ContactPage() {
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

  // Contact form state (demo)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill all fields.");
      return;
    }

    alert("Thanks! Your message has been sent (demo).");
    setName("");
    setEmail("");
    setMessage("");
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
            <Link
              href="/contact"
              className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#8f3c4e] shadow-sm transition hover:bg-white"
            >
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

      {/* Title */}
      <section className="mx-auto max-w-6xl px-6 pt-12 md:px-10 md:pt-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#a24e5f]">
            Get in touch
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[0.03em] md:text-5xl">
            Contact
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#7b6e68] md:text-lg">
            Questions about services, pricing, or booking? Send us a message and we’ll reply soon.
          </p>
        </div>

        <div className="mt-8 h-px bg-[#cdbfac]" />
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-10 md:px-10 md:pt-12">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          {/* Contact info card */}
          <div className="rounded-[28px] border border-[#eadcc6] bg-white/55 p-7 shadow-[0_22px_60px_rgba(88,65,36,0.10)] md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#a24e5f]">
              Salon details
            </p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">ERAILE BEAUTY</h2>

            <div className="mt-6 space-y-4 text-sm text-[#6f6460]">
              <div className="rounded-2xl bg-[#fff9f2] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3b2a2d]">
                  Address
                </p>
                <p className="mt-2 leading-6">
                  12, Main Road, City Center
                  <br />
                  Your City, Your State
                </p>
              </div>

              <div className="rounded-2xl bg-[#fff9f2] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3b2a2d]">
                  Phone
                </p>
                <p className="mt-2 leading-6">+91 98765 43210</p>
              </div>

              <div className="rounded-2xl bg-[#fff9f2] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3b2a2d]">
                  Email
                </p>
                <p className="mt-2 leading-6">erailebeauty@gmail.com</p>
              </div>

              <div className="rounded-2xl bg-[#98a07b] p-5 text-white shadow-[0_14px_34px_rgba(88,65,36,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/85">
                  Hours
                </p>
                <p className="mt-2 leading-6 text-white/95">
                  Mon – Sat: 10:00 AM – 7:00 PM
                  <br />
                  Sun: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="overflow-hidden rounded-[28px] border border-[#eadcc6] bg-[#f8ecd8]/60 shadow-[0_22px_60px_rgba(88,65,36,0.10)]">
            <div className="bg-[linear-gradient(180deg,#fff7ef_0%,#f9ebde_100%)] px-7 py-6 md:px-10 md:py-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#a24e5f]">
                Message us
              </p>
              <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                Send a message
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6f6460]">
                Share what you need and we’ll get back to you.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="space-y-4 bg-[#98a07b] px-7 py-6 md:px-10 md:py-8"
            >
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-white/55 bg-white px-4 py-2.5 text-sm text-[#23181a] outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white">
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/55 bg-white px-4 py-2.5 text-sm text-[#23181a] outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-white">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-xl border border-white/55 bg-white px-4 py-2.5 text-sm text-[#23181a] outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#cb7885] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_34px_rgba(98,46,56,0.22)] transition hover:bg-[#b96877]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}