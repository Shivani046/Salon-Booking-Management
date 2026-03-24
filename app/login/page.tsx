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
  const [error, setError] = useState("");

  const initials = useMemo(() => getInitials(fullName), [fullName]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(""); // clear previous error

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
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

    let data;

    try {
      data = await res.json();
    } catch {
      setError("Server error. Please try again.");
      return;
    }

    if (!res.ok) {
      if (res.status === 404) {
        setError("User not found.");
      } else if (res.status === 401) {
        setError("Incorrect password.");
      } else if (res.status === 400) {
        setError("Please fill all fields.");
      } else {
        setError(data?.error || "Login failed.");
      }
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
      
      {/* Navbar */}
      <header className="bg-[#cb7885] text-black shadow-[0_8px_18px_rgba(98,46,56,0.14)]">
        <nav className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-12">
          <Link href="/" className="text-[1.55rem] font-semibold tracking-[0.04em]">
            ERAILE BEAUTY
          </Link>
        </nav>
      </header>

      {/* Login Card */}
      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-10 md:min-h-[calc(100vh-76px)] md:px-10 md:py-14">
        <div className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[#eadcc6] bg-[#f8ecd8]/50 shadow-[0_26px_70px_rgba(88,65,36,0.12)]">

          {/* Header */}
          <div className="bg-[linear-gradient(180deg,#fff7ef_0%,#f9ebde_100%)] px-8 py-7 text-center md:px-10">
            <h2 className="mt-3 text-[1.9rem] font-semibold md:text-[2.25rem]">
              Login Account
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#6f6460]">
              Welcome back. Sign in to manage appointments.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4 bg-[#98a07b] px-8 py-7 md:px-10">

            {/* ❗ Error message */}
            {error && (
              <div className="rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-white">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError("");
                }}
                type="text"
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm"
              />
              <p className="text-xs text-white/80">
                Initials: {initials}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-white">Email</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                type="email"
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white">Password</label>
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                type="password"
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm"
              />
            </div>

            <button className="w-full rounded-xl bg-[#cb7885] py-3 text-white font-semibold">
              LOGIN
            </button>

            <p className="text-center text-sm text-white">
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
