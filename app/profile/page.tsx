"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
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
    <main className="min-h-screen bg-[#f3ecdf] text-[#23181a]">

      {/* NAVBAR */}
      <header className="bg-[#cb7885] shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-wide">
            ERAILE BEAUTY
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex max-w-7xl mx-auto">

        {/* SIDEBAR */}
        <aside className="w-[260px] min-h-[calc(100vh-72px)] bg-[#d9b7b2]/60 border-r flex flex-col justify-between">

          {/* TOP */}
          <div className="pt-6">
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

          <h1 className="text-3xl font-semibold tracking-wide">Profile</h1>

          <div className="mt-12 grid md:grid-cols-[280px_1fr] gap-12">

            {/* PROFILE IMAGE */}
            <div className="flex flex-col items-center">

              <div className="h-48 w-48 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center shadow">
                {image ? (
                  <img src={image} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-600">No Image</span>
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
                className="mt-5 cursor-pointer bg-gray-200 px-5 py-2 rounded text-sm hover:bg-gray-300 transition"
              >
                Change Photo
              </label>
            </div>

            {/* FORM */}
            <div className="space-y-6">

              <Field label="Name" value={name} onChange={setName} disabled={!editing} />
              <Field label="Email" value={email} onChange={setEmail} disabled={!editing} />
              <Field label="Phone" value={phone} onChange={setPhone} disabled={!editing} />

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={onSave}
                  disabled={!editing}
                  className="bg-[#cb7885] px-6 py-2 text-white rounded disabled:opacity-50 hover:opacity-90 transition"
                >
                  Save
                </button>

                <button
                  onClick={() => setEditing(true)}
                  className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300 transition"
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
      className={`w-full px-6 py-4 text-left text-sm tracking-[0.15em] uppercase transition
      ${active ? "bg-black/20 font-semibold" : "hover:bg-black/10"}
      ${danger ? "text-red-600 hover:bg-red-100" : ""}`}
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
        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#cb7885]"
      />
    </div>
  );
}