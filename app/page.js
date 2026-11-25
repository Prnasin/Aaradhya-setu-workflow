"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STEPS, ACTION_LABELS, getNextStatus } from "@/lib/workflow";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

const EMPTY_FORM = { devoteeName: "", phone: "", pujaName: "", pujaDate: "", amount: "" };
const FIELDS = [
  ["devoteeName", "Devotee name", "text"],
  ["phone", "WhatsApp number", "tel"],
  ["pujaName", "Puja name", "text"],
  ["pujaDate", "Puja date", "date"],
  ["amount", "Amount (₹)", "number"],
];

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [seeding, setSeeding] = useState(false);

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(""), 4000);
  }

  function load() {
    api("/api/bookings").then(setBookings).catch((e) => showToast("❌ " + e.message));
  }
  useEffect(load, []);

  async function createBooking(e) {
    e.preventDefault();
    try {
      const b = await api("/api/bookings", "POST", { ...form, amount: Number(form.amount) });
      showToast(`✅ ${b.bookingId} created – confirmation sent to ${b.devoteeName}`);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      showToast("❌ " + err.message);
    }
  }

  async function advance(bookingId, seenStatus) {
    try {
      const b = await api(`/api/bookings/${bookingId}/advance`, "POST", { seenStatus });
      showToast(`✅ ${b.bookingId} → "${b.status}" – WhatsApp sent to ${b.devoteeName}`);
      load();
    } catch (err) {
      showToast("❌ " + err.message);
      load(); // show the latest data
    }
  }

  async function seed() {
    setSeeding(true); // disable the button so it can't run twice at once
    try {
      await api("/api/seed", "POST");
      showToast("✅ Sample data loaded");
    } catch (err) {
      showToast("❌ " + err.message);
    }
    setSeeding(false);
    load();
  }

  // Search + filter happen in the browser (simple and fast for a small list)
  const shown = bookings.filter(
    (b) =>
      (filter === "All" || b.status === filter) &&
      `${b.bookingId} ${b.devoteeName} ${b.pujaName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {toast && <div className="toast">{toast}</div>}

      <div className="page-title">
        <h1>Puja Bookings</h1>
        <button className="btn-outline" onClick={seed} disabled={seeding}>
          {seeding ? "Loading…" : "Load sample data"}
        </button>
      </div>

      {/* How many bookings are at each step */}
      <div className="stats">
        {STEPS.map((step) => (
          <div key={step} className="card stat" onClick={() => setFilter(step)}>
            <strong>{bookings.filter((b) => b.status === step).length}</strong>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <form className="card form" onSubmit={createBooking}>
        <h3>New booking</h3>
        <div className="form-grid">
          {FIELDS.map(([key, label, type]) => (
            <input
              key={key}
              type={type}
              placeholder={label}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required
            />
          ))}
          <button type="submit">Create booking</button>
        </div>
      </form>

      <div className="card">
        <div className="toolbar">
          <input placeholder="Search ID, devotee or puja…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {STEPS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th><th>Devotee</th><th>Puja</th><th>Date</th><th>Amount</th><th>Current status</th><th>Next action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((b) => {
                const next = getNextStatus(b.status);
                return (
                  <tr key={b.bookingId}>
                    <td><Link href={`/bookings/${b.bookingId}`}>{b.bookingId}</Link></td>
                    <td>{b.devoteeName}</td>
                    <td>{b.pujaName}</td>
                    <td>{b.pujaDate}</td>
                    <td>₹{b.amount}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      {next ? (
                        <button className="btn-small" onClick={() => advance(b.bookingId, b.status)}>{ACTION_LABELS[next]}</button>
                      ) : (
                        <span className="muted">✔ Complete</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {shown.length === 0 && <p className="muted center">No bookings yet. Click “Load sample data” or create one.</p>}
        </div>
      </div>
    </>
  );
}
