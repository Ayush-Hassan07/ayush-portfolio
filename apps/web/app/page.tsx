import HomeHero from "../components/home/Hero/HomeHero";
import FeaturedSystems from "../components/home/FeaturedSystems/FeaturedSystems";
import CapabilityTrajectory from "../components/home/CapabilityTrajectory/CapabilityTrajectory";
import ContactSignal from "../components/home/ContactSignal/ContactSignal";
import {
  getPublicProfile,
  getPublicProjects,
  getPublicPublications,
  getPublicSkills,
  getPublicEducation,
  getPublicExperience,
} from "../lib/public-api";
import styles from "./page.module.css";

export default async function HomePage() {
  const [profile, projects, publications, skills, education, experience] = await Promise.all([
    getPublicProfile(),
    getPublicProjects(),
    getPublicPublications(),
    getPublicSkills(),
    getPublicEducation(),
    getPublicExperience(),
  ]);

  const technologies = new Set(
    projects.flatMap(
      (project) =>
        project.project_technology?.map(
          ({ technology }) => technology.id,
        ) ?? [],
    ),
  );

  return (
    <main className={styles.page}>
      <HomeHero
        name={profile?.name ?? "Ayush Hassan Raiyan"}
        title={profile?.title}
        bio={profile?.bio}
        location={profile?.location}
        profileImage={profile?.profile_image}
        resumeUrl={profile?.resume_url}
        projects={projects.length}
        publications={publications.length}
        technologies={technologies.size}
        capabilities={skills.length}
      />
      <FeaturedSystems projects={projects} />
      <CapabilityTrajectory skills={skills} education={education} experience={experience} publications={publications} />
      <ContactSignal email={profile?.email} />
    </main>
  );
}
