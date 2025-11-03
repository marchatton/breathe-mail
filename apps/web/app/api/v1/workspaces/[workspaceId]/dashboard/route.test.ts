import { afterEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';

import { workspaceFixture } from '../../../../../../../../packages/lib/email/src/fixtures';
import { GET } from './route';
import {
  registerSessionResolver,
  resetSessionResolver,
  type Session
} from '../../../../../../server/middleware/auth';

const expectedMeta = {
  commands: { updatedAt: '2025-01-23T17:05:00Z' },
  insights: { updatedAt: '2025-01-23T16:15:00Z' },
  timeline: { updatedAt: '2025-01-23T15:45:00Z' },
  calendar: { updatedAt: '2025-01-23T12:00:00Z' },
  snoozed: { updatedAt: '2025-01-23T09:30:00Z' }
};

const expectedEtag = `"${createHash('sha256')
  .update(
    Object.entries(expectedMeta)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, slice]) => `${key}:${slice.updatedAt}`)
      .join('|')
  )
  .digest('hex')}"`;

const expectedLastModified = new Date(
  Math.max(...Object.values(expectedMeta).map((slice) => Date.parse(slice.updatedAt)))
).toUTCString();

afterEach(() => {
  resetSessionResolver();
});

describe('GET /api/v1/workspaces/:workspaceId/dashboard', () => {
  it('returns the workspace snapshot with meta and cache headers', async () => {
    const request = new Request('http://localhost/api/v1/workspaces/demo/dashboard');
    const response = await GET(request, { params: { workspaceId: 'demo' } });

    expect(response.status).toBe(200);
    expect(response.headers.get('etag')).toBe(expectedEtag);
    expect(response.headers.get('last-modified')).toBe(expectedLastModified);

    const payload = await response.json();
    expect(payload).toEqual({
      data: workspaceFixture,
      meta: expectedMeta
    });
  });

  it('returns 304 when all requested slices are unchanged', async () => {
    const url = new URL('http://localhost/api/v1/workspaces/demo/dashboard');
    url.searchParams.set('commands_updated_after', expectedMeta.commands.updatedAt);
    url.searchParams.set('insights_updated_after', expectedMeta.insights.updatedAt);
    url.searchParams.set('timeline_updated_after', expectedMeta.timeline.updatedAt);
    url.searchParams.set('calendar_updated_after', expectedMeta.calendar.updatedAt);
    url.searchParams.set('snoozed_updated_after', expectedMeta.snoozed.updatedAt);

    const response = await GET(new Request(url), { params: { workspaceId: 'demo' } });

    expect(response.status).toBe(304);
    expect(response.headers.get('etag')).toBe(expectedEtag);
    expect(response.headers.get('last-modified')).toBe(expectedLastModified);
  });

  it('returns 304 when If-None-Match includes the current validator', async () => {
    const request = new Request('http://localhost/api/v1/workspaces/demo/dashboard', {
      headers: {
        'if-none-match': `W/${expectedEtag}, "some-other-etag"`
      }
    });

    const response = await GET(request, { params: { workspaceId: 'demo' } });

    expect(response.status).toBe(304);
    expect(response.headers.get('etag')).toBe(expectedEtag);
    expect(response.headers.get('last-modified')).toBe(expectedLastModified);
  });

  it('returns 304 when If-Modified-Since is up to date', async () => {
    const request = new Request('http://localhost/api/v1/workspaces/demo/dashboard', {
      headers: {
        'if-modified-since': expectedLastModified
      }
    });

    const response = await GET(request, { params: { workspaceId: 'demo' } });

    expect(response.status).toBe(304);
    expect(response.headers.get('etag')).toBe(expectedEtag);
    expect(response.headers.get('last-modified')).toBe(expectedLastModified);
  });

  it('returns 404 with shared error envelope when workspace is missing', async () => {
    const response = await GET(new Request('http://localhost/api/v1/workspaces/missing/dashboard'), {
      params: { workspaceId: 'missing' }
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: 'workspace_not_found',
        message: 'Workspace missing or inaccessible.',
        details: null
      }
    });
  });

  it('returns 401 when no session is resolved', async () => {
    registerSessionResolver(async () => null);

    const response = await GET(new Request('http://localhost/api/v1/workspaces/demo/dashboard'), {
      params: { workspaceId: 'demo' }
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: {
        code: 'unauthenticated',
        message: 'Sign-in required to access this resource.',
        details: null
      }
    });
  });

  it('returns 403 when session cannot access the workspace', async () => {
    const session: Session = {
      userId: 'demo-user',
      email: 'demo@breathe.mail',
      workspaceIds: ['other'],
      activeWorkspaceId: 'other'
    };

    registerSessionResolver(async () => session);

    const response = await GET(new Request('http://localhost/api/v1/workspaces/demo/dashboard'), {
      params: { workspaceId: 'demo' }
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: {
        code: 'workspace_forbidden',
        message: 'You do not have access to this workspace.',
        details: { workspaceId: 'demo' }
      }
    });
  });

  it('returns 400 when timestamps are invalid', async () => {
    const url = new URL('http://localhost/api/v1/workspaces/demo/dashboard');
    url.searchParams.set('commands_updated_after', 'not-a-date');

    const response = await GET(new Request(url), { params: { workspaceId: 'demo' } });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        code: 'invalid_query',
        message: 'One or more refresh timestamps are invalid ISO strings.',
        details: {
          invalid: ['commands_updated_after']
        }
      }
    });
  });
});
