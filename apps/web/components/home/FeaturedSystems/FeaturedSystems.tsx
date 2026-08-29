"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicProject } from "../../../lib/public-api";
import styles from "./FeaturedSystems.module.css";

type Props = { projects: PublicProject[] };

function getImage(project: PublicProject) {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const key = project.project_media?.[0]?.media?.storage_key;
  return key ? `${api}/media/${key}` : project.image_url ?? null;
}

export default function FeaturedSystems({ projects }: Props) {
  const featured = useMemo(() => projects.filter((project) => project.featured).sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER)), [projects]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [startIndex, setStartIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth <= 700) {
        setVisibleCount(1);
      } else if (window.innerWidth <= 1050) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () => {
      window.removeEventListener("resize", updateVisibleCount);
    };
  }, []);

  const maxStartIndex = Math.max(0, featured.length - visibleCount);
  const hasCarousel = featured.length > visibleCount;

  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [maxStartIndex]);

  useEffect(() => {
    if (!hasCarousel || paused) return;
    const timer = window.setInterval(() => setStartIndex((current) => current >= maxStartIndex ? 0 : current + 1), 5000);
    return () => window.clearInterval(timer);
  }, [hasCarousel, paused, maxStartIndex]);

  if (!featured.length) return null;

  const slide = (direction: number) => setStartIndex((current) => current >= maxStartIndex && direction > 0 ? 0 : current <= 0 && direction < 0 ? maxStartIndex : current + direction);

  return (
    <section className={styles.section} aria-labelledby="featured-systems-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setPaused(false);
      }
    }}>
      <div className={styles.sectionHeader}>
        <div className={styles.headingGroup}><span className={styles.eyebrow}>// SELECTED SYSTEMS</span><h2 id="featured-systems-title" className={styles.title}>Featured builds</h2></div>
        <div className={styles.headerMeta}><span>{String(featured.length).padStart(2, "0")} / PRIORITY</span><Link href="/projects" className={styles.allSystems}>VIEW ALL SYSTEMS <span>↗</span></Link></div>
      </div>

      <div className={styles.carouselViewport}>
        <div className={styles.carouselTrack} style={{ transform: `translateX(-${startIndex * (100 / visibleCount)}%)` }}>
          {featured.map((project, index) => {
            const image = getImage(project);
            const number = String(index + 1).padStart(2, "0");
            const allTechnologies = project.project_technology?.map(({ technology }) => technology.name).filter(Boolean) ?? [];
            const visibleTechnologies = allTechnologies.slice(0, 3);
            const remainingTechnologies = Math.max(0, allTechnologies.length - visibleTechnologies.length);
            return (
              <article className={styles.system} key={project.id ?? project.slug}>
                <div className={styles.systemTop}><span className={styles.index}>{number}</span><div className={styles.status}><span className={styles.statusDot} />{project.status || "SYSTEM"}</div></div>
                <Link href={`/projects/${project.slug}`} className={styles.visualLink}><div className={styles.visual}>{image ? <img src={image} alt="" className={styles.projectImage} /> : <div className={styles.visualFallback}><span>{number}</span><div className={styles.fallbackCross} /></div>}<div className={styles.visualGrid} /><div className={styles.visualCorners}><i /><i /><i /><i /></div><div className={styles.visualReadout}><span>SYS_{number}</span><span>FEATURED</span></div></div></Link>
                <div className={styles.systemBody}><div className={styles.systemIdentity}><span className={styles.record}>SYSTEM / {number}</span><h3 className={styles.systemTitle}><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3></div><p className={styles.description}>{project.description}</p>{visibleTechnologies.length > 0 && <div className={styles.technologies}>{visibleTechnologies.map((technology) => <span key={technology}>{technology}</span>)}{remainingTechnologies > 0 && <span className={styles.moreTechnologies} title={allTechnologies.slice(visibleTechnologies.length).join(", ")}>+{remainingTechnologies}</span>}</div>}<div className={styles.systemFooter}><Link href={`/projects/${project.slug}`} className={styles.openSystem}>OPEN SYSTEM <span>↗</span></Link><span className={styles.coordinates}>AHR / {number}</span></div></div>
              </article>
            );
          })}
        </div>
      </div>

      {hasCarousel && <div className={styles.carouselControls}><button type="button" onClick={() => slide(-1)} className={styles.carouselArrow} aria-label="Previous featured projects">←</button><div className={styles.carouselCenter}><div className={styles.carouselDots}>{Array.from({ length: maxStartIndex + 1 }).map((_, index) => <button key={index} type="button" onClick={() => setStartIndex(index)} className={index === startIndex ? styles.carouselDotActive : styles.carouselDot} aria-label={"Show featured projects starting from " + (index + 1)} aria-current={index === startIndex ? "true" : undefined} />)}</div><span className={styles.carouselCounter}>{String(startIndex + 1).padStart(2, "0")} / {String(maxStartIndex + 1).padStart(2, "0")}</span></div><button type="button" onClick={() => slide(1)} className={styles.carouselArrow} aria-label="Next featured projects">→</button></div>}
    </section>
  );
}
