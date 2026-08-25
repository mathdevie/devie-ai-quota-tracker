import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/ui/_themes.scss";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Devie QT",
  description: "A local AI subscription quota tracker",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
