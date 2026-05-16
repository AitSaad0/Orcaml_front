export const envCreatedEvent = "env:created";

export function emitEnvCreated(projectId: string) {
  window.dispatchEvent(new CustomEvent(envCreatedEvent, { detail: { projectId } }));
}