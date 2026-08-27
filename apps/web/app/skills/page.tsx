import Link from "next/link";
import { getPublicSkills } from "../../lib/public-api";

export default async function SkillsPage() {
  const skills = await getPublicSkills();
  const groups = [...new Set(skills.map((skill) => skill.category || "Capabilities"))];
  return <main className="public-system archive-page skills-archive">
    <Link className="text-link" href="/">← Back to system index</Link>
    <p className="eyebrow detail-eyebrow">03 / Capability index</p>
    <h1>Skills with<br /><em>evidence.</em></h1>
    <p className="archive-lede">A database-driven map of the capabilities I use to build software, analyze systems, and conduct technical work.</p>
    <div className="skills-index">{groups.map((group) => <section className="skills-index-group" key={group}><span>{group}</span><div>{skills.filter((skill) => (skill.category || "Capabilities") === group).map((skill) => <article key={skill.id}><b>{skill.name}</b><small>CAPABILITY / {skill.sort_order.toString().padStart(2, "0")}</small></article>)}</div></section>)}</div>
  </main>;
}
