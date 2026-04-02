"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

// Modal Overlay style for background dimming
const ModalOverlay = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center min-h-screen">
    {children}
  </div>
);

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

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone & password validation
  const isPhoneValid = /^\d{10}$/.test(phoneNo);
  const phoneMessage =
    phoneNo && !isPhoneValid
      ? "Phone number must be exactly 10 digits"
      : "";

  // Password validation rules
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

      // Success Modal
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

  // For accessibility/focus on modal open
  const modalRef = useRef<HTMLDivElement>(null);
  // Focus the modal when it appears (UX)
  // (Not necessary but improves accessibility experience)
  // useEffect(() => { modalRef.current?.focus(); }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a] relative overflow-hidden">

      {/* App Navbar */}
      <header className="bg-[#cb7885] shadow">
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

      {/* Modal Overlay for form */}
      <ModalOverlay>
        <div
          ref={modalRef}
          className="w-full max-w-md shadow-2xl bg-white rounded-3xl relative z-50 p-8 py-10 focus:outline-none border border-[#ece0d5] flex flex-col items-center animate-fade-in"
          tabIndex={-1}
        >
          <div className="w-16 h-16 rounded-full bg-[#f7ecd8] mb-6 flex items-center justify-center shadow text-3xl font-bold tracking-wide border-2 border-[#eadcd1]">
            {initials}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Create Your Account</h2>
          <p className="mb-8 text-gray-500 text-center text-sm">
            Sign up instantly. All fields are required.
          </p>
          <form onSubmit={onSubmit} className="w-full space-y-5">
            
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="border border-[#e8bcb9] w-full p-3 rounded-xl text-lg focus:border-[#cb7885] focus:ring-[#cb7885]/60"
            />

            <input
              value={phoneNo}
              onChange={(e) => {
                // restrict input to 10 digits
                let value = e.target.value.replace(/\D/g, "");
                if (value.length > 10) value = value.slice(0, 10);
                setPhoneNo(value);
              }}
              placeholder="Phone (10 digits only)"
              className={`border border-[#e8bcb9] w-full p-3 rounded-xl text-lg focus:border-[#cb7885] focus:ring-[#cb7885]/60 ${phoneNo && !isPhoneValid ? "ring-2 ring-red-400" : ""}`}
              maxLength={10}
              pattern="\d{10}"
              inputMode="numeric"
            />
            <span className="block text-xs text-red-500 mb-2">{phoneMessage}</span>

            <input
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              type="email"
              placeholder="Email"
              className="border border-[#e8bcb9] w-full p-3 rounded-xl text-lg focus:border-[#cb7885] focus:ring-[#cb7885]/60"
              autoComplete="email"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border border-[#e8bcb9] w-full p-3 rounded-xl text-lg focus:border-[#cb7885] focus:ring-[#cb7885]/60 pr-12"
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Password rules feedback */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
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

            {/* Error or Success */}
            {error && error !== "success" && (
              <div className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white mb-2">
                {error}
              </div>
            )}
            {error === "success" && (
              <div className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white mb-2 text-center">
                Account created! Redirecting...
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name || !phoneNo || !emailId || !password || !isPhoneValid || !isPasswordValid}
              className={`w-full rounded-xl py-3 font-semibold text-white transition shadow
                ${loading ? "bg-[#b46a75] cursor-not-allowed" : "bg-[#cb7885] hover:bg-[#b46a75]"}
                `}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium text-[#cb7885] hover:text-[#b46a75]">
              Login
            </Link>
          </p>
        </div>
      </ModalOverlay>
    </main>
  );
}