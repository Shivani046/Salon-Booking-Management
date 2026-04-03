"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

// Dims the background for modal effect
const ModalOverlay = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center min-h-screen">
    {children}
  </div>
);

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isPhoneValid = /^\d{10}$/.test(phoneNo);
  const phoneMessage =
    phoneNo && !isPhoneValid ? "Phone number must be exactly 10 digits" : "";

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid = Object.values(rules).every(Boolean);

  const initials = useMemo(() => getInitials(name || "User"), [name]);

  // Form handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phoneNo || !emailId || !password) {
      setError("Please fill all fields.");
      return;
    }
    if (!isPhoneValid) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password does not meet requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customers/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNo, emailId, password }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setError("Server error. Please try again.");
        return;
      }
      if (!res.ok) {
        if (res.status === 409) setError("User already exists.");
        else if (res.status === 400) setError("Invalid input.");
        else setError(data?.error || "Signup failed");
        return;
      }
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("custId", String(data.custId));
      localStorage.setItem("profileName", data.name);
      localStorage.setItem("profilePhone", data.phoneNo);
      localStorage.setItem("profileEmail", data.emailId);
      localStorage.setItem("profileInitials", initials);

      setTimeout(() => {
        router.push("/book");
      }, 1200);
      setError("success");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Modal Overlay for Form */}
      <ModalOverlay>
        <div className="w-full max-w-3xl bg-white rounded-3xl flex flex-col md:flex-row items-stretch shadow-2xl border border-[#eadcc6] overflow-hidden">
          {/* Profile Visual Section (Left) */}
          <div className="md:w-2/5 flex flex-col items-center justify-center bg-[#f7ecd8] p-10 md:rounded-l-3xl">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#cb7885]/10 flex items-center justify-center text-5xl font-bold shadow-inner border-2 border-[#eadcd1] mb-8">
              {initials}
            </div>
            <h2 className="text-xl font-semibold tracking-wide mb-2 text-[#cb7885]">Welcome!</h2>
            <p className="text-sm text-gray-500 text-center">
              Create your account below to begin booking your beauty experience.
            </p>
          </div>
          {/* Form Section (Right) */}
          <form
            onSubmit={onSubmit}
            autoComplete="on"
            className="md:w-3/5 w-full flex flex-col justify-center px-10 py-8 gap-3"
          >
            <h3 className="text-2xl font-bold mb-3 text-[#23181a]">Sign Up</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                name="name"
                autoComplete="name"
                placeholder="Full Name"
                className="border border-[#e8bcb9] px-4 py-2 rounded-xl text-lg focus:border-[#cb7885] flex-1"
              />
              <input
                value={phoneNo}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > 10) value = value.slice(0, 10);
                  setPhoneNo(value);
                }}
                name="tel"
                autoComplete="tel"
                placeholder="Phone (10 digits)"
                className={`border border-[#e8bcb9] px-4 py-2 rounded-xl text-lg focus:border-[#cb7885] flex-1 ${
                  phoneNo && !isPhoneValid ? "ring-2 ring-red-400" : ""
                }`}
                maxLength={10}
                pattern="\d{10}"
                inputMode="numeric"
              />
            </div>
            {phoneMessage && (
              <span className="text-xs text-red-500 mb-1">{phoneMessage}</span>
            )}
            <input
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              name="email"
              autoComplete="username email"
              type="email"
              placeholder="Email"
              className="border border-[#e8bcb9] px-4 py-2 rounded-xl text-lg focus:border-[#cb7885] mt-2"
            />
            {/* Password */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                autoComplete="new-password"
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
            {/* Password Rules */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-2 mb-1">
              <p className={rules.length ? "text-green-600" : "text-red-500"}>
                • At least 8 characters
              </p>
              <p className={rules.upper ? "text-green-600" : "text-red-500"}>
                • Uppercase letter
              </p>
              <p className={rules.lower ? "text-green-600" : "text-red-500"}>
                • Lowercase letter
              </p>
              <p className={rules.number ? "text-green-600" : "text-red-500"}>
                • Number
              </p>
              <p className={rules.special ? "text-green-600" : "text-red-500"}>
                • Special character
              </p>
            </div>
            {error && error !== "success" && (
              <div className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white mb-1">
                {error}
              </div>
            )}
            {error === "success" && (
              <div className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white mb-1 text-center">
                Account created! Redirecting...
              </div>
            )}
            <button
              type="submit"
              disabled={
                loading ||
                !name ||
                !phoneNo ||
                !emailId ||
                !password ||
                !isPhoneValid ||
                !isPasswordValid
              }
              className={`w-full rounded-xl py-3 font-semibold text-white mt-3 transition shadow ${
                loading
                  ? "bg-[#b46a75] cursor-not-allowed"
                  : "bg-[#cb7885] hover:bg-[#b46a75]"
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-gray-700 mt-4">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline font-medium text-[#cb7885] hover:text-[#b46a75]"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </ModalOverlay>
    </main>
  );
}