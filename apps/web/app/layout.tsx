import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import PublicShell from "../components/layout/PublicShell";
import { getPublicProfile } from "../lib/public-api";
export const metadata: Metadata = { title: "Ayush Hassan Raiyan — Software Engineer", description: "Software engineer building intelligent systems across full-stack development, AI/ML, and research.", metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"), alternates: { canonical: "/" }, openGraph: { title: "Ayush Hassan Raiyan — Software Engineer", description: "Software engineering, intelligent systems, AI/ML, and research.", type: "website" } };
export default async function RootLayout({ children }: { children: ReactNode }) { const profile = await getPublicProfile(); return <html lang="en"><body><PublicShell name={profile?.name ?? "Ayush Hassan Raiyan"} email={profile?.email ?? null} githubUrl={profile?.github_url ?? null} linkedinUrl={profile?.linkedin_url ?? null}>{children}</PublicShell></body></html>; }
