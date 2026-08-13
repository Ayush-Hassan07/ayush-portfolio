export type PublicProfile = {
  name: string;
  title: string;
  bio: string;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
};

export type PublicProject = {
  title: string;
  slug: string;
  description: string;
  featured: boolean;
  live_url: string | null;
  github_url: string | null;
  project_technology?: { technology: { id: string; name: string; category: string | null } }[];
};
export type PublicPublication = { id: string; title: string; venue: string | null; publication_date: string | null; paper_url: string | null; description: string | null; featured: boolean };
export type PublicSkill = { id: string; name: string; category: string; sort_order: number };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiUrl}/public/${path}`, {
      next: { revalidate: 60 },
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
export async function getPublicSkills() { return (await request<PublicSkill[]>('skills')) ?? []; }
