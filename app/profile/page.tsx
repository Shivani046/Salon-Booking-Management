"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ActiveTab = "dashboard" | "profile" | "services" | "appointments" | "billing" | "logout";

function UserIcon() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full bg-white/70 shadow-[0_10px_22px_rgba(0,0,0,0.10)]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 21a8 8 0 0 0-16 0" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
          stroke="#6b6b6b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [active] = useState<ActiveTab>("profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    const n = localStorage.getItem("profileName") || "";
    const e = localStorage.getItem("profileEmail") || "";
    const p = localStorage.getItem("profilePhone") || "";

    setName(n);
    setEmail(e);
    setPhone(p);
  }, [router]);

  function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("profileName");
    localStorage.removeItem("profileInitials");
    localStorage.removeItem("profileEmail");
    localStorage.removeItem("profilePhone");
    router.push("/");
  }

  function onSave() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill all fields.");
      return;
    }

    localStorage.setItem("profileName", name.trim());
    localStorage.setItem("profileEmail", email.trim());
    localStorage.setItem("profilePhone", phone.trim());

    setEditing(false);
    alert("Profile saved (demo).");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      {/* Navbar (profile pages use icon, not initials) */}
      <header className="bg-[#cb7885] text-black shadow-[0_8px_18px_rgba(98,46,56,0.14)]">
        <nav className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-12">
          <Link href="/" className="text-[1.55rem] font-semibold tracking-[0.04em]">
            ERAILE BEAUTY
          </Link>

          <div className="hidden items-center gap-10 text-[0.92rem] font-medium uppercase tracking-[0.12em] md:flex">
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
            <UserIcon />
          </div>
        </nav>
      </header>

      {/* Layout */}
      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* Sidebar (smaller like Dashboard) */}
        <aside className="border-r border-black/10 bg-[#d9b7b2]/55">
          <nav className="flex h-full flex-col">
            {/* Dashboard heading */}
            <div className="px-10 py-6 text-left text-base font-semibold uppercase tracking-[0.14em] text-black/80">
              Dashboard
            </div>

            <SideItem label="Profile" active={active === "profile"} onClick={() => router.push("/profile")} />
            <SideItem label="Services" active={active === "services"} onClick={() => router.push("/services")} />
            <SideItem
              label="Appointments"
              active={active === "appointments"}
              onClick={() => router.push("/profile/appointments")}
            />
            <SideItem
              label="Billing History"
              active={active === "billing"}
              onClick={() => router.push("/profile/billing")}
            />

            <div className="mt-auto">
              <SideItem label="Logout" active={active === "logout"} onClick={logout} />
            </div>
          </nav>
        </aside>

        {/* Main */}
        <div className="bg-[#f7ecd8] px-6 py-10 md:px-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-semibold tracking-[0.12em]">PROFILE</h1>
            <div className="mt-3 h-px w-full bg-black/20" />

            <div className="mt-10 grid gap-10 md:grid-cols-[260px_1fr] md:items-start">
              {/* Big avatar */}
              <div className="flex flex-col items-center">
                <div className="grid h-48 w-48 place-items-center rounded-full bg-[#bdbdbd] shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                  <svg width="110" height="110" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 21a8 8 0 0 0-16 0" stroke="#eeeeee" strokeWidth="2" strokeLinecap="round" />
                    <path
                      d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                      stroke="#eeeeee"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <button
                  type="button"
                  className="mt-4 rounded-md bg-[#d6d6d6] px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] shadow-sm transition hover:bg-[#cfcfcf]"
                  onClick={() => alert("Change photo (demo)")}
                >
                  Change photo
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <Field label="Name" value={name} onChange={setName} disabled={!editing} />
                <Field label="Email Address" value={email} onChange={setEmail} disabled={!editing} />
                <Field label="Phone No" value={phone} onChange={setPhone} disabled={!editing} />

                <div className="mt-6 h-px w-full bg-black/20" />

                <div className="mt-8 flex flex-wrap items-center justify-end gap-6">
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={!editing}
                    className={`min-w-[140px] rounded-md px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] shadow-sm ${
                      editing
                        ? "bg-[#cb7885] text-black hover:opacity-90"
                        : "cursor-not-allowed bg-[#cb7885]/50 text-black/60"
                    }`}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="min-w-[140px] rounded-md bg-[#e3c7b7] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-sm transition hover:opacity-90"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-[#6f6460]">
              Tip: login already stores name & email; phone can be added here.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function SideItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-10 py-6 text-left text-base font-medium uppercase tracking-[0.14em] transition ${
        active ? "bg-black/25" : "hover:bg-black/10"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-black">
        {label}
      </label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-white px-4 py-3 text-base outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#cb7885]/55 disabled:bg-white/70"
      />
    </div>
  );
}