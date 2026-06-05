import EnvironmentPageWrapper from "@/components/ui/environment/EnvironmentPageWrapper";
import RunsSection from "@/components/ui/runs/RunsSection";

interface Props {
  params: { projectId: string; environmentId: string };
}

export default function RunsPage({ params }: Props) {
  return (
    <EnvironmentPageWrapper>
      <RunsSection
        projectId={params.projectId}
        environmentId={params.environmentId}
      />
    </EnvironmentPageWrapper>
  );
}