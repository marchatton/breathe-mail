import { workspaceFixture } from '../../../packages/lib/email/src/fixtures';
import type { WorkspaceSnapshot } from '../../../packages/lib/email/src/schemas';

export type DashboardMeta = {
  commands: { updatedAt: string };
  insights: { updatedAt: string };
  timeline: { updatedAt: string };
  calendar: { updatedAt: string };
  snoozed: { updatedAt: string };
};

export type WorkspaceDashboard = {
  data: WorkspaceSnapshot;
  meta: DashboardMeta;
};

const demoWorkspace: WorkspaceDashboard = {
  data: workspaceFixture,
  meta: {
    commands: { updatedAt: '2025-01-23T17:05:00Z' },
    insights: { updatedAt: '2025-01-23T16:15:00Z' },
    timeline: { updatedAt: '2025-01-23T15:45:00Z' },
    calendar: { updatedAt: '2025-01-23T12:00:00Z' },
    snoozed: { updatedAt: '2025-01-23T09:30:00Z' }
  }
};

const DASHBOARDS: Record<string, WorkspaceDashboard> = {
  demo: demoWorkspace
};

export function getWorkspaceDashboard(workspaceId: string): WorkspaceDashboard | null {
  return DASHBOARDS[workspaceId] ?? null;
}
