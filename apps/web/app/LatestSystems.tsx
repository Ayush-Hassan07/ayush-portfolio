"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicProject } from "../lib/public-api";

export default function LatestSystems({ projects, api }: { projects: PublicProject[]; api: string }) {
  const [start, setStart] = useState(0);
  useEffect(() => {
    if (projects.length <= 3) return;
    const timer = window.setInterval(() => setStart(value => (value + 1) % projects.length), 3000);
    return () => window.clearInterval(timer);
  }, [projects.length]);
  const visible = projects.length <= 3 ? projects : [0, 1, 2].map(offset => projects[(start + offset) % projects.length]);
  return <div className="latest-carousel" aria-label="Latest systems carousel">
    <div className="system-grid">{visible.map((project, index) => <Link className="system-card" href={`/projects/${project.slug}`} key={project.slug}><span className="card-number">{String((start + index) % projects.length + 1).padStart(2, "0")}</span>{project.project_media?.[0] && <img src={`${api}/media/${project.project_media[0].media.storage_key}`} alt="" />}<div className="card-content"><small>{(project.status ?? "PROJECT SYSTEM").toUpperCase()}</small><h2>{project.title}</h2><p>{project.description}</p><b>VIEW SYSTEM →</b></div></Link>)}</div>
    {projects.length > 3 && <div className="carousel-dots" aria-label="Choose system slide">{projects.map((project, index) => <button aria-label={`Show ${project.title}`} className={index === start ? "active" : ""} key={project.slug} onClick={() => setStart(index)} type="button" />)}</div>}
  </div>;
}
