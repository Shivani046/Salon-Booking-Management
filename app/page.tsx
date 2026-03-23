"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const images = ["/bg1.jpg", "/bg2.jpg", "/bg3.jpg"];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function Home() {
  const router = useRouter();

  const [currentImage, setCurrentImage] = useState(0);

  // login -> initials avatar
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileName, setProfileName] = useState("User");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const v = localStorage.getItem("isLoggedIn");
    const n = localStorage.getItem("profileName");
    setLoggedIn(v === "true");
    setProfileName(n?.trim() ? n : "User");
  }, []);

  const initials = useMemo(() => getInitials(profileName), [profileName]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      {/* Navbar (blended + matches Services palette) */}
      <header className="sticky top-0 z-50 bg-[#cb7885]/95 text-black backdrop-blur supports-[backdrop-filter]:bg-[#cb7885]/85 shadow-[0_10px_28px_rgba(98,46,56,0.18)]">
        <nav className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-12">
          <Link href="/" className="text-[1.55rem] font-semibold tracking-[0.04em]">
            ERAILE BEAUTY
          </Link>

          <div className="hidden items-center gap-8 text-[0.92rem] font-medium uppercase tracking-[0.12em] md:flex">
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

            {/* initials avatar -> goes to profile */}
            {!loggedIn ? (
              <Link
                href="/login"
                className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#8f3c4e] shadow-sm transition hover:bg-white"
              >
                Login
              </Link>
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

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-10 md:px-10 md:pt-14">
        <div className="overflow-hidden rounded-[30px] border border-[#eadcc6] bg-[#f8ecd8]/70 shadow-[0_26px_70px_rgba(88,65,36,0.10)]">
          <div className="relative h-[520px] w-full overflow-hidden">
            {images.map((image, index) => (
              <div
                key={image}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}

            {/* softer overlay for premium look */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(35,24,26,0.62)_0%,rgba(35,24,26,0.30)_55%,rgba(35,24,26,0.15)_100%)]" />

            <div className="absolute inset-0 flex items-end">
              <div className="w-full px-6 pb-10 md:px-10 md:pb-14">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/80">
                    Eraile Beauty Studio
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-5xl">
                    Where style feels natural.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 md:text-base">
                    Hair, skin &amp; nail rituals designed around your features, your lifestyle, and
                    your glow—finished with premium products and careful detail.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-4">
                    <Link
                      href="/book"
                      className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#8f3c4e] shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition hover:bg-[#fff1f4]"
                    >
                      Book now
                    </Link>

                    <Link
                      href="/services"
                      className="rounded-full border border-white/80 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur transition hover:bg-white hover:text-[#23181a]"
                    >
                      View services
                    </Link>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/75">
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      Personalized consultation
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      Premium products
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                      Professional finishing
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* slide indicators */}
            <div className="absolute bottom-5 right-6 flex items-center gap-2 md:right-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentImage(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === currentImage ? "bg-white" : "bg-white/45 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#a24e5f]">
            What we do best
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[0.02em] md:text-4xl">
            Our Beauty Services
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#7b6e68] md:text-base">
            A curated menu of treatments—blended with comfort, hygiene, and lasting results.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="group rounded-[22px] border border-[#eadcc6] bg-[#f8ecd8]/60 p-6 shadow-[0_16px_40px_rgba(88,65,36,0.08)] transition hover:-translate-y-1 hover:bg-[#f8ecd8]/80">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">
              Skin
            </p>
            <h4 className="mt-3 text-xl font-semibold">Facials</h4>
            <p className="mt-2 text-sm leading-6 text-[#6f6460]">
              Refresh and brighten your skin with relaxing facial treatments tailored to you.
            </p>
            <Link
              href="/services"
              className="mt-5 inline-flex text-sm font-semibold text-[#8f3c4e] underline-offset-4 transition group-hover:underline"
            >
              Explore skin services
            </Link>
          </div>

          <div className="group rounded-[22px] border border-[#eadcc6] bg-[#f8ecd8]/60 p-6 shadow-[0_16px_40px_rgba(88,65,36,0.08)] transition hover:-translate-y-1 hover:bg-[#f8ecd8]/80">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">
              Nails
            </p>
            <h4 className="mt-3 text-xl font-semibold">Nail Care</h4>
            <p className="mt-2 text-sm leading-6 text-[#6f6460]">
              Clean, detailed manicures with durable finishes—perfect for any occasion.
            </p>
            <Link
              href="/services"
              className="mt-5 inline-flex text-sm font-semibold text-[#8f3c4e] underline-offset-4 transition group-hover:underline"
            >
              Explore nail services
            </Link>
          </div>

          <div className="group rounded-[22px] border border-[#eadcc6] bg-[#f8ecd8]/60 p-6 shadow-[0_16px_40px_rgba(88,65,36,0.08)] transition hover:-translate-y-1 hover:bg-[#f8ecd8]/80">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">
              Hair
            </p>
            <h4 className="mt-3 text-xl font-semibold">Hair Wash &amp; Style</h4>
            <p className="mt-2 text-sm leading-6 text-[#6f6460]">
              Fresh washes, restorative treatments, and styling that complements your look.
            </p>
            <Link
              href="/services"
              className="mt-5 inline-flex text-sm font-semibold text-[#8f3c4e] underline-offset-4 transition group-hover:underline"
            >
              Explore hair services
            </Link>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/services"
            className="rounded-full bg-[#cb7885] px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_34px_rgba(98,46,56,0.18)] transition hover:opacity-90"
          >
            View full service menu
          </Link>
        </div>
      </section>
    </main>
  );
}