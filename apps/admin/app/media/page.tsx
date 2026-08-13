"use client";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000";
type Asset = { id: string; storage_key: string; mime_type: string; byte_size: number; created_at: string };

export default function MediaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Asset[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() { const response = await fetch(`${api}/admin/media`, { credentials: "include" }); if (response.ok) setItems(await response.json() as Asset[]); }
  useEffect(() => { void load(); }, []);
  async function upload() { if (!file) return; setBusy(true); const data = new FormData(); data.append("file", file); const response = await fetch(`${api}/admin/media/image`, { method: "POST", credentials: "include", body: data }); setMessage(response.ok ? "Image optimized and stored." : "Upload failed. Check the image type and size."); if (response.ok) { setFile(null); await load(); } setBusy(false); }
  return <main className="editor-shell"><header className="editor-header"><Link className="admin-brand" href="/">AHR<span>.</span><small>studio / media</small></Link><Link className="editor-back" href="/">← Overview</Link></header><section className="editor-intro"><p className="admin-kicker">Content / Media</p><h1>Make the work<br /><em>visible.</em></h1><p>Uploads are inspected by content, resized, converted to WebP, and stored outside Git.</p></section><section className="media-uploader"><label className="upload-drop">Choose an image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} /><span>{file ? file.name : "JPEG, PNG, or WebP · max 10 MB"}</span></label><button type="button" onClick={() => void upload()} disabled={!file || busy}>{busy ? "Optimizing…" : "Upload image"}</button>{message && <p className="editor-message">{message}</p>}</section><section className="media-gallery"><p className="admin-kicker">Stored assets · {items.length}</p><div className="media-grid">{items.map((item) => <article className="media-item" key={item.id}><img src={`${api}/admin/media/${item.storage_key}`} alt="Uploaded portfolio asset" /><div><strong>{item.storage_key}</strong><span>{Math.round(item.byte_size / 1024)} KB · WebP</span></div></article>)}</div></section></main>;
}
