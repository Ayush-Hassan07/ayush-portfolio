import Link from "next/link";
import { getPublicPublications, getPublicProjects } from "../../lib/public-api";

export default async function ResearchPage() {
  const [papers, projects] = await Promise.all([getPublicPublications(), getPublicProjects()]);
  return <main className="research-archive"><p className="eyebrow">03 / Research record</p><h1>Built systems.<br /><em>Published thinking.</em></h1><p className="research-intro">Research at the intersection of intelligent systems, evaluation, cybersecurity, and practical software engineering.</p><div className="research-flow"><span>PROJECT</span><i>→</i><span>EXPERIMENT</span><i>→</i><span>RESULT</span><i>→</i><span>PUBLICATION</span></div><section className="research-records">{papers.map((paper, index) => <article key={paper.id}><span>0{index + 1}</span><div><small>{paper.venue ?? "RESEARCH RECORD"}</small><h2>{paper.title}</h2><p>{paper.description}</p>{paper.paper_url && <a href={paper.paper_url} target="_blank" rel="noreferrer">OPEN RECORD →</a>}</div></article>)}</section><div className="research-proof"><span>{projects.length} PROJECTS</span><span>{papers.length} PUBLICATIONS</span><Link href="/projects">EXPLORE THE SYSTEMS →</Link></div></main>;
}
