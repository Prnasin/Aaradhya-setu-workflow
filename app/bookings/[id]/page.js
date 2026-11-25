"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { STEPS, ACTION_LABELS, getNextStatus } from "@/lib/workflow";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

// Next.js passes the [id] part of the URL as `params` (a Promise in Next 15, unwrapped with `use`)
export default function BookingDetail({ params }) {
  const { id } = use(params); // e.g. "AS-1001" from /bookings/AS-1001
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api(`/api/bookings/${id}`).then(setData).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function advance() {
    setBusy(true); // disable the button so it can't be double-clicked
    setError("");
    try {
      await api(`/api/bookings/${id}/advance`, "POST", { seenStatus: data.booking.status });
      load();
    } catch (err) {
      setError(err.message);
      load(); // show the latest data
    }
    setBusy(false);
  }

  if (!data) return <p className="muted">{error || "Loading…"}</p>;

  const { booking, notifications } = data;
  const currentIndex = STEPS.indexOf(booking.status);
  const next = getNextStatus(booking.status);

  return (
    <>
      <Link href="/" className="muted">← All bookings</Link>
      <div className="page-title">
        <h1>{booking.bookingId}</h1>
        <StatusBadge status={booking.status} />
      </div>

      {error && <div className="error">{error}</div>}

      <div className="detail-grid">
        <div>
          <div className="card">
            <h3>Booking details</h3>
            <p><b>Devotee:</b> {booking.devoteeName}</p>
            <p><b>WhatsApp:</b> {booking.phone}</p>
            <p><b>Puja:</b> {booking.pujaName}</p>
            <p><b>Date:</b> {booking.pujaDate}</p>
            <p><b>Amount:</b> ₹{booking.amount}</p>
            {booking.videoUrl && (
              <p><b>Video:</b> <a href={booking.videoUrl} target="_blank">{booking.videoUrl}</a></p>
            )}
          </div>

          {/* Workflow progress: done steps are ticked and show when they happened */}
          <div className="card">
            <h3>Workflow</h3>
            <div className="stepper">
              {STEPS.map((step, i) => {
                const entry = booking.history.find((h) => h.status === step);
                return (
                  <div key={step} className={`step ${i <= currentIndex ? "done" : ""}`}>
                    <div className="dot">{i <= currentIndex ? "✓" : i + 1}</div>
                    <div>
                      <div>{step}</div>
                      {entry && <small className="muted">{new Date(entry.at).toLocaleString()}</small>}
                    </div>
                  </div>
                );
              })}
            </div>
            {next ? (
              <button onClick={advance} disabled={busy}>
                {busy ? "Updating…" : ACTION_LABELS[next]}
              </button>
            ) : (
              <p className="muted">✔ Workflow complete</p>
            )}
          </div>
        </div>

        {/* Notification history, shown like a WhatsApp chat */}
        <div className="chat">
          <div className="chat-header">📱 WhatsApp · {booking.devoteeName}</div>
          <div className="chat-body">
            {notifications.map((n) => (
              <div key={n._id} className="bubble">
                <p>{n.message}</p>
                <small>
                  {new Date(n.createdAt).toLocaleTimeString()} {n.deliveryStatus === "sent" ? "✓✓" : "🕓"}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
