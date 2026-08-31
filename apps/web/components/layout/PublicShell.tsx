"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import SystemRail from "./SystemRail";
import TopNav from "./TopNav";
import styles from "./PublicShell.module.css";

type Props = {
  children: ReactNode;
  name: string;
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  googleScholarUrl: string | null;
};

export default function PublicShell({
  children,
  name,
  email,
  githubUrl,
  linkedinUrl,
  googleScholarUrl,
}: Props) {
  const pathname = usePathname();
  const validPath = pathname === "/" ||
    pathname === "/skills" ||
    pathname === "/projects" ||
    pathname === "/research" ||
    pathname === "/journey" ||
    pathname === "/certifications" ||
    /^\/projects\/[^/]+$/.test(pathname);

  if (!validPath) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shell}>
      <SystemRail
        githubUrl={githubUrl}
        linkedinUrl={linkedinUrl}
        googleScholarUrl={googleScholarUrl}
      />
      <TopNav name={name} email={email} githubUrl={githubUrl} linkedinUrl={linkedinUrl} googleScholarUrl={googleScholarUrl} />
      <div className={styles.content}>{children}</div>
      <footer className={styles.footer}>
        <span>&copy; {new Date().getFullYear()} {name}</span>
        <span className={styles.footerSignal}>
          SOFTWARE <i /> INTELLIGENCE <i /> RESEARCH
        </span>
      </footer>
    </div>
  );
}
