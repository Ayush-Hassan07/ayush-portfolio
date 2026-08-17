"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000";

type Profile = {
  name: string;
  title: string;
  bio: string;
  email: string;
  profile_image: string | null;
  phone: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
};
type MediaAsset = { id: string; storage_key: string };

const emptyProfile: Profile = {
  name: "",
  title: "",
  bio: "",
  email: "",
  profile_image: null,
  phone: null,
  location: null,
  github_url: null,
  linkedin_url: null,
};

export default function ProfilePage() {
  const [form, setForm] = useState<Profile>(emptyProfile);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<MediaAsset[]>([]);

  useEffect(() => {
    void fetch(`${api}/admin/library/profile`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: Profile | null) => {
        if (value) setForm(value);
      })
      .catch(() => setMessage("Could not load profile."));
    void fetch(`${api}/admin/media`, { credentials: "include" }).then((response) => response.ok ? response.json() as Promise<MediaAsset[]> : []).then(setMedia).catch(() => undefined);
  }, []);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setImageFile(selected);
    setImagePreview(selected ? URL.createObjectURL(selected) : "");
  }

  async function uploadProfileImage() {
    if (!imageFile) return;
    setImageBusy(true);
    try {
      const body = new FormData();
      body.append("file", imageFile);
      const uploadResponse = await fetch(`${api}/admin/media/image`, {
        method: "POST",
        credentials: "include",
        body,
      });
      if (!uploadResponse.ok) {
        setMessage("Profile image upload failed.");
        return;
      }
      const asset = (await uploadResponse.json()) as { storage_key: string };
      const nextProfile = { ...form, profile_image: asset.storage_key };
      const saveResponse = await fetch(`${api}/admin/library/profile/image`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_key: asset.storage_key }),
      });
      if (!saveResponse.ok) {
        setMessage("Image uploaded, but the profile image path could not be saved.");
        return;
      }
      setForm(nextProfile);
      setImageFile(null);
      setMessage("Profile image uploaded and saved.");
    } catch {
      setMessage("API is unreachable. Restart the API and try again.");
    } finally {
      setImageBusy(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch(`${api}/admin/library/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) setMessage("Profile saved.");
      else {
        const detail = (await response.json().catch(() => null)) as { message?: string } | null;
        setMessage(detail?.message ?? `Could not save profile (${response.status}).`);
      }
    } catch {
      setMessage("API is unreachable. Restart the API and try again.");
    } finally {
      setBusy(false);
    }
  }

  const storedImage = form.profile_image ? `${api}/admin/media/${form.profile_image}` : "";

  return (
    <main className="editor-shell">
      <header className="editor-header">
        <Link className="admin-brand" href="/">AHR<span>.</span><small>studio / profile</small></Link>
        <Link className="editor-back" href="/">← Overview</Link>
      </header>
      <section className="editor-intro">
        <p className="admin-kicker">Content / Profile</p>
        <h1>Define the<br /><em>identity.</em></h1>
        <p>Everything here can shape the public introduction without requiring a source-code edit.</p>
      </section>
      <form className="profile-form project-form" onSubmit={save}>
        <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Professional title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>Bio<textarea required rows={6} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></label>
        <label>Public email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Profile image
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} />
          {(imagePreview || storedImage) && <img className="profile-image-preview" src={imagePreview || storedImage} alt="Profile preview" />}
          <small>{form.profile_image ? `Stored path: ${form.profile_image}` : imageFile ? "Ready to upload" : "No profile image selected"}</small>
          <button type="button" onClick={() => void uploadProfileImage()} disabled={!imageFile || imageBusy}>{imageBusy ? "Optimizing…" : "Upload profile image"}</button>
        </label>
        <div className="media-picker-block"><strong>Or choose profile image from Media</strong><div className="media-picker">{media.map((asset) => <button type="button" className={form.profile_image === asset.storage_key ? "media-picker-option selected" : "media-picker-option"} key={asset.id} onClick={() => { setForm({ ...form, profile_image: asset.storage_key }); setImagePreview(`${api}/media/${asset.storage_key}`); setImageFile(null); }}><img src={`${api}/media/${asset.storage_key}`} alt="" /><span>{asset.storage_key.slice(0, 8)}…</span></button>)}</div></div>
        <label>Phone<input type="tel" value={form.phone ?? ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        <label>Location<input value={form.location ?? ""} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
        <label>GitHub URL<input type="url" value={form.github_url ?? ""} onChange={(event) => setForm({ ...form, github_url: event.target.value })} /></label>
        <label>LinkedIn URL<input type="url" value={form.linkedin_url ?? ""} onChange={(event) => setForm({ ...form, linkedin_url: event.target.value })} /></label>
        <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
        {message && <p className="editor-message" role="status">{message}</p>}
      </form>
    </main>
  );
}
