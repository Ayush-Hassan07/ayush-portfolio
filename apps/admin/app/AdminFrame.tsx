"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sections = [["Overview", "/"], ["Profile", "/profile"], ["Projects", "/projects"], ["Publications", "/publications"], ["Skills", "/skills"], ["Media", "/media"], ["Security", "/security"]];

export default function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const [open, setOpen] = useState(false); const api = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000"; async function logout() { await fetch(`${api}/auth/logout`, { method: "POST", credentials: "include" }); window.location.href = "/login"; }
  if (pathname === "/login") return children;
  return <main className="admin-frame"><button className="mobile-menu" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle admin navigation">â€¢â€¢â€¢</button><aside className={open ? "admin-sidebar mobile-open" : "admin-sidebar"}><Link className="admin-brand" href="/" onClick={() => setOpen(false)}>AHR<span>.</span><small>studio</small></Link><nav aria-label="Admin sections">{sections.map(([label, href], index) => <Link className={pathname === href ? "active" : ""} href={href} key={label} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}</Link>)}</nav><div className="admin-sidebar-foot"><span className="admin-status" /> Local workspace<br /><small>Content stays yours.</small><button className="admin-logout" type="button" onClick={() => void logout()}>Log out</button></div></aside><section className="admin-main">{children}</section></main>;
}


