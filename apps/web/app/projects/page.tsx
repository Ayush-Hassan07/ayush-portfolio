import SystemsInspector from "../../components/projects/SystemsInspector";
import { getPublicProjects } from "../../lib/public-api";
import styles from "./page.module.css";
export default async function ProjectsPage(){const projects=await getPublicProjects();const systemRecords=projects.map((project,index)=>({id:project.id??project.slug,slug:project.slug,title:project.title,description:project.description,status:project.status,number:String(index+1).padStart(2,"0"),technologies:project.project_technology?.map(({technology})=>technology.name)??[]}));return <main className={styles.page}>{systemRecords.length>0?<SystemsInspector projects={systemRecords}/>:<p className={styles.empty}>No project records available.</p>}</main>}
