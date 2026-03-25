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

  const [showPassword, setShowPassword] = useState(false);

  const initials = useMemo(() => getInitials(name || "User"), [name]);

  // 🔐 Password rules
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phoneNo || !emailId || !password) {
      alert("Please fill all fields.");
      return;
    }

    if (!isPasswordValid) {
      alert("Password does not meet requirements.");
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
        alert("Server error. Please try again.");
        return;
      }

      if (!res.ok) {
        if (res.status === 409) {
          alert("User already exists.");
        } else if (res.status === 400) {
          alert("Invalid input.");
        } else {
          alert(data?.error || "Signup failed");
        }
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("custId", String(data.custId));
      localStorage.setItem("profileName", data.name);
      localStorage.setItem("profilePhone", data.phoneNo);
      localStorage.setItem("profileEmail", data.emailId);
      localStorage.setItem("profileInitials", initials);

      alert("Account created successfully!");
      router.push("/book");

    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">

      {/* Navbar */}
      <header className="bg-[#cb7885] shadow">
        <nav className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            ERAILE BEAUTY
          </Link>

          <div className="hidden md:flex gap-6 text-sm uppercase">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>

            <Link href="/login" className="bg-white px-4 py-2 rounded-full text-xs">
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Title */}
      <section className="text-center pt-12">
        <h1 className="text-4xl font-semibold">Create Account</h1>
        <p className="mt-2 text-gray-500">
          Your account will be created instantly
        </p>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 pt-10">
        <form onSubmit={onSubmit} className="space-y-6">

          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="border p-3 rounded"
            />

            <input
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="Phone"
              className="border p-3 rounded"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              placeholder="Email"
              className="border p-3 rounded"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border p-3 rounded w-full pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* 🔐 PASSWORD RULES */}
          <div className="text-sm space-y-1">
            <p className={rules.length ? "text-green-600" : "text-red-500"}>
              • At least 8 characters
            </p>
            <p className={rules.upper ? "text-green-600" : "text-red-500"}>
              • One uppercase letter
            </p>
            <p className={rules.lower ? "text-green-600" : "text-red-500"}>
              • One lowercase letter
            </p>
            <p className={rules.number ? "text-green-600" : "text-red-500"}>
              • One number
            </p>
            <p className={rules.special ? "text-green-600" : "text-red-500"}>
              • One special character
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#cb7885] text-white py-3 rounded"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>
      </section>
    </main>
  );
}