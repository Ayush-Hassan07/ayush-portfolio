import HeroMetrics from "./HeroMetrics";
import IntelligenceCore from "./IntelligenceCore";
import styles from "./Hero.module.css";

type Props = {
  name: string;
  title?: string | null;
  bio?: string | null;
  location?: string | null;
  profileImage?: string | null;
  resumeUrl?: string | null;
  projects: number;
  publications: number;
  technologies: number;
  capabilities: number;
};

export default function HomeHero({
  name,
  location,
  profileImage,
  resumeUrl,
  projects,
  publications,
  technologies,
  capabilities,
}: Props) {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const image = profileImage ? `${api}/media/${profileImage}` : null;

  return (
    <section className={styles.hero}>
      <div className={styles.backgroundGeometry} />

      <div className={styles.identityHero}>
        <div className={styles.identitySide}>
          <div className={styles.identityIndex}>
            <span>00 / IDENTITY</span>
            <span>SOFTWARE / AI / RESEARCH</span>
          </div>

          <div className={styles.identityPrimary}>
            {image && (
              <div className={styles.portraitStage}>
                <div className={styles.portraitFrame}>
                  <img src={image} alt={name} />
                  <span className={styles.scanBeam} aria-hidden="true" />
                </div>
                <span className={styles.portraitCornerTop} />
                <span className={styles.portraitCornerBottom} />
              </div>
            )}

            <div className={styles.identityCopy}>
              <h1>{name}</h1>
              <div className={styles.specialisms}>
                <span>FULL-STACK</span>
                <i />
                <span>AI / ML</span>
                <i />
                <span>RESEARCH</span>
              </div>
              <p className={styles.heroSummary}>
                Building practical software across full-stack development,
                AI/ML and applied research, with a focus on systems that solve
                real problems.
              </p>
            </div>
          </div>

          <div className={styles.identityUtility}>
            <div className={styles.identityFacts}>
              {location && (
                <span>
                  <small>BASE</small>
                  <strong>{location}</strong>
                </span>
              )}
              <span>
                <small>FOCUS</small>
                <strong>Software + Intelligence</strong>
              </span>
              <span>
                <small>STATE</small>
                <strong>Open to Opportunities</strong>
              </span>
            </div>

            <div className={styles.actions}>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.resumeAction}
                >
                  RESUME <span>&darr;</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={styles.coreSide}>
          <IntelligenceCore />
        </div>
      </div>

      <HeroMetrics
        projects={projects}
        publications={publications}
        technologies={technologies}
        capabilities={capabilities}
      />

      <div className={styles.systemExit}>
        <div>
          <span>THE SYSTEM CONTINUES</span>
          <small>PROJECTS &times; TECHNOLOGIES &times; RESEARCH</small>
        </div>
        <i />
        <span>EXPLORE THE WORK &darr;</span>
      </div>
    </section>
  );
}