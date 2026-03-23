"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "upcoming" | "past";

type Appointment = {
  id: string;
  service: string;
  dateLabel: string; // e.g. "MARCH 03"
  timeLabel: string; // e.g. "03:30PM"
  staff: string;
  amount: string;
};

type ModalState =
  | { open: false }
  | { open: true; type: "reschedule"; appt: Appointment }
  | { open: true; type: "cancel"; appt: Appointment };

const TIME_OPTIONS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
];

const STAFF_OPTIONS = ["Any staff", "Aanya", "Meera", "Riya", "Sana"];

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

export default function AppointmentsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upcoming");

  // Demo data (state updates happen via button clicks, not useEffect)
  const [upcoming, setUpcoming] = useState<Appointment[]>([
    {
      id: "A-1001",
      service: "MANICURE",
      dateLabel: "MARCH 03",
      timeLabel: "03:30PM",
      staff: "Aanya",
      amount: "1200/-",
    },
  ]);

  const [past, setPast] = useState<Appointment[]>([
    {
      id: "A-0994",
      service: "FACIAL",
      dateLabel: "DECEMBER 01",
      timeLabel: "06:00PM",
      staff: "Meera",
      amount: "800/-",
    },
    {
      id: "A-0977",
      service: "MANICURE",
      dateLabel: "NOVEMBER 09",
      timeLabel: "04:45PM",
      staff: "Riya",
      amount: "1700/-",
    },
  ]);

  // Popup
  const [modal, setModal] = useState<ModalState>({ open: false });

  // Reschedule editable fields
  const [editDate, setEditDate] = useState(""); // YYYY-MM-DD
  const [editTime, setEditTime] = useState("");
  const [editStaff, setEditStaff] = useState("Any staff");

  // Redirect only (no setState)
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) router.push("/login");
  }, [router]);

  function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("profileName");
    localStorage.removeItem("profileInitials");
    localStorage.removeItem("profileEmail");
    localStorage.removeItem("profilePhone");
    router.push("/");
  }

  function closeModal() {
    setModal({ open: false });
  }

  function openReschedule(appt: Appointment) {
    setEditDate("");
    setEditTime("");
    setEditStaff(appt.staff || "Any staff");
    setModal({ open: true, type: "reschedule", appt });
  }

  function openCancel(appt: Appointment) {
    setModal({ open: true, type: "cancel", appt });
  }

  function saveReschedule() {
    if (!modal.open || modal.type !== "reschedule") return;

    if (!editDate || !editTime) {
      alert("Please choose a new date and time.");
      return;
    }

    setUpcoming((prev) =>
      prev.map((a) =>
        a.id === modal.appt.id
          ? {
              ...a,
              dateLabel: formatDateLabel(editDate),
              timeLabel: formatTimeLabel(editTime),
              staff: editStaff,
            }
          : a
      )
    );

    closeModal();
  }

  function confirmCancel() {
    if (!modal.open || modal.type !== "cancel") return;

    // remove from upcoming + add to past as cancelled record (so user still sees it)
    const appt = modal.appt;

    setUpcoming((prev) => prev.filter((a) => a.id !== appt.id));
    setPast((prev) => [{ ...appt, service: `${appt.service} (CANCELLED)` }, ...prev]);

    closeModal();
  }

  function rescheduleInsteadFromCancel() {
    if (!modal.open || modal.type !== "cancel") return;
    openReschedule(modal.appt);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8edd9_0%,#ffffff_55%,#f7ecd8_100%)] text-[#23181a]">
      {/* Navbar */}
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
        {/* Sidebar */}
        <aside className="border-r border-black/10 bg-[#d9b7b2]/55">
          <nav className="flex h-full flex-col">
            <div className="px-10 py-6 text-left text-base font-semibold uppercase tracking-[0.14em] text-black/80">
              Dashboard
            </div>

            <SideItem label="Profile" active={false} onClick={() => router.push("/profile")} />
            <SideItem label="Services" active={false} onClick={() => router.push("/services")} />
            <SideItem label="Appointments" active onClick={() => router.push("/profile/appointments")} />
            <SideItem label="Billing History" active={false} onClick={() => router.push("/profile/billing")} />

            <div className="mt-auto">
              <SideItem label="Logout" active={false} onClick={logout} />
            </div>
          </nav>
        </aside>

        {/* Main */}
        <div className="bg-[#f7ecd8] px-6 py-10 md:px-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-semibold uppercase tracking-[0.12em]">My Appointments</h1>

            {/* Tabs */}
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setTab("upcoming")}
                className={`rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition ${
                  tab === "upcoming" ? "bg-[#d9d9d9]" : "hover:bg-black/5"
                }`}
              >
                Upcoming
              </button>

              <button
                type="button"
                onClick={() => setTab("past")}
                className={`rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition ${
                  tab === "past" ? "bg-[#d9d9d9]" : "hover:bg-black/5"
                }`}
              >
                Past
              </button>
            </div>

            <div className="mt-5 h-px w-full bg-black/20" />

            {tab === "upcoming" ? (
              <div className="mt-6 space-y-6">
                {upcoming.length === 0 ? (
                  <EmptyState text="No upcoming appointments." />
                ) : (
                  upcoming.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      item={a}
                      rightType="upcoming"
                      onReschedule={() => openReschedule(a)}
                      onCancel={() => openCancel(a)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {past.length === 0 ? (
                  <EmptyState text="No past appointments." />
                ) : (
                  past.map((a) => <AppointmentCard key={a.id} item={a} rightType="completed" />)
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popup overlay */}
      {modal.open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.type === "reschedule" ? (
              <>
                <h3 className="text-lg font-semibold uppercase tracking-[0.12em]">Reschedule</h3>
                <p className="mt-2 text-sm text-[#6f6460]">
                  {modal.appt.service} • {modal.appt.dateLabel}, {modal.appt.timeLabel}
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]">
                      New date
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#cb7885]/35"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]">
                      New time
                    </label>
                    <select
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#cb7885]/35"
                    >
                      <option value="" disabled>
                        Choose time
                      </option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em]">
                      Staff
                    </label>
                    <select
                      value={editStaff}
                      onChange={(e) => setEditStaff(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#cb7885]/35"
                    >
                      {STAFF_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-[#e6e2dc] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={saveReschedule}
                    className="rounded-xl bg-[#cb7885] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold uppercase tracking-[0.12em]">Cancel appointment?</h3>
                <p className="mt-2 text-sm text-[#6f6460]">
                  {modal.appt.service} • {modal.appt.dateLabel}, {modal.appt.timeLabel}
                </p>

                <p className="mt-4 text-sm text-[#6f6460]">
                  Do you want to cancel this appointment, or reschedule it instead?
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={rescheduleInsteadFromCancel}
                    className="rounded-xl bg-[#e3c7b7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={confirmCancel}
                    className="rounded-xl bg-[#cb7885] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black"
                  >
                    Cancel Appointment
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-[#e6e2dc] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
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

function AppointmentCard({
  item,
  rightType,
  onReschedule,
  onCancel,
}: {
  item: Appointment;
  rightType: "upcoming" | "completed";
  onReschedule?: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="rounded-xl bg-[#c8a7b0] px-8 py-6 shadow-[0_14px_34px_rgba(0,0,0,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.08em]">{item.service}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.12em]">
            {item.dateLabel}, {item.timeLabel}
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.12em]">{item.staff}</p>
        </div>

        <div className="flex items-center gap-7">
          <p className="min-w-[90px] text-right text-base font-semibold">{item.amount}</p>

          {rightType === "upcoming" ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onReschedule}
                className="rounded-md bg-[#9a4d5b] px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-sm transition hover:opacity-90"
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md bg-[#9a4d5b] px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-sm transition hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="rounded-md bg-[#9a4d5b] px-7 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-sm"
            >
              Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/55 px-7 py-6 text-sm text-[#6f6460]">
      {text}
    </div>
  );
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  return `${month} ${day}`;
}

function formatTimeLabel(time: string) {
  return time.replace(" ", "").toUpperCase();
}