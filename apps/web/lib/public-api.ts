export type PublicProfile = {
  name: string;
  title: string;
  bio: string;
  email: string;
  resume_url: string | null;
  location: string | null;
  profile_image: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  google_scholar_url: string | null;
};

export type PublicProject = {
  id?: string;
  title: string;
  slug: string;
  summary?: string | null;
  description: string;
  status?: string;
  image_url: string | null;
  featured: boolean;
  sort_order?: number;
  live_url: string | null;
  github_url: string | null;
  project_technology?: { technology: { id: string; name: string; category: string | null } }[];
  project_media?: { media: { storage_key: string } }[];
};
export type PublicPublication = { id: string; title: string; venue: string | null; publication_date: string | null; paper_url: string | null; notebook_url: string | null; repository_url: string | null; description: string | null; featured: boolean };
export type PublicSkill = { id: string; name: string; category: string; sort_order: number; featured: boolean };
export type PublicCertification = {
  id: string;
  name: string;
  issuer: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
  image_url: string | null;
  category: string | null;
  featured: boolean;
  sort_order: number;
  certification_media?: { media: { storage_key: string } }[];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options?: { fresh?: boolean }): Promise<T | null> {
  try {
    const response = await fetch(`${apiUrl}/public/${path}`, {
      ...(options?.fresh ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function getPublicProfile() {
  return request<PublicProfile>('profile');
}

export async function getPublicProjects() {
  return (await request<PublicProject[]>('projects')) ?? [];
}
export async function getPublicProject(slug: string) { return request<PublicProject>(`projects/${encodeURIComponent(slug)}`); }
export async function getPublicPublications() { return (await request<PublicPublication[]>('publications')) ?? []; }
export async function getPublicSkills() { return (await request<PublicSkill[]>('skills', { fresh: true })) ?? []; }
export async function getPublicCertifications() { return (await request<PublicCertification[]>('certifications')) ?? []; }
export type PublicEducation = { id: string; institution: string; degree: string; field: string | null; start_date: string; end_date: string | null; description: string | null; result: string | null; institution_url: string | null };
export type PublicExperience = { id: string; company: string; position: string; location: string | null; start_date: string; end_date: string | null; description: string; company_url: string | null };
export async function getPublicEducation() { return (await request<PublicEducation[]>('education')) ?? []; }
export async function getPublicExperience() { return (await request<PublicExperience[]>('experience')) ?? []; }
