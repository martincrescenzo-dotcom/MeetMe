import type { Metadata, Viewport } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "MeetMe",
  description: "A shareable profile card with WhatsApp conversation starters.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto w-full max-w-mobile px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
