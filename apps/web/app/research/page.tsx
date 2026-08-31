import ResearchArchive from "../../components/research/ResearchArchive";
import { getPublicPublications } from "../../lib/public-api";
import styles from "./page.module.css";

function getYear(date: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.getUTCFullYear().toString();
}

export default async function ResearchPage() {
  const publications = await getPublicPublications();

  const records = publications.map((publication, index) => ({
    id: publication.id,
    number: String(index + 1).padStart(2, "0"),
    title: publication.title,
    venue: publication.venue,
    year: getYear(publication.publication_date),
    description: publication.description,
    paperUrl: publication.paper_url,
    notebookUrl:
      publication.notebook_url ?? publication.repository_url,
  }));

  return (
    <main className={styles.page}>
      {records.length ? (
        <ResearchArchive records={records} />
      ) : (
        <div className={styles.empty}>
          <span>// RESEARCH ARCHIVE</span>
          <p>
            No publication records are currently available.
          </p>
        </div>
      )}
    </main>
  );
}