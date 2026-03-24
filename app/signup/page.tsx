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
const em = emailId.trim().toLowerCase();

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
      alert("Invalid input. Please check your details.");
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

} catch (err) {
  alert("Something went wrong. Please try again.");
} finally {
  setLoading(false);
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
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/book">Book</Link>
          <Link href="/contact">Contact</Link>

          <Link
            href="/login"
            className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#8f3c4e]"
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
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
          Create Account
        </h1>
        <p className="mt-4 text-[#7b6e68]">
          Your Customer ID will be created automatically after sign up.
        </p>
      </div>

      <div className="mt-8 h-px bg-[#cdbfac]" />
    </section>

    {/* Form */}
    <section className="mx-auto max-w-3xl px-6 pb-16 pt-10 md:px-10">
      <form onSubmit={onSubmit} className="space-y-7">

        <div className="grid gap-5 md:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
          />
          <input
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            placeholder="Phone"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <input
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            placeholder="Email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

      </form>
    </section>

  </main>
);
}