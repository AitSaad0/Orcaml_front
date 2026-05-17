import EnvironmentTabBar from "@/components/ui/environment/EnvironmentTabBar";

export default function EnvironmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string; environmentId: string };
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <EnvironmentTabBar
        projectId={params.projectId}
        environmentId={params.environmentId}
      />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}