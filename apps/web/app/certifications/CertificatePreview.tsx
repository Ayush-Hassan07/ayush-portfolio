"use client";

import { useEffect, useState } from "react";
import styles from "./certifications.module.css";

type Props = { src: string; alt: string };

export default function CertificatePreview({ src, alt }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [open]);
  return <><button type="button" className={styles.previewTrigger} onClick={() => setOpen(true)} aria-label={`Open ${alt}`}><img src={src} alt={alt} /></button>{open && <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={alt} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div className={styles.lightboxPanel}><button type="button" className={styles.lightboxClose} onClick={() => setOpen(false)} aria-label="Close certificate preview">×</button><img className={styles.lightboxImage} src={src} alt={alt} /></div></div>}</>;
}
