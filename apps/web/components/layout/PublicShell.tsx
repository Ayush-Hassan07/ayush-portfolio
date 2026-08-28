import type { ReactNode } from "react";
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
  return (
    <div className={styles.shell}>
      <SystemRail
        githubUrl={githubUrl}
        linkedinUrl={linkedinUrl}
        googleScholarUrl={googleScholarUrl}
      />
      <TopNav name={name} email={email} />
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
