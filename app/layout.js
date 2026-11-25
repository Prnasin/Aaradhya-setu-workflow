import Link from "next/link";
import "./globals.css";

export const metadata = { title: "Aaradhya Setu – Booking Workflow" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-inner">
            <Link href="/" className="logo">
              🪔 Aaradhya Setu <small>Admin</small>
            </Link>
            <nav>
              <Link href="/">Bookings</Link>
              <Link href="/notifications">Notifications</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
