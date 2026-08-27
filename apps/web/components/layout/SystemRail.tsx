"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./PublicShell.module.css";
type Props = { githubUrl: string | null; linkedinUrl: string | null; email: string | null };
const navigation = [{ index:"00",label:"HOME",href:"/"},{index:"01",label:"SYSTEMS",href:"/projects"},{index:"02",label:"CAPABILITIES",href:"/skills"},{index:"03",label:"RESEARCH",href:"/research"},{index:"04",label:"JOURNEY",href:"/journey"}];
export default function SystemRail({ githubUrl, linkedinUrl, email }: Props) { const pathname=usePathname(); return <aside className={styles.rail}><div className={styles.railMark}><span>AR</span><small>SYS / 26</small></div><nav className={styles.railNav} aria-label="Primary sections">{navigation.map(item=>{const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href);return <Link key={item.href} href={item.href} className={active?styles.activeRailLink:undefined}><small>{item.index}</small><span>{item.label}</span></Link>})}</nav><div className={styles.railFooter}><div className={styles.socials}>{githubUrl&&<a href={githubUrl} target="_blank" rel="noreferrer">GH</a>}{linkedinUrl&&<a href={linkedinUrl} target="_blank" rel="noreferrer">IN</a>}{email&&<a href={`mailto:${email}`}>MAIL</a>}</div><span className={styles.orientation}>ENGINEERING<br/>INTELLIGENCE</span></div></aside>; }
