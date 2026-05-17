import { redirect } from "next/navigation";

export default function EnvironmentPage({
  params,
}: {
  params: { projectId: string; environmentId: string };
}) {
  redirect(`/projects/${params.projectId}/environments/${params.environmentId}/dataset`);
}