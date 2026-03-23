"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const initials = useMemo(() => getInitials(name || "User"), [name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const n = name.trim();
    const p = phoneNo.trim();
    const em = emailId.trim();

    if (!n || !p || !em || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customers/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, phoneNo: p, emailId: em, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error ?? "Signup failed");
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("custId", String(data.custId));
      localStorage.setItem("profileName", data.name);
      localStorage.setItem("profilePhone", data.phoneNo);
      localStorage.setItem("profileEmail", data.emailId);
      localStorage.setItem("profileInitials", initials);

      router.push("/book");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      {/* Navbar (matches your Book/Appointments pages) */}
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

            <Link
              href="/login"
              className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#8f3c4e] shadow-sm transition hover:bg-white"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Title */}
      <section className="mx-auto max-w-6xl px-6 pt-12 md:px-10 md:pt-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#a24e5f]">
            Customer
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[0.03em] md:text-5xl">
            Create Account
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#7b6e68] md:text-lg">
            Your Customer ID will be created automatically after sign up.
          </p>
        </div>

        <div className="mt-8 h-px bg-[#cdbfac]" />
      </section>

      {/* Form (no card, clean section) */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-10 md:px-10">
        <form onSubmit={onSubmit} className="space-y-7">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Full Name <span className="text-[#a24e5f]">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Phone No. <span className="text-[#a24e5f]">*</span>
              </label>
              <input
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                type="tel"
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email <span className="text-[#a24e5f]">*</span>
              </label>
              <input
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Password <span className="text-[#a24e5f]">*</span>
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Create a password"
                className="w-full rounded-xl border border-[#eadcc6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/15"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#cb7885] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_34px_rgba(98,46,56,0.22)] transition hover:bg-[#b96877] disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="mt-4 text-center text-sm text-[#7b6e68]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#7a2f3f] underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}