import SkillsMatrix from "../../components/skills/SkillsMatrix";
import { getPublicSkills } from "../../lib/public-api";
import styles from "./page.module.css";
export default async function SkillsPage(){const skills=await getPublicSkills();return <main className={styles.page}>{skills.length?<SkillsMatrix skills={skills}/>:<section className={styles.empty}><span>// CAPABILITY INDEX</span><strong>NO CAPABILITY DATA</strong><p>The public API returned no skill records.</p></section>}</main>}
