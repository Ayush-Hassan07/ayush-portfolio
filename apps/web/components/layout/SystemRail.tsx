"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./PublicShell.module.css";

type Props = {
  githubUrl: string | null;
  linkedinUrl: string | null;
  googleScholarUrl: string | null;
};

const navigation = [
  { index: "00", label: "HOME", href: "/" },
  { index: "01", label: "SKILLS", href: "/skills" },
  { index: "02", label: "CREDENTIALS", href: "/certifications" },
];

export default function SystemRail({
  githubUrl,
  linkedinUrl,
  googleScholarUrl,
}: Props) {
  const pathname = usePathname();

  return (
    <aside className={styles.rail}>

      <nav className={styles.railNav} aria-label="Primary sections">
        {navigation.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? styles.activeRailLink : undefined}
            >
              <small>{item.index}</small>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.railSpine} aria-hidden="true">
        <span className={styles.spineStart} />
        <div className={styles.spineTrack}>
          <i />
          <i />
          <i />
        </div>
        <span className={styles.spineLabel}>AHR / INDEX</span>
      </div>

      <div className={styles.railFooter}>
        <div className={styles.socials}>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 .7A11.3 11.3 0 0 0 8.4 22.8c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6A4.7 4.7 0 0 1 5.8 7.4c-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.4 1.3a11.8 11.8 0 0 1 6.2 0C17.9 3.8 19 4.1 19 4.1c.6 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.3 3.3c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.3 11.3 0 0 0 12 .7Z"
                />
              </svg>
            </a>
          )}

          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M5.3 7.9H1.7V22h3.6V7.9ZM3.5 2A2.2 2.2 0 1 0 3.5 6.4 2.2 2.2 0 0 0 3.5 2ZM22.3 14c0-4.2-2.2-6.2-5.2-6.2a4.5 4.5 0 0 0-4.1 2.3V7.9H9.4V22H13v-7c0-1.8.3-3.6 2.6-3.6 2.2 0 2.3 2.1 2.3 3.7V22h3.6l.8-8Z"
                />
              </svg>
            </a>
          )}

          {googleScholarUrl && (
            <a
              href={googleScholarUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Google Scholar"
              title="Google Scholar"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 3 1.5 8.8 12 14.5l8.2-4.5v6.1h1.8V8.8L12 3Zm-6.2 9v4.6c0 2.2 2.8 4 6.2 4s6.2-1.8 6.2-4V12L12 15.4 5.8 12Z"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
