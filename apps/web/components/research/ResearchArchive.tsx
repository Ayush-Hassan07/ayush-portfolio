import TrackedLink from "@/components/analytics/TrackedLink";
import styles from "./ResearchArchive.module.css";

type ResearchRecord = {
  id: string;
  number: string;
  title: string;
  venue: string | null;
  year: string;
  description: string | null;
  paperUrl: string | null;
  notebookUrl: string | null;
};

export default function ResearchArchive({
  records,
}: {
  records: ResearchRecord[];
}) {
  return (
    <section className={styles.research}>
      <div className={styles.intro}>
        <div>
          <span>// RESEARCH OUTPUT</span>
          <small>
            {String(records.length).padStart(2, "0")} PUBLICATIONS
          </small>
        </div>

        <p>
          Published research with linked papers and reproducible
          implementation notebooks.
        </p>
      </div>

      <div className={styles.records}>
        {records.map((r) => (
          <article key={r.id} className={styles.record}>
            <div className={styles.recordIndex}>
              <span>R / {r.number}</span>
              <i />
              <strong>{r.number}</strong>
            </div>

            <div className={styles.content}>
              <div className={styles.metadata}>
                <span>
                  <small>YEAR</small>
                  <strong>{r.year}</strong>
                </span>

                <span>
                  <small>VENUE</small>
                  <strong>{r.venue ?? "RESEARCH RECORD"}</strong>
                </span>

                <span>
                  <small>OUTPUT</small>
                  <strong>PUBLICATION</strong>
                </span>
              </div>

              <span className={styles.recordLabel}>
                RESEARCH / {r.number}
              </span>

              <h2>{r.title}</h2>

              <div className={styles.artifacts}>
                {r.paperUrl && (
                  <TrackedLink
                    className={styles.primaryArtifact}
                    href={r.paperUrl}
                    target="_blank"
                    rel="noreferrer"
                    eventType="CTA_CLICK"
                    action="paper"
                    label={r.title}
                    entityType="research"
                    entityId={r.id}
                  >
                    <div>
                      <small>PUBLISHED OUTPUT</small>
                      <strong>OPEN PUBLICATION</strong>
                    </div>

                    <span>↗</span>
                  </TrackedLink>
                )}

                {r.notebookUrl && (
                  <TrackedLink
                    className={styles.secondaryArtifact}
                    href={r.notebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    eventType="CTA_CLICK"
                    action="notebook"
                    label={r.title}
                    entityType="research"
                    entityId={r.id}
                  >
                    <div>
                      <small>IMPLEMENTATION</small>
                      <strong>VIEW NOTEBOOK</strong>
                    </div>

                    <span>↗</span>
                  </TrackedLink>
                )}
              </div>
            </div>

            <aside className={styles.visual}>
              <div className={styles.visualHeader}>
                <span>RESEARCH SIGNAL</span>
                <small>{r.year}</small>
              </div>

              <div className={styles.signalBody}>
                <div className={styles.signalGraphic}>
                  <span className={styles.orbitOuter} />
                  <span className={styles.orbitMiddle} />
                  <span className={styles.orbitInner} />

                  <div className={styles.core}>
                    <small>R</small>
                    <strong>{r.number}</strong>
                  </div>
                </div>

                <div className={styles.signalStatus}>
                  <span>
                    <small>PAPER</small>
                    <strong>
                      {r.paperUrl ? "LINKED" : "—"}
                    </strong>
                  </span>

                  <span>
                    <small>NOTEBOOK</small>
                    <strong>
                      {r.notebookUrl ? "LINKED" : "—"}
                    </strong>
                  </span>

                  <span>
                    <small>RECORD</small>
                    <strong>{r.number}</strong>
                  </span>
                </div>
              </div>
            </aside>
          </article>
        ))}
      </div>
    </section>
  );
}