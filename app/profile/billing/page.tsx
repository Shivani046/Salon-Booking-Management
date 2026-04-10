"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

function UserIcon() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full bg-white/70 shadow-[0_10px_22px_rgba(0,0,0,0.10)]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 21a8 8 0 0 0-16 0" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

type Bill = {
  id: string;
  service: string;
  date: string; // yyyy-mm-dd
  method: string;
  amount: string;
  status: string;
};

export default function BillingHistoryPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const custId = localStorage.getItem("custId");
    if (!loggedIn || !custId) {
      router.push("/login");
      return;
    }

    // Fetch user's bills from the backend
    async function fetchBills() {
      setLoading(true);
      try {
        const res = await fetch(`/api/billing?custId=${custId}`);
        const dbBills = await res.json();
        // Map/normalize if needed - here's a sample transform for the structure you want
        const formattedBills: Bill[] = dbBills.map((b: any) => ({
          id: b.invoiceId || b.id || "", // whatever field is invoice number
          service: b.service?.type || b.service || "",
          date: (typeof b.date === "string" && b.date.length > 10) ? b.date.slice(0,10) : b.date, // strip time part if present
          method: b.method,
          amount: typeof b.amount === "number" ? `${b.amount}/-` : (b.amount || ""),
          status: b.status,
        }));
        setBills(formattedBills);
      } catch (e) {
        setBills([]);
      }
      setLoading(false);
    }
    fetchBills();
  }, [router]);

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  const totalPaid = useMemo(() => {
    return bills
      .filter((b) => b.status === "Paid")
      .reduce((acc, b) => acc + parseInt(b.amount.replace(/[^0-9]/g, "") || "0", 10), 0);
  }, [bills]);

  const lastPayment = useMemo(() => {
    return bills.length > 0 ? bills[0].date : "—";
  }, [bills]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      <header className="bg-[#cb7885] text-black shadow-[0_8px_18px_rgba(98,46,56,0.14)]">
        <nav className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-12">
          <Link href="/" className="text-[1.55rem] font-semibold tracking-[0.04em]">
            ERAILE BEAUTY
          </Link>
          <div className="hidden items-center gap-10 text-[0.92rem] font-medium uppercase tracking-[0.12em] md:flex">
            <Link href="/" className="transition hover:opacity-75">Home</Link>
            <Link href="/services" className="transition hover:opacity-75">Services</Link>
            <Link href="/book" className="transition hover:opacity-75">Book</Link>
            <Link href="/contact" className="transition hover:opacity-75">Contact</Link>
            <UserIcon />
          </div>
        </nav>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl grid-cols-1 md:grid-cols-[320px_1fr]">
        <aside className="border-r border-black/10 bg-[#d9b7b2]/55">
          <nav className="flex h-full flex-col">
            <div className="px-10 py-6 text-left text-base font-semibold uppercase tracking-[0.14em] text-black/80">
              Dashboard
            </div>
            <SideItem label="Profile" active={false} onClick={() => router.push("/profile")} />
            <SideItem label="Services" active={false} onClick={() => router.push("/services")} />
            <SideItem label="Appointments" active={false} onClick={() => router.push("/profile/appointments")} />
            <SideItem label="Billing History" active onClick={() => router.push("/profile/billing")} />
            <div className="mt-auto">
              <SideItem label="Logout" active={false} onClick={logout} />
            </div>
          </nav>
        </aside>
        <div className="bg-[#f7ecd8] px-6 py-10 md:px-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-semibold uppercase tracking-[0.12em]">
              Billing History
            </h1>
            <div className="mt-5 h-px w-full bg-black/20" />

            {/* Summary strip */}
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <SummaryCard title="Total Bills" value={String(bills.length)} />
              <SummaryCard title="Total Paid" value={`${totalPaid}/-`} />
              <SummaryCard title="Last Payment" value={lastPayment} />
            </div>

            {/* List */}
            <div className="mt-8 space-y-5">
              {loading ? (
                <div>Loading...</div>
              ) : bills.length === 0 ? (
                <div>No bills found for your account.</div>
              ) : (
                bills.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-black/10 bg-white/55 px-7 py-6 shadow-[0_12px_28px_rgba(88,65,36,0.08)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.30em] text-[#a24e5f]">
                          {b.id}
                        </p>
                        <p className="mt-2 text-xl font-semibold">{b.service}</p>

                        <div className="mt-3 space-y-1 text-sm text-[#6f6460]">
                          <p>
                            Date: <span className="font-semibold text-[#23181a]">{b.date}</span>
                          </p>
                          <p>
                            Method: <span className="font-semibold text-[#23181a]">{b.method}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-semibold text-[#23181a]">{b.amount}</p>
                        <span className="mt-2 inline-block rounded-full bg-[#98a07b] px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm">
                          {b.status}
                        </span>

                        <div className="mt-4 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => alert("View invoice (demo)")}
                            className="rounded-full bg-[#e3c7b7] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-sm transition hover:opacity-90"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => alert("Download invoice (demo)")}
                            className="rounded-full bg-[#cb7885] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-sm transition hover:opacity-90"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="mt-8 text-xs text-[#6f6460]">
              Real data is being displayed for your account.
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

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fff9f2] px-6 py-5 shadow-[0_12px_28px_rgba(88,65,36,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a24e5f]">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[#23181a]">{value}</p>
    </div>
  );
}