// store/useEnvStore.ts
import { create } from 'zustand'

interface EnvStore {
  // environments
  refreshProjectId: string | null
  notifyEnvCreated: (projectId: string) => void
  clearRefresh: () => void

  // projects 👈 new
  projectRefresh: boolean
  notifyProjectCreated: () => void
  clearProjectRefresh: () => void
}

const useEnvStore = create<EnvStore>((set) => ({
  // environments
  refreshProjectId: null,
  notifyEnvCreated: (projectId) => set({ refreshProjectId: projectId }),
  clearRefresh: () => set({ refreshProjectId: null }),

  // projects 👈 new
  projectRefresh: false,
  notifyProjectCreated: () => set({ projectRefresh: true }),
  clearProjectRefresh: () => set({ projectRefresh: false }),
}))

export default useEnvStore