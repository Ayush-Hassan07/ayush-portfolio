import type { Metadata } from "next";
import "./globals.css";
import PublicFrame from "./PublicFrame";

export const metadata: Metadata = {
  title: "Ayush Hassan Raiyan — Software Engineer",
  description:
    "Software and full-stack engineer building thoughtful web products, intelligent systems, and research-led tools.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  alternates: { canonical: "/" },
  openGraph: { title: "Ayush Hassan Raiyan — Software Engineer", description: "Software, AI/ML, and research-led engineering.", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col"><PublicFrame>{children}</PublicFrame></body>
    </html>
  );
}
