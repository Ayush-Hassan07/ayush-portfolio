import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProject } from "../../../lib/public-api";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return <main className="public-system project-system-page">
    <header className="public-nav benchmark-nav"><Link href="/" className="public-logo">AYUSH.HR<span>.</span><small>ENGINEERING SYSTEMS</small></Link><nav><Link href="/#universe">INDEX</Link><Link href="/#systems">SYSTEMS</Link><Link href="/publications">RESEARCH</Link><Link href="/journey">JOURNEY</Link></nav><Link className="nav-command" href="/#contact">CONTACT <span>→</span></Link></header>
    <aside className="system-index benchmark-rail"><Link href="/">00 — HOME</Link><Link href="/#universe">01 — INDEX</Link><Link href="/#systems">02 — SYSTEMS</Link><span>03 — CASE STUDY</span><Link href="/publications">04 — RESEARCH</Link><Link href="/journey">05 — JOURNEY</Link><Link href="/#contact">06 — CONTACT</Link></aside>
    <main className="project-system-content"><Link className="project-back" href="/#systems">← BACK TO SELECTED SYSTEMS</Link><div className="project-command"><span>CASE STUDY / {(project.status ?? "PROJECT").toUpperCase()}</span><span>LIVE SYSTEM RECORD</span></div><div className="project-heading"><span className="project-number">PROJECT / {project.sort_order ?? "—"}</span><h1>{project.title}</h1><p>{project.description}</p></div>{project.project_media?.length ? <div className="project-media-stage">{project.project_media.map(item => <img key={item.media.storage_key} src={`${api}/media/${item.media.storage_key}`} alt={`${project.title} project view`} />)}</div> : <div className="project-media-empty">NO MEDIA ATTACHED TO THIS SYSTEM</div>}<div className="project-evidence"><div className="project-tech-list">{project.project_technology?.map(item => <span key={item.technology.id}>{item.technology.name}</span>)}</div><div className="project-actions">{project.live_url && <a className="command-button" href={project.live_url} target="_blank" rel="noreferrer">OPEN LIVE PROJECT →</a>}{project.github_url && <a className="project-link" href={project.github_url} target="_blank" rel="noreferrer">REPOSITORY ↗</a>}</div></div><section className="project-flow"><span className="eyebrow">PROJECT SYSTEM</span><div><b>INTERFACE</b><i>→</i><b>API</b><i>→</i><b>DATA</b><i>→</i><b>OUTCOME</b></div></section></main>
  </main>;
}
