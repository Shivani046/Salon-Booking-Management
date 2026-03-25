"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ActiveTab =
  | "dashboard"
  | "profile"
  | "services"
  | "appointments"
  | "billing"
  | "logout";

export default function ProfilePage() {
  const router = useRouter();

  const [active] = useState<ActiveTab>("profile");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [editing, setEditing] = useState(false);

  // 🆕 Profile image
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    setName(localStorage.getItem("profileName") || "");
    setEmail(localStorage.getItem("profileEmail") || "");
    setPhone(localStorage.getItem("profilePhone") || "");

    // 🆕 load image
    const img = localStorage.getItem("profileImage");
    if (img) setImage(img);
  }, [router]);

  function logout() {
    localStorage.clear();
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
    alert("Profile saved.");
  }

  // 🆕 handle image upload
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      
      {/* Navbar */}
      <header className="bg-[#cb7885] shadow">
        <nav className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            ERAILE BEAUTY
          </Link>

          <div className="hidden md:flex gap-6 uppercase text-sm">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/book">Book</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </nav>
      </header>

      {/* Layout */}
      <section className="mx-auto grid max-w-7xl md:grid-cols-[300px_1fr]">

        {/* Sidebar */}
        <aside className="border-r bg-[#d9b7b2]/50">
          <SideItem label="Profile" active onClick={() => router.push("/profile")} />
          <SideItem label="Services" active={false} onClick={() => router.push("/services")} />
          <SideItem label="Appointments" active={false} onClick={() => router.push("/profile/appointments")} />
          <SideItem label="Billing" active={false} onClick={() => router.push("/profile/billing")} />
          <SideItem label="Logout" active={false} onClick={logout} />
        </aside>

        {/* Main */}
        <div className="p-10">
          <h1 className="text-3xl font-semibold">Profile</h1>

          <div className="mt-10 grid md:grid-cols-[250px_1fr] gap-10">

            {/* 🆕 PROFILE IMAGE */}
            <div className="flex flex-col items-center">

              <div className="h-44 w-44 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                {image ? (
                  <img src={image} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-600">No Image</span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                id="upload"
                className="hidden"
                onChange={handleImageChange}
              />

              <label
                htmlFor="upload"
                className="mt-4 cursor-pointer bg-gray-200 px-4 py-2 rounded text-sm"
              >
                Change Photo
              </label>
            </div>

            {/* FORM */}
            <div className="space-y-5">
              <Field label="Name" value={name} onChange={setName} disabled={!editing} />
              <Field label="Email" value={email} onChange={setEmail} disabled={!editing} />
              <Field label="Phone" value={phone} onChange={setPhone} disabled={!editing} />

              <div className="flex gap-4 justify-end mt-6">
                <button
                  onClick={onSave}
                  disabled={!editing}
                  className="bg-[#cb7885] px-6 py-2 text-white rounded disabled:opacity-50"
                >
                  Save
                </button>

                <button
                  onClick={() => setEditing(true)}
                  className="bg-gray-200 px-6 py-2 rounded"
                >
                  Edit
                </button>
              </div>
            </div>

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
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left ${
        active ? "bg-black/20" : "hover:bg-black/10"
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
      <label className="block mb-1 text-sm font-semibold">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-3 rounded"
      />
    </div>
  );
}