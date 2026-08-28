"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./PublicShell.module.css";

type Props = {
  name: string;
  email: string | null;
};

const links = [
  { label: "SYSTEMS", href: "/projects" },
  { label: "RESEARCH", href: "/research" },
  { label: "JOURNEY", href: "/journey" },
];

export default function TopNav({ name, email }: Props) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.identity}
        aria-label={`${name} — Home`}
      >
        <span>
          <strong>AHR</strong>
          <small>SOFTWARE × INTELLIGENCE</small>
        </span>
      </Link>

      <nav
        className={styles.topNav}
        aria-label="Portfolio navigation"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname.startsWith(link.href)
                ? styles.activeTopLink
                : undefined
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {email ? (
        <a href={`mailto:${email}`} className={styles.contact}>
          <span className={styles.statusDot} />
          LET&apos;S TALK
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <Link href="/#contact" className={styles.contact}>
          LET&apos;S TALK
          <span aria-hidden="true">↗</span>
        </Link>
      )}
    </header>
  );
}
