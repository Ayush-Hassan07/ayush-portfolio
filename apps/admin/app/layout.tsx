import type { Metadata } from "next";
import "./globals.css";
import AdminFrame from "./AdminFrame";

export const metadata: Metadata = {
  title: "AHR Studio — Portfolio CMS",
  description: "Private content workspace for Ayush Hassan Raiyan's portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col"><AdminFrame>{children}</AdminFrame></body>
    </html>
  );
}