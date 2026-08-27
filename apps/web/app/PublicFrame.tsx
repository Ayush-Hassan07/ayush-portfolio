"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PublicFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    const map: Record<string, string> = { "â†’": "→", "â€”": "—", "â€¢": "•", "âœ‰": "✉", "Ã—": "×", "Â©": "©" };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = []; let node: Node | null;
    while ((node = walker.nextNode())) nodes.push(node as Text);
    nodes.forEach((text) => { let value = text.nodeValue ?? ""; Object.entries(map).forEach(([a, b]) => { value = value.split(a).join(b); }); if (value !== text.nodeValue) text.nodeValue = value; });
  }, [pathname]);
  return <div className="public-frame"><aside className="public-frame-rail system-index benchmark-rail"><nav><Link href="/">00 — HOME</Link><Link href="/skills">01 — INDEX</Link><Link href="/projects">02 — SYSTEMS</Link><Link href="/">03 — LAB</Link><Link href="/research">04 — RESEARCH</Link><Link href="/journey">05 — JOURNEY</Link><Link href="/#contact">06 — CONTACT</Link></nav><div className="rail-social"><a href="https://github.com/Ayush-Hassan07" target="_blank" rel="noreferrer">◉</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">in</a><a href="mailto:hello@ayushraiyan.dev">✉</a></div><small className="rail-copyright">SOFTWARE × INTELLIGENCE<br />RESEARCH × SYSTEMS</small></aside><header className="public-frame-header public-nav benchmark-nav"><Link href="/" className="public-logo">AYUSH.HR<span>.</span><small>ENGINEERING SYSTEMS</small></Link><nav><Link href="/skills">INDEX</Link><Link href="/projects">SYSTEMS</Link><Link href="/research">RESEARCH</Link><Link href="/journey">JOURNEY</Link></nav><a className="nav-command" href="/#contact">CONTACT →</a></header><div className="public-frame-content">{children}</div><footer className="public-frame-footer"><span>2026 AYUSH HASSAN RAIYAN</span><span>SOFTWARE - INTELLIGENCE - RESEARCH</span></footer></div>;
}
