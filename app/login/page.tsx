"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

const ModalOverlay = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center min-h-screen">
    {children}
  </div>
);

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
  const [loading, setLoading] = useState(false); // You can use this if you need

  const initials = useMemo(() => {
    if (typeof window !== "undefined") {
      return getInitials(localStorage.getItem("profileName") || "User");
    }
    return "U";
  }, [loggedIn]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      setLoading(false);
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
        setLoading(false);
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("custId", String(data.custId));
      localStorage.setItem("profileName", data.name);
      localStorage.setItem("profileEmail", data.emailId);
      localStorage.setItem("profilePhone", data.phoneNo);
      localStorage.setItem("profileInitials", getInitials(data.name));
      localStorage.setItem("role", data.role);

      if (data.role === "admin") {
        localStorage.setItem("admin:isLoggedIn", "true");
      }

      setLoggedIn(true);

      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }

    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a] relative overflow-hidden flex items-center justify-center">
      {/* App Navbar */}
      <header className="absolute top-0 left-0 w-full bg-[#cb7885] shadow z-50">
        <nav className="flex items-center justify-between px-8 py-4">
          <Link href="/" className="text-lg font-semibold">
            ERAILE BEAUTY
          </Link>
          <div className="hidden md:flex gap-8 text-sm uppercase">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>
            <Link
              href="/login"
              className="bg-white px-4 py-2 rounded-full text-xs font-semibold"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      <ModalOverlay>
        <div className="w-full max-w-3xl bg-white rounded-3xl flex flex-col md:flex-row items-stretch shadow-2xl border border-[#eadcc6] overflow-hidden">
          {/* Visual/Welcome Section */}
          <div className="md:w-2/5 flex flex-col items-center justify-center bg-[#f7ecd8] p-10 md:rounded-l-3xl">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#cb7885]/10 flex items-center justify-center text-5xl font-bold shadow-inner border-2 border-[#eadcd1] mb-8">
              {initials}
            </div>
            <h2 className="text-xl font-semibold tracking-wide mb-2 text-[#cb7885]">Welcome Back!</h2>
            <p className="text-sm text-gray-500 text-center">
              Enter your email and password to login as a user or admin.
            </p>
          </div>

          {/* Login Form Section */}
          <form
            onSubmit={onSubmit}
            autoComplete="on" // <-- IMPORTANT!
            className="md:w-3/5 w-full flex flex-col justify-center px-10 py-8 gap-3 bg-[#fff7ef]/80"
          >
            <h3 className="text-2xl font-bold mb-2 text-[#23181a]">Sign In</h3>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email" // <-- IMPORTANT!
              autoComplete="username email" // <-- IMPORTANT!
              placeholder="Email"
              className="border border-[#e8bcb9] px-4 py-2 rounded-xl text-lg focus:border-[#cb7885] mb-2"
            />
            <div className="flex items-center gap-2 mb-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password" // <-- IMPORTANT!
                autoComplete="current-password" // <-- IMPORTANT!
                placeholder="Password"
                className="border border-[#e8bcb9] px-4 py-2 rounded-xl text-lg focus:border-[#cb7885] flex-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="px-3 py-2 bg-gray-100 rounded-lg border text-xs"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white mb-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#cb7885] py-3 text-white font-semibold mt-2 transition shadow hover:bg-[#b46a75] disabled:opacity-70"
              disabled={loading || !email || !password}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>

            <p className="text-center text-sm text-gray-700 mt-5">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline font-medium text-[#cb7885] hover:text-[#b46a75]">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </ModalOverlay>
    </main>
  );
}