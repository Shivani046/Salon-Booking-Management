"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Helper: Get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Profile Page Component
export default function ProfilePage() {
  const router = useRouter();

  // Profile details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // For navbar avatar/profile logic
  const [profileName, setProfileName] = useState("User");
  const [loggedIn, setLoggedIn] = useState(false);

  // Nav avatar initials
  const initials = useMemo(() => getInitials(profileName), [profileName]);

  // On mount: check auth, load profile data
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    if (!logged) {
      router.push("/login");
      return;
    }
    setLoggedIn(true);
    const localName = localStorage.getItem("profileName") || "";
    setProfileName(localName || "User");
    setName(localName || "");
    setEmail(localStorage.getItem("profileEmail") || "");
    setPhone(localStorage.getItem("profilePhone") || "");
    const img = localStorage.getItem("profileImage");
    if (img) setImage(img);
  }, [router]);

  // Logout
  function logout() {
    localStorage.clear();
    router.push("/");
  }

  // Save profile
  function onSave() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill all fields.");
      return;
    }
    localStorage.setItem("profileName", name.trim());
    localStorage.setItem("profileEmail", email.trim());
    localStorage.setItem("profilePhone", phone.trim());
    setProfileName(name.trim());
    setEditing(false);
    alert("Profile saved.");
  }

  // Image uploader
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImage(base64);
      localStorage.setItem("profileImage", base64);
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-[#f7ecd8] text-[#23181a]">

      {/* NAVBAR (same as site) */}
      <header className="bg-[#cb7885] shadow-md">
        <nav className="flex justify-between items-center px-8 py-4">
          <Link href="/" className="text-lg font-semibold">
            ERAILE BEAUTY
          </Link>
          <div className="flex gap-6 items-center text-sm uppercase">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>
            {!loggedIn ? (
              <Link
                href="/login"
                className="bg-white px-4 py-2 rounded-full text-xs"
              >
                Login
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:ring-2 ring-[#cb7885] transition"
                title="Go to profile"
              >
                {initials}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex max-w-7xl mx-auto">

        {/* SIDEBAR */}
        <aside className="w-[240px] min-h-[calc(100vh-72px)] bg-[#e9ccc7]/70 border-r flex flex-col justify-between pt-6 transition">
          {/* TOP */}
          <div>
            <SideItem label="Dashboard" onClick={() => router.push("/dashboard")} />
            <SideItem label="Profile" active onClick={() => router.push("/profile")} />
            <SideItem label="Services" onClick={() => router.push("/services")} />
            <SideItem label="Appointments" onClick={() => router.push("/profile/appointments")} />
            <SideItem label="Billing History" onClick={() => router.push("/profile/billing")} />
          </div>
          {/* BOTTOM */}
          <div className="pb-6">
            <SideItem label="Logout" onClick={logout} danger />
          </div>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 p-10">
          <h1 className="text-3xl font-semibold tracking-wide mb-8">Profile</h1>
          <div className="mt-8 grid md:grid-cols-[280px_1fr] gap-12">
            {/* PROFILE IMAGE */}
            <div className="flex flex-col items-center">
              <div className="h-44 w-44 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shadow text-4xl font-semibold text-gray-500">
                {image ? (
                  <img src={image} className="h-full w-full object-cover" alt="Profile" />
                ) : (
                  initials || "?"
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                id="upload"
                className="hidden"
                onChange={handleImageChange}
              />
              <label
                htmlFor="upload"
                className="mt-4 cursor-pointer bg-gray-200 px-5 py-2 rounded text-sm hover:bg-[#cb7885] hover:text-white transition"
              >
                Change Photo
              </label>
            </div>

            {/* FORM */}
            <div className="space-y-7">
              <Field label="Name" value={name} onChange={setName} disabled={!editing} />
              <Field label="Email" value={email} onChange={setEmail} disabled={!editing} />
              <Field label="Phone" value={phone} onChange={setPhone} disabled={!editing} />
              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={onSave}
                  disabled={!editing}
                  className="bg-[#cb7885] px-8 py-2 text-white rounded disabled:opacity-50 hover:opacity-90 transition font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="bg-gray-200 px-8 py-2 rounded hover:bg-gray-300 transition font-medium"
                  disabled={editing}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* COMPONENTS */

function SideItem({
  label,
  active,
  onClick,
  danger,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-6 py-4 text-left text-md tracking-[0.12em] uppercase rounded transition
      ${active ? "bg-[#f9e4e9] text-[#cb7885] font-semibold shadow-inner" : "hover:bg-[#f7dedc]"}
      ${danger ? "text-red-600 hover:bg-red-100 font-bold" : ""}`}
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
      <label className="block mb-1 text-sm font-semibold tracking-wide">
        {label}
      </label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#cb7885] bg-white disabled:bg-gray-100 ${disabled ? "opacity-60" : ""}`}
      />
    </div>
  );
}