import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectGallery from "../../../components/projects/ProjectGallery";
import { getPublicProject, getPublicProjects } from "../../../lib/public-api";
import styles from "./page.module.css";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([getPublicProject(slug), getPublicProjects()]);
  if (!project) notFound();
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const technologies = project.project_technology?.map(({ technology }) => technology) ?? [];
  const media = project.project_media?.map(({ media }) => ({ src: `${api}/media/${media.storage_key}`, storageKey: media.storage_key })) ?? [];
  const galleryImages = media.length ? media : project.image_url ? [{ src: project.image_url, storageKey: "primary-image" }] : [];
  const currentIndex = allProjects.findIndex((item) => item.slug === project.slug);
  const previous = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
  const number = String(Math.max(currentIndex, 0) + 1).padStart(2, "0");
  return <main className={styles.page}>
    <div className={styles.topline}><Link href="/projects">← SYSTEM ARCHIVE</Link><span>RECORD {number} / {String(allProjects.length).padStart(2, "0")}</span></div>
    <header className={styles.identity}><div className={styles.identityMain}><div className={styles.recordLabel}><span>PROJECT / {number}</span><span className={styles.status}><i />{project.status ?? "PROJECT"}</span></div><h1>{project.title}</h1>{project.description && <p>{project.description}</p>}<div className={styles.quickStack}>{technologies.map((t) => <span key={t.id}>{t.name}</span>)}</div>{(project.live_url || project.github_url) && <div className={styles.actions}>{project.live_url && <a className={styles.primaryAction} href={project.live_url} target="_blank" rel="noreferrer">LIVE SYSTEM ↗</a>}{project.github_url && <a className={styles.secondaryAction} href={project.github_url} target="_blank" rel="noreferrer">SOURCE ↗</a>}</div>}</div><aside className={styles.identityMeta}>{[["RECORD", number],["STATE", project.status ?? "PROJECT"],["TECHNOLOGIES", String(technologies.length).padStart(2,"0")],["MEDIA", String(galleryImages.length).padStart(2,"0")]].map(([label,value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</aside></header>
    <section className={styles.mediaSection}><div className={styles.sectionHeader}><span>// PROJECT MEDIA</span><small>INTERFACE / IMPLEMENTATION</small></div><ProjectGallery images={galleryImages} title={project.title} /></section>
    <section className={styles.systemBrief}><div className={styles.briefHeading}><span>// SYSTEM BRIEF</span><h2>Project<strong>record.</strong></h2></div><div className={styles.briefContent}><div className={styles.briefDescription}><small>OVERVIEW</small><p>{project.description ?? "Project information is currently unavailable."}</p></div><div className={styles.factGrid}>{[["STATUS", project.status ?? "PROJECT"],["STACK SIZE", String(technologies.length).padStart(2,"0")],["MEDIA RECORDS", String(galleryImages.length).padStart(2,"0")],["ACCESS", project.live_url ? "LIVE" : project.github_url ? "SOURCE" : "ARCHIVE"]].map(([label,value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div></div></section>
    {technologies.length > 0 && <section className={styles.stack}><div className={styles.sectionHeader}><span>// TECHNOLOGY PROFILE</span><small>{String(technologies.length).padStart(2,"0")} RECORDS</small></div><div className={styles.stackGrid}>{technologies.map((t,i) => <div className={styles.tech} key={t.id}><span>{String(i+1).padStart(2,"0")}</span><small>{t.category ?? "TECHNOLOGY"}</small><strong>{t.name}</strong></div>)}</div></section>}
    <nav className={styles.projectNavigation}><div>{previous && <Link href={`/projects/${previous.slug}`} className={styles.previous}>← <span><small>PREVIOUS SYSTEM</small><strong>{previous.title}</strong></span></Link>}</div><Link href="/projects" className={styles.archiveLink}>ALL SYSTEMS</Link><div>{next && <Link href={`/projects/${next.slug}`} className={styles.next}><span><small>NEXT SYSTEM</small><strong>{next.title}</strong></span> →</Link>}</div></nav>
  </main>;
}
