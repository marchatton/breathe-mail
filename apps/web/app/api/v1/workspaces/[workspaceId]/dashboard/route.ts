import { createHash } from 'node:crypto';

import {
  DashboardAccessError,
  getWorkspaceDashboard,
  type DashboardMeta,
  type WorkspaceDashboard,
  type WorkspaceSnapshot
} from '../../../../../../server/dashboard';
import { workspaceSnapshotSchema } from '../../../../../../../../packages/lib/email/src/schemas';

type DashboardResponseBody = {
  data: WorkspaceSnapshot;
  meta: DashboardMeta;
};

type ErrorResponseBody = {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown> | null;
  };
};

type RouteContext = {
  params: { workspaceId: string };
};

type RefreshEvaluation = {
  invalid: string[];
  requestedCount: number;
  hasChanges: boolean;
};

const REFRESH_PARAM_MAP: Record<keyof DashboardMeta, string> = {
  commands: 'commands_updated_after',
  insights: 'insights_updated_after',
  timeline: 'timeline_updated_after',
  calendar: 'calendar_updated_after',
  snoozed: 'snoozed_updated_after'
};

const CACHE_CONTROL_HEADER = 'private, max-age=0, must-revalidate';

function computeEtag(meta: DashboardMeta): string {
  return `"${createHash('sha256').update(JSON.stringify(meta)).digest('hex')}"`;
}

function computeLastModified(meta: DashboardMeta): Date {
  const timestamps = Object.values(meta)
    .map((slice) => Date.parse(slice.updatedAt))
    .filter((value): value is number => Number.isFinite(value));

  return new Date(Math.max(...timestamps));
}

function evaluateRefresh(url: URL, meta: DashboardMeta): RefreshEvaluation {
  let requestedCount = 0;
  let hasChanges = false;
  const invalid: string[] = [];

  for (const [sliceKey, param] of Object.entries(REFRESH_PARAM_MAP) as [keyof DashboardMeta, string][]) {
    const value = url.searchParams.get(param);
    if (value === null) {
      continue;
    }

    requestedCount += 1;
    const clientTimestamp = Date.parse(value);
    if (!Number.isFinite(clientTimestamp)) {
      invalid.push(param);
      continue;
    }

    const serverTimestamp = Date.parse(meta[sliceKey].updatedAt);
    if (serverTimestamp > clientTimestamp) {
      hasChanges = true;
    }
  }

  return { invalid, requestedCount, hasChanges };
}

function jsonResponse<T>(body: T, status: number, headers?: HeadersInit): Response {
  return Response.json(body, { status, headers });
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  details: Record<string, unknown> | null = null
): Response {
  const body: ErrorResponseBody = {
    error: {
      code,
      message,
      details
    }
  };

  return jsonResponse(body, status);
}

export async function GET(request: Request, { params }: RouteContext) {
  let workspace: WorkspaceDashboard | null;

  try {
    workspace = getWorkspaceDashboard(params.workspaceId);
  } catch (error) {
    if (error instanceof DashboardAccessError) {
      return errorResponse(error.status, error.code, error.message, error.details);
    }

    throw error;
  }

  if (!workspace) {
    return errorResponse(404, 'workspace_not_found', 'Workspace missing or inaccessible.');
  }

  const { data, meta } = workspace;
  const validatedData = workspaceSnapshotSchema.parse(data);
  const url = new URL(request.url);
  const refreshEvaluation = evaluateRefresh(url, meta);

  if (refreshEvaluation.invalid.length > 0) {
    return errorResponse(400, 'invalid_query', 'One or more refresh timestamps are invalid ISO strings.', {
      invalid: refreshEvaluation.invalid
    });
  }

  const etag = computeEtag(meta);
  const lastModified = computeLastModified(meta);
  const lastModifiedHeader = lastModified.toUTCString();
  const baseHeaders: HeadersInit = {
    'cache-control': CACHE_CONTROL_HEADER,
    etag,
    'last-modified': lastModifiedHeader
  };

  const ifMatch = request.headers.get('if-match');
  if (ifMatch && ifMatch !== etag) {
    return errorResponse(412, 'precondition_failed', 'Precondition failed for the provided validators.', {
      expectedEtag: etag
    });
  }

  const ifUnmodifiedSince = request.headers.get('if-unmodified-since');
  if (ifUnmodifiedSince) {
    const parsed = Date.parse(ifUnmodifiedSince);
    if (Number.isFinite(parsed) && parsed < lastModified.getTime()) {
      return errorResponse(412, 'precondition_failed', 'Precondition failed for the provided validators.', {
        expectedLastModified: lastModifiedHeader
      });
    }
  }

  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, { status: 304, headers: baseHeaders });
  }

  const ifModifiedSince = request.headers.get('if-modified-since');
  if (ifModifiedSince) {
    const parsed = Date.parse(ifModifiedSince);
    if (Number.isFinite(parsed) && parsed >= lastModified.getTime()) {
      return new Response(null, { status: 304, headers: baseHeaders });
    }
  }

  if (refreshEvaluation.requestedCount > 0 && !refreshEvaluation.hasChanges) {
    return new Response(null, { status: 304, headers: baseHeaders });
  }

  const responseBody: DashboardResponseBody = {
    data: validatedData,
    meta
  };

  return jsonResponse(responseBody, 200, baseHeaders);
}
