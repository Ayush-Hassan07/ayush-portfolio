"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "./SystemsInspector.module.css";

type ProjectRecord = {
  id: string | number;
  slug: string;
  title: string;
  description?: string | null;
  status?: string | null;
  number: string;
  technologies: string[];
};

export default function SystemsInspector({
  projects,
}: {
  projects: ProjectRecord[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const active = projects[activeIndex];

  return (
    <section className={styles.systems}>
      <div className={styles.consoleHeader}>
        <div>
          <span>// SYSTEM INDEX</span>

          <small>
            {String(projects.length).padStart(2, "0")} PROJECT RECORDS
          </small>
        </div>

        <div className={styles.consoleState}>
          <i aria-hidden="true" />
          ARCHIVE ONLINE
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.index}>
          {projects.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              className={`${styles.systemRow} ${
                index === activeIndex
                  ? styles.systemRowActive
                  : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => {
                setActiveIndex(index);
                window.location.href = `/projects/${project.slug}`;
              }}
            >
              <span className={styles.number}>
                {project.number}
              </span>

              <span
                className={styles.signal}
                aria-hidden="true"
              >
                <i />
              </span>

              <span className={styles.identity}>
                <small>
                  {project.status ?? "PROJECT"}
                </small>

                <strong>{project.title}</strong>

                <span className={styles.mobileStack}>
                  {project.technologies
                    .slice(0, 3)
                    .join(" / ")}

                  {project.technologies.length > 3
                    ? ` / +${project.technologies.length - 3}`
                    : ""}
                </span>
              </span>

              <span className={styles.stack}>
                {project.technologies
                  .slice(0, 3)
                  .map((technology) => (
                    <span key={technology}>
                      {technology}
                    </span>
                  ))}

                {project.technologies.length > 3 && (
                  <span>
                    +{project.technologies.length - 3}
                  </span>
                )}
              </span>

              <span className={styles.rowState}>
                {index === activeIndex
                  ? "ACTIVE"
                  : "READY"}
              </span>
            </button>
          ))}
        </div>

        <aside className={styles.inspector}>
          <div
            className={styles.inspectorGrid}
            aria-hidden="true"
          />

          <header className={styles.inspectorHeader}>
            <div>
              <span>// PROJECT SIGNAL</span>

              <small>
                RECORD {active.number} /{" "}
                {String(projects.length).padStart(2, "0")}
              </small>
            </div>

            <span className={styles.status}>
              <i aria-hidden="true" />
              {active.status ?? "PROJECT"}
            </span>
          </header>

          <div className={styles.visual}>
            <span
              className={styles.ringOuter}
              aria-hidden="true"
            />

            <span
              className={styles.ringInner}
              aria-hidden="true"
            />

            <div className={styles.core}>
              <small>SYS</small>
              <strong>{active.number}</strong>
            </div>

            <span className={styles.coordinate}>
              STACK / RECORD / ACTIVE
            </span>
          </div>

          <div className={styles.inspectorBody}>
            <div className={styles.recordMeta}>
              <span>
                <small>RECORD</small>
                <strong>{active.number}</strong>
              </span>

              <span>
                <small>STATE</small>
                <strong>
                  {active.status ?? "PROJECT"}
                </strong>
              </span>

              <span>
                <small>TECH</small>
                <strong>
                  {String(
                    active.technologies.length,
                  ).padStart(2, "0")}
                </strong>
              </span>
            </div>

            <h2>{active.title}</h2>

            {active.description && (
              <p>{active.description}</p>
            )}

            <div className={styles.technologyPanel}>
              <span className={styles.techLabel}>
                TECHNOLOGY SIGNAL
              </span>

              <div>
                {active.technologies.map(
                  (technology, index) => (
                    <span
                      className={styles.tech}
                      key={`${technology}-${index}`}
                    >
                      <i aria-hidden="true" />
                      {technology}
                    </span>
                  ),
                )}
              </div>
            </div>

            <Link
              href={`/projects/${active.slug}`}
              className={styles.inspectAction}
            >
              <span>
                <small>OPEN RECORD</small>
                INSPECT SYSTEM
              </span>

              <strong aria-hidden="true">
                ↗
              </strong>
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}