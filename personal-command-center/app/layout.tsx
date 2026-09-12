import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Personal Command Center",
  description: "แดชบอร์ดส่วนตัวแบบ Single-user",
};

// Root layout stays minimal on purpose: the login page must NOT show the
// Sidebar/Topbar, so those live in app/(dashboard)/layout.tsx instead.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
