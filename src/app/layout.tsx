import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JAI Medicare & Medigap Guide",
  description: "Educational guidance on Medicare and Medigap, with an interactive AI assistant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
