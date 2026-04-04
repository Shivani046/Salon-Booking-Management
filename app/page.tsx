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
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#cb7885]/95 text-black backdrop-blur supports-[backdrop-filter]:bg-[#cb7885]/85 shadow-[0_10px_28px_rgba(98,46,56,0.18)]">
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
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">Skin</p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">Nails</p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a24e5f]">Hair</p>
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

      {/* MULTI-COLUMN FOOTER */}
      <footer className="bg-[#ede6e3] border-t border-[#f2dad9] mt-16 pt-10 pb-2 text-[#23181a]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-6 border-b border-[#e2cac5] pb-7">
            {/* About */}
            <div>
              <h4 className="text-base font-bold tracking-wide mb-3 text-[#b46a75]">Eraile Beauty</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/about">Who Are We?</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/testimonials">Testimonials</Link></li>
                <li><Link href="/press">Press</Link></li>
                <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
              </ul>
            </div>
            {/* Help */}
            <div>
              <h4 className="text-base font-bold tracking-wide mb-3 text-[#b46a75]">Help</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/faq">FAQs</Link></li>
                <li><Link href="/policies/cancellation">Cancellation Policy</Link></li>
                <li><Link href="/policies/shipping">Shipping & Delivery</Link></li>
                <li><Link href="/book">Book Appointment</Link></li>
                <li><Link href="/support">Customer Support</Link></li>
              </ul>
            </div>
            {/* Inspire Me */}
            <div>
              <h4 className="text-base font-bold tracking-wide mb-3 text-[#b46a75]">Inspire Me</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/blog">Beauty Tips</Link></li>
                <li><Link href="/Instagram">Instagram Feed</Link></li>
                <li><Link href="/looks">Trending Looks</Link></li>
              </ul>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="text-base font-bold tracking-wide mb-3 text-[#b46a75]">Quick Links</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/services">All Services</Link></li>
                <li><Link href="/offers">Offers & Deals</Link></li>
                <li><Link href="/gift-cards">Gift Cards</Link></li>
                <li><Link href="/refer">Refer a Friend</Link></li>
                <li><Link href="/policy">Privacy Policy</Link></li>
              </ul>
            </div>
            {/* Popular Categories */}
            <div>
              <h4 className="text-base font-bold tracking-wide mb-3 text-[#b46a75]">Top Categories</h4>
              <ul className="text-sm space-y-1">
                <li><Link href="/services?category=hair">Hair</Link></li>
                <li><Link href="/services?category=skin">Skin</Link></li>
                <li><Link href="/services?category=nails">Nails</Link></li>
                <li><Link href="/services?category=bridal">Bridal</Link></li>
                <li><Link href="/services?category=wellness">Wellness</Link></li>
              </ul>
            </div>
            {/* Socials */}
            <div>
              <h4 className="text-base font-bold tracking-wide mb-3 text-[#b46a75]">Follow Us</h4>
              <div className="flex gap-2 text-[#cb7885] text-lg">
                <a href="https://instagram.com/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  {/* Instagram SVG */}
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M7 2C3.686 2 1 4.686 1 8V16C1 19.314 3.686 22 7 22H17C20.314 22 23 19.314 23 16V8C23 4.686 20.314 2 17 2H7ZM7 4H17C19.206 4 21 5.794 21 8V16C21 18.206 19.206 20 17 20H7C4.794 20 3 18.206 3 16V8C3 5.794 4.794 4 7 4ZM7 6C5.897 6 5 6.897 5 8C5 9.103 5.897 10 7 10C8.103 10 9 9.103 9 8C9 6.897 8.103 6 7 6ZM17 14C15.897 14 15 14.897 15 16C15 17.103 15.897 18 17 18C18.103 18 19 17.103 19 16C19 14.897 18.103 14 17 14Z" fill="currentColor"/></svg>
                </a>
                <a href="https://facebook.com/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  {/* Facebook SVG */}
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M22 12C22 6.486 17.514 2 12 2S2 6.486 2 12C2 16.99 5.657 21.128 10.438 21.879V14.891H7.898V12H10.438V9.797C10.438 7.282 11.93 5.891 14.203 5.891C15.307 5.891 16.461 6.075 16.461 6.075V8.531H15.181C13.921 8.531 13.562 9.252 13.562 10.003V12H16.342L15.921 14.891H13.562V21.879C18.343 21.128 22 16.99 22 12Z" fill="currentColor"/></svg>
                </a>
                <a href="https://wa.me/" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                  {/* WhatsApp SVG */}
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M12.005 2C6.479 1.999 1.999 6.478 2 12.004A9.896 9.896 0 005.113 19.04L2.651 21.5L8.029 19.944C9.325 20.421 10.668 20.659 12.003 20.66c5.526 0 10.006-4.479 10.006-10.004.002-5.528-4.479-10.008-10.004-10.006zM12 19.166c-1.221 0-2.442-.246-3.594-.734l-.258-.108-2.13.612.606-2.073-.168-.267A8.304 8.304 0 013.634 12.01 8.375 8.375 0 0112.01 3.637 8.362 8.362 0 0120.383 12c0 4.617-3.756 8.375-8.383 8.375zM17.322 15.039c-.296-.151-1.762-.876-2.034-.976-.274-.102-.473-.151-.672.151-.194.296-.764.975-.938 1.176-.173.2-.344.224-.64.076-.296-.151-1.248-.46-2.377-1.473-.878-.782-1.47-1.751-1.644-2.047-.173-.296-.019-.455.132-.605.136-.135.296-.351.442-.527.148-.176.197-.296.296-.494.099-.197.05-.372-.025-.523-.075-.153-.672-1.625-.92-2.224-.242-.584-.49-.503-.672-.511l-.571-.011c-.197 0-.516.075-.785.359-.268.284-1.022.997-1.022 2.43 0 1.432 1.043 2.814 1.188 3.011.146.196 2.059 3.125 5.22 4.259 3.162 1.135 3.162.748 3.728.701.571-.048 1.757-.751 2.006-1.477.247-.726.247-1.349.172-1.477-.075-.128-.271-.2-.57-.351z" fill="currentColor"/></svg>
                </a>
              </div>
            </div>
          </div>
          {/* Features/USP Bar */}
          <div className="flex flex-wrap gap-6 items-center justify-center mt-8 mb-2 text-[#b46a75]">
            <div className="flex flex-col items-center gap-1">
              <svg width={26} height={26} fill="none" viewBox="0 0 24 24"><path d="M3 6.75V17.25M3.243 7L12 11.25L20.757 7M12 11.25V17.25M21 6.75V17.25" stroke="#b46a75" strokeWidth="2" strokeLinecap="round"/><path d="M3 6.75C3 5.507 4.007 4.5 5.25 4.5H18.75C19.993 4.5 21 5.507 21 6.75" stroke="#b46a75" strokeWidth="2"/></svg>
              <span className="text-xs font-medium">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg width={26} height={26} fill="none" viewBox="0 0 24 24"><path d="M21 7L9 19L3 13" stroke="#b46a75" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="#b46a75" strokeWidth="2"/></svg>
              <span className="text-xs font-medium">Easy Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg width={26} height={26} fill="none" viewBox="0 0 24 24"><path d="M12 20.25C16.5563 20.25 20.25 16.5563 20.25 12C20.25 7.44365 16.5563 3.75 12 3.75C7.44365 3.75 3.75 7.44365 3.75 12C3.75 16.5563 7.44365 20.25 12 20.25Z" stroke="#b46a75" strokeWidth="2"/><path d="M12 8.25V15.75" stroke="#b46a75" strokeWidth="2" strokeLinecap="round"/><path d="M8.25 12H15.75" stroke="#b46a75" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-xs font-medium">Authenticity Assured</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg width={26} height={26} fill="none" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" stroke="#b46a75" strokeWidth="2"/><path d="M6 7V17" stroke="#b46a75" strokeWidth="2"/><path d="M18 7V17" stroke="#b46a75" strokeWidth="2"/></svg>
              <span className="text-xs font-medium">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg width={26} height={26} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#b46a75" strokeWidth="2"/><path d="M8 14C10 15.5 14 15.5 16 14" stroke="#b46a75" strokeWidth="2" strokeLinecap="round"/><ellipse cx="8.5" cy="10" rx="1.5" ry="2" fill="#b46a75"/><ellipse cx="15.5" cy="10" rx="1.5" ry="2" fill="#b46a75"/></svg>
              <span className="text-xs font-medium">Trained Specialists</span>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-[#a07c88]">© {new Date().getFullYear()} Eraile Beauty. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}