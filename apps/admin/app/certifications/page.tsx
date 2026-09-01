"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Asset = { id: string; storage_key: string };
type Certification = { id: string; name: string; issuer: string; image_url: string | null; certification_media?: { media: Asset }[] };
type Form = { name: string; issuer: string; image_url: string; media_ids: string[] };

const api = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000";
const empty: Form = { name: "", issuer: "", image_url: "", media_ids: [] };

export default function CertificationsPage() {
  const [items, setItems] = useState<Certification[]>([]);
  const [media, setMedia] = useState<Asset[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load<T>(path: string): Promise<T> {
    const response = await fetch(`${api}${path}`, { credentials: "include" });
    if (response.status === 401) { window.location.replace("/login"); throw new Error("Authentication required."); }
    if (!response.ok) throw new Error(`${path} failed with status ${response.status}.`);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error(`${path} returned an invalid response.`);
    return data as T;
  }

  useEffect(() => {
    void Promise.all([load<Certification[]>("/admin/library/certifications"), load<Asset[]>("/admin/media")]).then(([certifications, assets]) => { setItems(certifications); setMedia(assets); }).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not load certifications or media."));
  }, []);

  function choose(asset: Asset) { const ids = form.media_ids.includes(asset.id) ? form.media_ids.filter((id) => id !== asset.id) : [...form.media_ids, asset.id]; const primary = media.find((item) => item.id === ids[0]); setForm({ ...form, media_ids: ids, image_url: primary ? `/media/${primary.storage_key}` : "" }); }
  async function save(event: React.FormEvent) { event.preventDefault(); const response = await fetch(`${api}/admin/library/certifications${editing ? `/${editing}` : ""}`, { method: editing ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!response.ok) { setMessage(`Could not save certification (status ${response.status}).`); return; } setItems(await load<Certification[]>("/admin/library/certifications")); setForm(empty); setEditing(null); setMessage("Certification saved."); }
  function edit(item: Certification) { setEditing(item.id); setForm({ name: item.name, issuer: item.issuer, image_url: item.image_url ?? "", media_ids: item.certification_media?.map(({ media: asset }) => asset.id) ?? [] }); }

  return <main className="editor-shell"><header className="editor-header"><Link className="admin-brand" href="/">AHR<span>.</span><small>studio / credentials</small></Link><Link className="editor-back" href="/">← Statistics</Link></header><section className="editor-grid"><form className="project-form" onSubmit={save}><p className="admin-kicker">{editing ? "Edit credential" : "New credential"}</p><label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Issuer<input required value={form.issuer} onChange={(event) => setForm({ ...form, issuer: event.target.value })} /></label><div className="media-picker-block"><strong>Credential images · {form.media_ids.length} selected</strong><div className="media-picker">{media.map((asset) => <button type="button" key={asset.id} className={form.media_ids.includes(asset.id) ? "media-picker-option selected" : "media-picker-option"} onClick={() => choose(asset)}><img src={`${api}/media/${asset.storage_key}`} alt="" /><span>{asset.storage_key.slice(0, 8)}…</span></button>)}</div></div><button type="submit">{editing ? "Update certification" : "Create certification"}</button>{message && <p className="editor-message">{message}</p>}</form><div className="project-list"><p className="admin-kicker">Credentials · {items.length}</p>{items.map((item, index) => <article className="project-row" key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.name}</strong><p>{item.issuer}</p></div><button type="button" onClick={() => edit(item)}>Edit</button></article>)}</div></section></main>;
}
