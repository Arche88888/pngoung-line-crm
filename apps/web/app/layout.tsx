import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "P'Ngoung LINE CRM",
  description: "Dashboard scaffold for LINE CRM"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
