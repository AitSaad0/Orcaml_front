const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
}
export async function getProjects(token: string): Promise<Project[]> {
  console.log("getProjects called, token starts with:", token?.slice(0, 20));
  const res = await fetch(`${API_BASE}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("getProjects status:", res.status);
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  console.log("getProjects raw data:", data);
  return data.projects;
}