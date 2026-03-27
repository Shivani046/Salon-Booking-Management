"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLoggedIn") === "true";
    }
    return false;
  });

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
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
        if (res.status === 404) setError("User not found.");
        else if (res.status === 401) setError("Incorrect password.");
        else setError(data?.error || "Login failed.");
        return;
      }

      // ✅ STORE USER DATA
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("custId", String(data.custId));
      localStorage.setItem("profileName", data.name);
      localStorage.setItem("profileEmail", data.emailId);
      localStorage.setItem("profilePhone", data.phoneNo);
      localStorage.setItem("profileInitials", getInitials(data.name));
      localStorage.setItem("role", data.role);

      // ✅ ADMIN FLAG
      if (data.role === "admin") {
        localStorage.setItem("admin:isLoggedIn", "true");
      }

      setLoggedIn(true);

      // ✅ REDIRECT BASED ON ROLE
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }

    } catch {
      setError("Server error. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      
      {/* NAVBAR */}
      <header className="bg-[#c27a82] shadow-[0_6px_14px_rgba(0,0,0,0.1)]">
        <nav className="flex items-center justify-between px-8 py-4">

          <Link href="/" className="text-lg font-semibold tracking-[0.08em]">
            ERAILE BEAUTY
          </Link>

          <div className="flex items-center gap-8 text-sm uppercase tracking-[0.18em]">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>

            {!loggedIn ? (
              <Link
                href="/login"
                className="ml-4 rounded-full bg-[#f4e6d8] px-5 py-2 text-xs font-semibold"
              >
                LOGIN
              </Link>
            ) : (
              <div
                onClick={() => router.push("/profile")}
                className="ml-4 h-10 w-10 cursor-pointer rounded-full bg-[#f4e6d8] flex items-center justify-center font-semibold"
              >
                {localStorage.getItem("profileInitials") || "U"}
              </div>
            )}
          </div>

        </nav>
      </header>

      {/* LOGIN FORM */}
      <section className="mx-auto flex max-w-7xl items-center justify-center px-6 py-10 md:min-h-[calc(100vh-76px)] md:px-10 md:py-14">
        <div className="w-full max-w-[560px] rounded-[28px] border border-[#eadcc6] bg-[#f8ecd8]/50 shadow-[0_26px_70px_rgba(88,65,36,0.12)]">

          <div className="bg-[linear-gradient(180deg,#fff7ef_0%,#f9ebde_100%)] px-8 py-7 text-center">
            <h2 className="text-[2rem] font-semibold">
              Login Account
            </h2>
            <p className="mt-2 text-sm text-[#6f6460]">
              Sign in to continue
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 bg-[#98a07b] px-8 py-7">

            {error && (
              <div className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="text-sm text-white">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-white">Password</label>

              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl bg-white px-4 py-2.5 pr-12 text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#cb7885] py-3 text-white font-semibold"
            >
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