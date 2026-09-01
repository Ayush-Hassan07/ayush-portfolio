import type { Metadata } from "next";

import {
  getPublicEducation,
  getPublicExperience,
} from "../../lib/public-api";

import JourneyScrollButton from "./JourneyScrollButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Journey",

  description:
    "Professional experience, education, and engineering development across software, AI/ML, and research.",

  alternates: {
    canonical: "/journey",
  },

  openGraph: {
    title: "Journey | Ayush Hassan Raiyan",
    description:
      "Professional experience, education, and engineering development across software, AI/ML, and research.",
    url: "/journey",
    type: "website",
  },
};

function year(date: string | null) {
  if (!date) {
    return "PRESENT";
  }

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "-"
    : parsed.getUTCFullYear().toString();
}

function monthYear(date: string | null) {
  if (!date) {
    return "PRESENT";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed
    .toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

export default async function JourneyPage() {
  const [education, experience] = await Promise.all([
    getPublicEducation(),
    getPublicExperience(),
  ]);

  return (
    <main className={styles.page}>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span>05</span>
          <span>JOURNEY / PROFESSIONAL DEVELOPMENT</span>
        </div>

        <div className={styles.heroGrid}>
          {/* Visual Journey Map */}

          <div className={styles.journeyMap}>
            <div
              className={styles.mapGrid}
              aria-hidden="true"
            />

            <svg
              className={styles.triangleSvg}
              viewBox="0 0 1000 520"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className={styles.trianglePath}
                d="M 150 390 L 500 105 L 850 390 Z"
              />
            </svg>

            <span
              className={styles.v2Signal}
              aria-hidden="true"
            />

            <div
              className={`${styles.v2Node} ${styles.v2Foundation}`}
            >
              <span className={styles.v2Number}>
                01
              </span>

              <div className={styles.v2Dot}>
                <i />
              </div>

              <div className={styles.v2Text}>
                <small>FOUNDATION</small>
                <strong>COMPUTING</strong>
              </div>
            </div>

            <div
              className={`${styles.v2Node} ${styles.v2Practice}`}
            >
              <span className={styles.v2Number}>
                02
              </span>

              <div className={styles.v2Dot}>
                <i />
              </div>

              <div className={styles.v2Text}>
                <small>PRACTICE</small>
                <strong>ENGINEERING</strong>
              </div>
            </div>

            <div
              className={`${styles.v2Node} ${styles.v2Intelligence}`}
            >
              <span className={styles.v2Number}>
                03
              </span>

              <div className={styles.v2Dot}>
                <i />
              </div>

              <div className={styles.v2Text}>
                <small>INTELLIGENCE</small>
                <strong>AI / RESEARCH</strong>
              </div>
            </div>

            <div className={styles.v2MapFooter}>
              <span>WORK</span>
              <i />
              <span>STUDY</span>
              <i />
              <strong>BUILD</strong>
            </div>
          </div>

          {/* Summary cards */}

          <div className={styles.heroStats}>
            <JourneyScrollButton
              targetId="professional-experience"
              className={styles.statRow}
            >
              <div className={styles.statIcon}>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="7"
                    width="18"
                    height="12"
                    rx="1.5"
                  />

                  <path d="M8 7V5.5C8 4.7 8.7 4 9.5 4h5c.8 0 1.5.7 1.5 1.5V7" />
                  <path d="M3 11h18" />
                  <path d="M10 10h4v3h-4z" />
                </svg>
              </div>

              <strong className={styles.statNumber}>
                {String(experience.length).padStart(
                  2,
                  "0",
                )}
              </strong>

              <div className={styles.statContent}>
                <span>PROFESSIONAL ROLES</span>

                <p>
                  Practical and academic work experience in real
                  engineering environments.
                </p>
              </div>

              <span className={styles.statArrow}>
                &rsaquo;
              </span>
            </JourneyScrollButton>

            <JourneyScrollButton
              targetId="academic-records"
              className={styles.statRow}
            >
              <div className={styles.statIcon}>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M2 9 12 4l10 5-10 5L2 9Z" />
                  <path d="M6 11.5V17c2.2 2 9.8 2 12 0v-5.5" />
                  <path d="M22 9v6" />
                </svg>
              </div>

              <strong className={styles.statNumber}>
                {String(education.length).padStart(
                  2,
                  "0",
                )}
              </strong>

              <div className={styles.statContent}>
                <span>ACADEMIC RECORDS</span>

                <p>
                  Formal education and academic foundations in
                  computing and science.
                </p>
              </div>

              <span className={styles.statArrow}>
                &rsaquo;
              </span>
            </JourneyScrollButton>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXPERIENCE
      ===================================================== */}

      <section
        id="professional-experience"
        className={styles.experienceSection}
      >
        <header className={styles.sectionHeader}>
          <div>
            <span>// EXPERIENCE</span>
            <h2>Professional work.</h2>
          </div>

          <p>
            Roles where technical knowledge was applied in
            practical, academic and production-oriented
            environments.
          </p>
        </header>

        <div className={styles.experienceList}>
          {experience.map((item, index) => (
            <article
              className={styles.experienceRecord}
              key={item.id}
            >
              <div className={styles.recordIndex}>
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className={styles.recordPeriod}>
                <span>ROLE</span>

                <strong>
                  {monthYear(item.start_date)}
                </strong>

                <i>&rarr;</i>

                <strong>
                  {monthYear(item.end_date)}
                </strong>
              </div>

              <div className={styles.recordBody}>
                <h3>{item.position}</h3>

                <div className={styles.organization}>
                  <strong>{item.company}</strong>

                  {item.location && (
                    <span>{item.location}</span>
                  )}
                </div>

                <p>{item.description}</p>

                {item.company_url && (
                  <a
                    href={item.company_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.external}
                  >
                    ORGANIZATION
                    <span>&nearr;</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          EDUCATION
      ===================================================== */}

      <section
        id="academic-records"
        className={styles.educationSection}
      >
        <header className={styles.sectionHeader}>
          <div>
            <span>// ACADEMIC FOUNDATION</span>
            <h2>Education.</h2>
          </div>

          <p>
            Formal academic foundations supporting computing,
            engineering and research.
          </p>
        </header>

        <div className={styles.educationList}>
          {education.map((item, index) => {
            const current = !item.end_date;

            return (
              <article
                className={styles.educationRecord}
                key={item.id}
              >
                <div className={styles.recordIndex}>
                  {String(index + 1).padStart(
                    2,
                    "0",
                  )}
                </div>

                <div className={styles.educationPeriod}>
                  <span>
                    {year(item.start_date)}
                  </span>

                  <i>&rarr;</i>

                  <span
                    className={
                      current
                        ? styles.current
                        : undefined
                    }
                  >
                    {year(item.end_date)}
                  </span>
                </div>

                <div className={styles.educationMain}>
                  <div
                    className={styles.educationTitle}
                  >
                    <h3>{item.degree}</h3>

                    {current && (
                      <span
                        className={
                          styles.currentBadge
                        }
                      >
                        CURRENT
                      </span>
                    )}
                  </div>

                  <strong>
                    {item.institution}
                  </strong>

                  {item.field && (
                    <p className={styles.field}>
                      {item.field}
                    </p>
                  )}

                  {item.description && (
                    <p
                      className={
                        styles.educationDescription
                      }
                    >
                      {item.description}
                    </p>
                  )}
                </div>

                <div
                  className={
                    styles.educationResult
                  }
                >
                  {item.result ? (
                    <>
                      <span>RESULT</span>
                      <strong>
                        {item.result}
                      </strong>
                    </>
                  ) : (
                    <span>IN PROGRESS</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          TRAJECTORY
      ===================================================== */}

      <section className={styles.trajectory}>
        <header
          className={styles.trajectoryHeader}
        >
          <span>// TRAJECTORY</span>

          <p>
            How the academic foundation, engineering practice
            and intelligent-systems work connect.
          </p>
        </header>

        <div className={styles.trajectoryLine}>
          <div
            className={styles.trajectorySignal}
            aria-hidden="true"
          >
            <span />
          </div>

          <TrajectoryStage
            index="01"
            route="ORIGIN"
            label="FOUNDATION"
            title="Computer Science & Engineering"
            description="Software, systems, databases and analytical problem solving."
          />

          <TrajectoryStage
            index="02"
            route="BUILD"
            label="PRACTICE"
            title="Software Engineering"
            description="Full-stack development and production-oriented web systems."
          />

          <TrajectoryStage
            index="03"
            route="EXPAND"
            label="SPECIALIZATION"
            title="AI + Intelligent Systems"
            description="Applying machine learning and research where they add real value."
          />

          <TrajectoryStage
            index="04"
            route="NOW"
            label="CURRENT DIRECTIONS"
            title="Software · Web · AI/ML"
            description="Targeting software engineering, full-stack and web development, and AI/ML engineering roles."
            current
          />
        </div>
      </section>
    </main>
  );
}

function TrajectoryStage({
  index,
  route,
  label,
  title,
  description,
  current = false,
}: {
  index: string;
  route: string;
  label: string;
  title: string;
  description: string;
  current?: boolean;
}) {
  return (
    <div
      className={`${styles.trajectoryItem} ${
        current
          ? styles.trajectoryCurrent
          : ""
      }`}
    >
      <span className={styles.trajectoryIndex}>
        {index}
      </span>

      <div className={styles.trajectoryNode}>
        <i />
      </div>

      <span className={styles.routeLabel}>
        {route}
      </span>

      <div>
        <small>{label}</small>

        <strong>{title}</strong>

        <p>{description}</p>
      </div>
    </div>
  );
}