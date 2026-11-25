"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

// Full notification history across all bookings (saved in MongoDB)
export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/notifications").then(setItems).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="page-title">
        <h1>Notification History</h1>
        <span className="muted">{items.length} messages · WhatsApp (mock)</span>
      </div>
      {error && <div className="error">{error}</div>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Time</th><th>Booking</th><th>To</th><th>Step</th><th>Message</th><th>Delivery</th></tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n._id}>
                <td className="nowrap">{new Date(n.createdAt).toLocaleString()}</td>
                <td><Link href={`/bookings/${n.bookingId}`}>{n.bookingId}</Link></td>
                <td>{n.devoteeName}<br /><small className="muted">{n.phone}</small></td>
                <td><StatusBadge status={n.status} /></td>
                <td className="message">{n.message}</td>
                <td>{n.deliveryStatus === "sent" ? "✓✓ Sent" : "🕓 Queued"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="muted center">No notifications yet.</p>}
      </div>
    </>
  );
}
