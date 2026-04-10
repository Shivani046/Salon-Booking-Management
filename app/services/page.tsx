"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ServiceItem = {
  name: string;
  price: string;
};

type ServiceGroup = {
  name: string;
  description: string;
  items: ServiceItem[];
};

const serviceGroups: ServiceGroup[] = [
  {
    name: "Hair",
    description: "Cuts, color, and treatments tailored to your length, texture, and finish.",
    items: [
      { name: "Haircut", price: "500/-" },
      { name: "Blow Dry & Styling", price: "700/-" },
      { name: "Hair Spa", price: "900/-" },
      { name: "Root Touch-up", price: "800/-" },
      { name: "Global Hair Color", price: "1200/-" },
      { name: "Highlights / Balayage", price: "2500/-"},
      { name: "Keratin / Smoothening", price: "3500/-"},
      { name: "Head Massage", price: "300/-" },
    ],
  },
  {
    name: "Skin",
    description: "Glow-focused facials and rituals designed for balance, clarity, and radiance.",
    items: [
      { name: "Cleanup", price: "300/-" },
      { name: "Detan", price: "400/-"},
      { name: "Fruit Facial", price: "600/-" },
      { name: "Anti-Acne Facial", price: "900/-" },
      { name: "Anti-Ageing Facial", price: "1100/-" },
      { name: "Hydra Facial", price: "1500/-" },
      { name: "Brightening Mask Ritual", price: "750/-" },
    ],
  },
  {
    name: "Nails",
    description: "Clean nail care with long-lasting finishes and elegant detailing.",
    items: [
      { name: "Manicure", price: "1200/-" },
      { name: "Pedicure", price: "1400/-"},
      { name: "Gel Polish", price: "1800/-" },
      { name: "Nail Extensions", price: "2800/-" },
      { name: "Nail Art (Basic)", price: "2200/-" },
      { name: "Nail Art (Premium)", price: "3200/-"},
      { name: "Nail Repair (per nail)", price: "200/-" },
    ],
  },
  {
    name: "Waxing",
    description: "Gentle, hygienic waxing for smooth skin and long-lasting results.",
    items: [
      { name: "Underarms", price: "150/-" },
      { name: "Full Arms", price: "350/-" },
      { name: "Half Legs", price: "450/-"},
      { name: "Full Legs", price: "700/-" },
      { name: "Full Body", price: "1800/-" },
    ],
  },
  {
    name: "Threading",
    description: "Precise shaping for a clean, defined look.",
    items: [
      { name: "Eyebrows", price: "60/-" },
      { name: "Upper Lip", price: "40/-" },
      { name: "Forehead", price: "40/-" },
      { name: "Full Face", price: "200/-" },
    ],
  },
  {
    name: "Makeup",
    description: "Event-ready makeup with a finish that lasts in photos and real life.",
    items: [
      { name: "Party Makeup", price: "1800/-" },
      { name: "Engagement Makeup", price: "3500/-"},
      { name: "Bridal Makeup", price: "8000/-" },
      { name: "Saree Draping", price: "800/-" },
    ],
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function ServicesPage() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("User");

  useEffect(() => {
    const v = localStorage.getItem("isLoggedIn");
    const n = localStorage.getItem("profileName");
    setLoggedIn(v === "true");
    setProfileName(n?.trim() ? n : "User");
  }, []);

  const initials = useMemo(() => getInitials(profileName), [profileName]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      {/* Navbar */}
      <header className="bg-[#cb7885] text-black shadow-[0_8px_18px_rgba(98,46,56,0.14)]">
        <nav className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-12">
          <Link href="/" className="text-[1.55rem] font-semibold tracking-[0.04em]">
            ERAILE BEAUTY
          </Link>
          <div className="hidden items-center gap-8 text-[0.92rem] font-medium uppercase tracking-[0.12em] md:flex">
            <Link href="/" className="transition hover:opacity-75">Home</Link>
            <Link href="/services" className="transition hover:opacity-75">Services</Link>
            <Link href="/book" className="transition hover:opacity-75">Book</Link>
            <Link href="/contact" className="transition hover:opacity-75">Contact</Link>
            {!loggedIn ? (
              <Link
                href="/login"
                className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#8f3c4e] shadow-sm transition hover:bg-white"
              >Login</Link>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="grid h-10 w-10 place-items-center rounded-full bg-[#f8edd9] text-[0.85rem] font-bold tracking-[0.08em] text-[#7a2f3f] shadow-[0_10px_22px_rgba(0,0,0,0.10)] transition hover:opacity-90"
                aria-label="Go to profile"
                title="Profile"
              >
                {initials}
              </button>
            )}
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-12 md:px-10 md:pt-16">
        <div className="rounded-[28px] border border-[#eadcc6] bg-[#f8ecd8]/75 px-6 py-10 shadow-[0_22px_60px_rgba(88,65,36,0.10)] md:px-14 md:py-14">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#a24e5f]">Signature Menu</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[0.03em] md:text-5xl">Services</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#7f7370] md:text-xl">
              Browse our catalog and choose what fits you best. Final pricing may vary after
              consultation.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[#988a86] md:text-base">
              All prices start from
            </p>
          </div>

          <div className="mt-8 h-px bg-[#cdbfac]" />

          <div className="mt-10 grid gap-10 md:grid-cols-[1.35fr_0.65fr] md:gap-12">
            {/* Catalog list */}
            <div className="space-y-10">
              {serviceGroups.map((group) => (
                <section key={group.name}>
                  <h2 className="text-3xl font-semibold uppercase tracking-[0.06em] text-[#9d3f52]">
                    {group.name}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b6e68]">
                    {group.description}
                  </p>
                  <div className="mt-5 space-y-4">
                    {group.items.map((item) => (
                      <div
                        key={`${group.name}-${item.name}`}
                        className="rounded-2xl border border-[#eadcc6] bg-white/55 px-5 py-4 shadow-[0_12px_28px_rgba(88,65,36,0.08)]"
                      >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-lg font-medium text-[#23181a] md:text-[1.15rem]">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#7b6e68]">
                              {item.duration}
                              {item.note ? ` • ${item.note}` : ""}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-[#23181a] md:text-[1.15rem]">
                            {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            
            {/* Sidebar - sticky and matched to content! */}
            <aside className="self-start sticky top-8 w-full md:max-w-xs">
              {/* Booking Notes (beige box) */}
              <div className="rounded-[24px] border border-[#eadcc6] bg-white/60 p-6 shadow-[0_16px_40px_rgba(88,65,36,0.10)] mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">
                    Booking Notes
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    Plan your appointment with ease
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#746965]">
                    Services can be customized based on length, detailing, or skin concerns. Final
                    pricing may vary after consultation.
                  </p>
                </div>
                <div className="mt-6 rounded-[20px] bg-[#fff9f2] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#cb7885]">
                    Included
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#6f6460]">
                    <li>• Personalized consultation before your service</li>
                    <li>• Premium salon products and professional finishing</li>
                    <li>• Guidance for after-care and maintenance</li>
                  </ul>
                </div>
              </div>

              {/* Ready to book? (green box) */}
              <div className="rounded-[20px] bg-[#98a07b] px-5 py-6 text-white shadow-[0_14px_34px_rgba(88,65,36,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/85">
                  Ready to book?
                </p>
                <p className="mt-3 text-lg font-semibold leading-8">
                  Sign in to request an appointment and we’ll confirm your preferred time.
                </p>
                <Link
                  href={loggedIn ? "/book" : "/login"}
                  className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-[#6a7052] transition hover:bg-[#fff7ef]"
                >
                  {loggedIn ? "Continue to booking" : "Continue to login"}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}