import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-prompt",
});

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
      <body className={prompt.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
