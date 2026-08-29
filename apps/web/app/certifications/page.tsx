import Link from "next/link";
import { getPublicCertifications } from "../../lib/public-api";
import CertificatePreview from "./CertificatePreview";
import styles from "./certifications.module.css";

const api =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function year(date: string | null) {
  return date?.slice(0, 4) ?? "—";
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function validityState(expiry: string | null) {
  if (!expiry) return "NO EXPIRY";

  return new Date(expiry).getTime() >= Date.now()
    ? "ACTIVE"
    : "EXPIRED";
}

function recordState(url: string | null) {
  return url ? "VERIFIABLE" : "DOCUMENTED";
}

function recordCode(index: number, featured = false) {
  const number = String(index + 1).padStart(2, "0");
  return featured ? `F-${number}` : number;
}

export default async function CertificationsPage() {
  const certifications = await getPublicCertifications();

  const featured = certifications.filter(
    (certificate) => certificate.featured,
  );

  const regular = certifications.filter(
    (certificate) => !certificate.featured,
  );

  return (
    <main className={styles.page}>
      <section className={styles.registry}>
        <header className={styles.registryHeader}>
          <div className={styles.registryIdentity}>
            <span className={styles.registryCode}>
              // CREDENTIAL REGISTRY
            </span>

            <div className={styles.registryTitle}>
              <strong>CREDENTIAL RECORDS</strong>

              <span>
                LEARNING / EXPERIENCE / PROFESSIONAL DEVELOPMENT
              </span>
            </div>
          </div>

          <div className={styles.registryTelemetry}>
            <div>
              <small>RECORDS</small>
              <strong>
                {String(certifications.length).padStart(2, "0")}
              </strong>
            </div>

            <div>
              <small>FEATURED</small>
              <strong>
                {String(featured.length).padStart(2, "0")}
              </strong>
            </div>

            <div>
              <small>REGISTRY</small>

              <span className={styles.online}>
                <i />
                PUBLIC
              </span>
            </div>
          </div>
        </header>

        <div className={styles.registryStrip}>
          <span>REGISTRY / AYUSH.HR</span>
          <i />

          <span>
            SOFTWARE · AI / ML · ENGINEERING · RESEARCH
          </span>

          <i />

          <span>{new Date().getFullYear()}</span>
        </div>

        {featured.length > 0 && (
          <section className={styles.featured}>
            <header className={styles.sectionHeader}>
              <div>
                <span>FEATURED CREDENTIALS</span>
                <small>
                  PRIORITY / SELECTED PROFESSIONAL RECORDS
                </small>
              </div>

              <strong>
                {String(featured.length).padStart(2, "0")}
              </strong>
            </header>

            <div className={styles.featuredGrid}>
              {featured.map((certificate, index) => (
                <article
                  className={styles.featuredRecord}
                  key={certificate.id}
                >
                  <aside className={styles.recordRail}>
                    <span>
                      {recordCode(index, true)}
                    </span>

                    <i />

                    <small>FEATURED</small>
                  </aside>

                  <div className={styles.certificateVisual}>
                    <div className={styles.visualTop}>
                      <span>CERTIFICATE / PREVIEW</span>
                      <small>
                        {year(certificate.issue_date)}
                      </small>
                    </div>

                    {certificate.image_url ? (
                      <CertificatePreview src={`${api}${certificate.image_url}`} alt={`${certificate.name} certificate`} />
                    ) : (
                      <div className={styles.visualPlaceholder}>
                        <span>DOCUMENT RECORD</span>

                        <strong>
                          {recordCode(index, true)}
                        </strong>
                      </div>
                    )}

                    <span className={styles.visualScan} />
                  </div>

                  <div className={styles.recordContent}>
                    <div className={styles.recordMeta}>
                      <span>
                        {certificate.category ??
                          "PROFESSIONAL CREDENTIAL"}
                      </span>

                      <span>
                        RECORD / {recordCode(index, true)}
                      </span>
                    </div>

                    <h2>{certificate.name}</h2>

                    <p className={styles.issuer}>
                      {certificate.issuer}
                    </p>

                    {certificate.description && (
                      <p className={styles.description}>
                        {certificate.description}
                      </p>
                    )}

                    <div className={styles.dataGrid}>
                      <div>
                        <small>ISSUED</small>
                        <strong>
                          {formatDate(certificate.issue_date)}
                        </strong>
                      </div>

                      <div>
                        <small>RECORD STATE</small>

                        <strong
                          className={
                            certificate.credential_url
                              ? styles.verified
                              : styles.documented
                          }
                        >
                          <i />
                          {recordState(
                            certificate.credential_url,
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>VALIDITY</small>
                        <strong>
                          {validityState(
                            certificate.expiry_date,
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>CREDENTIAL ID</small>
                        <strong>
                          {certificate.credential_id ?? "—"}
                        </strong>
                      </div>
                    </div>

                    {certificate.credential_url ? (
                      <a
                        href={certificate.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.verifyAction}
                      >
                        <span>
                          <small>EXTERNAL SOURCE</small>
                          OPEN CREDENTIAL RECORD
                        </span>

                        <strong>↗</strong>
                      </a>
                    ) : (
                      <div className={styles.localRecord}>
                        <span>
                          <small>RECORD TYPE</small>
                          CERTIFICATE DOCUMENT
                        </span>

                        <strong>LOCAL</strong>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className={styles.records}>
          <header className={styles.sectionHeader}>
            <div>
              <span>
                {featured.length
                  ? "REGISTRY ARCHIVE"
                  : "CREDENTIAL DOSSIERS"}
              </span>

              <small>
                PROFESSIONAL / TECHNICAL / PARTICIPATION RECORDS
              </small>
            </div>

            <strong>
              {String(regular.length).padStart(2, "0")}
            </strong>
          </header>

          {regular.length > 0 ? (
            <div className={styles.recordList}>
              {regular.map((certificate, index) => (
                <article
                  className={styles.record}
                  key={certificate.id}
                >
                  <aside className={styles.standardRail}>
                    <span>
                      {recordCode(index)}
                    </span>

                    <i />

                    <small>RECORD</small>
                  </aside>

                  <div className={styles.standardVisual}>
                    <div className={styles.visualTop}>
                      <span>CERT / {recordCode(index)}</span>

                      <small>
                        {year(certificate.issue_date)}
                      </small>
                    </div>

                    {certificate.image_url ? (
                      <CertificatePreview src={`${api}${certificate.image_url}`} alt={`${certificate.name} certificate`} />
                    ) : (
                      <div className={styles.visualPlaceholder}>
                        <span>
                          {certificate.category
                            ?.slice(0, 3)
                            .toUpperCase() ?? "CRD"}
                        </span>

                        <strong>
                          {recordCode(index)}
                        </strong>
                      </div>
                    )}

                    <span className={styles.visualScan} />
                  </div>

                  <div className={styles.standardContent}>
                    <div className={styles.standardHead}>
                      <div className={styles.recordMeta}>
                        <span>
                          {certificate.category ??
                            "PROFESSIONAL CREDENTIAL"}
                        </span>

                        <span>
                          {year(certificate.issue_date)}
                        </span>
                      </div>

                      <span
                        className={
                          certificate.credential_url
                            ? styles.statusVerified
                            : styles.statusDocumented
                        }
                      >
                        <i />

                        {recordState(
                          certificate.credential_url,
                        )}
                      </span>
                    </div>

                    <h2>{certificate.name}</h2>

                    <p className={styles.standardIssuer}>
                      {certificate.issuer}
                    </p>

                    {certificate.description && (
                      <p className={styles.standardDescription}>
                        {certificate.description}
                      </p>
                    )}

                    <div className={styles.standardData}>
                      <div>
                        <small>ISSUED</small>

                        <strong>
                          {formatDate(certificate.issue_date)}
                        </strong>
                      </div>

                      <div>
                        <small>VALIDITY</small>

                        <strong>
                          {validityState(
                            certificate.expiry_date,
                          )}
                        </strong>
                      </div>

                      <div>
                        <small>CREDENTIAL ID</small>

                        <strong>
                          {certificate.credential_id ?? "—"}
                        </strong>
                      </div>

                      <div>
                        <small>SOURCE</small>

                        <strong>
                          {certificate.credential_url
                            ? "EXTERNAL"
                            : "LOCAL RECORD"}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.standardAction}>
                      {certificate.credential_url ? (
                        <a
                          href={certificate.credential_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>
                            <small>EXTERNAL RECORD</small>
                            VIEW CREDENTIAL
                          </span>

                          <strong>↗</strong>
                        </a>
                      ) : (
                        <span>
                          <small>ARCHIVED RECORD</small>
                          CERTIFICATE DOCUMENT
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className={styles.empty}>
              <span>00</span>

              <p>No credential records published.</p>
            </div>
          ) : null}
        </section>

        <footer className={styles.registryFooter}>
          <span>END / CREDENTIAL REGISTRY</span>

          <i />

          <Link href="/skills">
            TECHNICAL INDEX →
          </Link>
        </footer>
      </section>
    </main>
  );
}
