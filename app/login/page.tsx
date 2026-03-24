"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function LoginPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const initials = useMemo(() => getInitials(fullName), [fullName]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

if (!email.trim() || !password.trim()) {
  alert("Please enter email and password.");
  return;
}

const res = await fetch("/api/customers/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    emailId: email.trim(),
    password,
  }),
});

const data = await res.json();

if (!res.ok) {
  alert(data?.error ?? "Login failed");
  return;
}

// Save REAL customer info from DB
localStorage.setItem("isLoggedIn", "true");
localStorage.setItem("custId", String(data.custId));
localStorage.setItem("profileName", data.name);
localStorage.setItem("profileEmail", data.emailId);
localStorage.setItem("profilePhone", data.phoneNo);
localStorage.setItem("profileInitials", getInitials(data.name));

router.push("/");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      {/* Navbar (same as other pages; no avatar on login) */}
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

      {/* Login Card */}
      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-10 md:min-h-[calc(100vh-76px)] md:px-10 md:py-14">
        <div className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[#eadcc6] bg-[#f8ecd8]/50 shadow-[0_26px_70px_rgba(88,65,36,0.12)]">
          {/* Header strip (beige) */}
          <div className="bg-[linear-gradient(180deg,#fff7ef_0%,#f9ebde_100%)] px-8 py-7 text-center md:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[#a24e5f]">
              
            </p>
            <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[0.02em] md:text-[2.25rem]">
              Login Account
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f6460]">
              Welcome back. Sign in to manage appointments and keep your salon visits simple.
            </p>
          </div>

          {/* Form area (SAGE GREEN) */}
          <form onSubmit={onSubmit} className="space-y-4 bg-[#98a07b] px-8 py-7 md:px-10">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-white/55 bg-white px-4 py-2.5 text-sm text-[#23181a] outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/20"
              />
              <p className="mt-2 text-xs text-white/85">
                Avatar initials preview:{" "}
                <span className="font-semibold text-white">{initials}</span>
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white">
                Email Address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-white/55 bg-white px-4 py-2.5 text-sm text-[#23181a] outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/55 bg-white px-4 py-2.5 text-sm text-[#23181a] outline-none transition focus:border-[#cb7885] focus:ring-4 focus:ring-[#cb7885]/20"
              />
            </div>

            <div className="flex flex-col gap-2 pt-1 text-sm text-white/90 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4 accent-[#cb7885]" />
                Remember me
              </label>

              <Link href="#" className="font-medium text-[#ffe8ec] transition hover:text-white">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#cb7885] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_34px_rgba(98,46,56,0.22)] transition hover:bg-[#b96877]"
            >
              Login
            </button>

            <p className="pt-2 text-center text-sm text-white/90">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
  Create one
</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
