import Link from "next/link";
import { getPublicProjects } from "../../lib/public-api";

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const featured = projects.find((project) => project.featured) ?? projects[0];
  const archive = projects.filter((project) => project.id !== featured?.id);
  const image = (project: typeof featured) => project?.project_media?.[0]?.media.storage_key ? `${api}/media/${project.project_media[0].media.storage_key}` : project?.image_url ?? null;
  return <main className="systems-archive">
    <aside className="archive-rail"><Link href="/" className="archive-mark">AHR<span>.</span><small>SYSTEMS</small></Link><nav><Link href="/">00 — HOME</Link><Link className="active" href="/projects">01 — SYSTEMS</Link><Link href="/skills">02 — CAPABILITIES</Link><Link href="/publications">03 — RESEARCH</Link><Link href="/journey">04 — JOURNEY</Link></nav><span className="archive-rail-foot">SOFTWARE × INTELLIGENCE<br />RESEARCH</span></aside>
    <div className="archive-main"><header className="archive-top"><span>// SYSTEMS ARCHIVE</span><small>{projects.length.toString().padStart(2, "0")} DEPLOYED RECORDS</small></header><section className="archive-heading"><p>01 / SELECTED WORK</p><h1>Systems<br /><em>built to matter.</em></h1><span>Software engineering, intelligent applications, and technical systems grounded in real implementation.</span></section>
      {featured && <Link href={`/projects/${featured.slug}`} className="feature-system"><div className="feature-media">{image(featured) && <img src={image(featured)!} alt="" />}</div><div className="feature-copy"><span className="system-number">01 / FEATURED SYSTEM</span><small>{featured.status ?? "PROJECT SYSTEM"}</small><h2>{featured.title}</h2><p>{featured.description}</p><div className="system-meta">{featured.project_technology?.slice(0, 5).map(({ technology }) => <span key={technology.id}>{technology.name}</span>)}</div><b>OPEN SYSTEM →</b></div></Link>}
      <div className="archive-label"><span>// ALL SYSTEMS</span><small>SELECT A RECORD TO INSPECT THE BUILD</small></div><section className="system-records">{archive.map((project, index) => <Link href={`/projects/${project.slug}`} className="system-record" key={project.slug}><span className="record-no">{String(index + 2).padStart(2, "0")}</span><div className="record-media">{image(project) && <img src={image(project)!} alt="" />}</div><div className="record-copy"><small>{project.status ?? "SYSTEM"}</small><h2>{project.title}</h2><p>{project.description}</p><div className="system-meta">{project.project_technology?.slice(0, 4).map(({ technology }) => <span key={technology.id}>{technology.name}</span>)}</div></div><b className="record-open">VIEW →</b></Link>)}</section>
    </div>
  </main>;
}
