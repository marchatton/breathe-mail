import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';

import { workspaceFixture } from '../../../../../../../../packages/lib/email/src/fixtures';
import { workspaceSnapshotSchema } from '../../../../../../../../packages/lib/email/src/schemas';
import { GET } from './route';

const expectedMeta = {
  commands: { updatedAt: '2025-01-23T17:05:00Z' },
  insights: { updatedAt: '2025-01-23T16:15:00Z' },
  timeline: { updatedAt: '2025-01-23T15:45:00Z' },
  calendar: { updatedAt: '2025-01-23T12:00:00Z' },
  snoozed: { updatedAt: '2025-01-23T09:30:00Z' }
};

const expectedEtag = `"${createHash('sha256').update(JSON.stringify(expectedMeta)).digest('hex')}"`;

const expectedLastModified = new Date(
  Math.max(...Object.values(expectedMeta).map((slice) => Date.parse(slice.updatedAt)))
).toUTCString();

const baseUrl = 'http://localhost/api/v1/workspaces/demo/dashboard';

function createRouteRequest(url: string | URL, init?: RequestInit) {
  return new NextRequest(typeof url === 'string' ? url : url.toString(), init);
}

async function invokeDemoWorkspace(
  request: Request,
  workspaceId: string = 'demo'
): Promise<Response> {
  return GET(request, { params: { workspaceId } });
}

describe('GET /api/v1/workspaces/:workspaceId/dashboard', () => {
  it('returns the workspace snapshot with meta and cache headers', async () => {
    const request = createRouteRequest(baseUrl);
    const response = await invokeDemoWorkspace(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('etag')).toBe(expectedEtag);
    expect(response.headers.get('last-modified')).toBe(expectedLastModified);

    const payload = await response.json();
    const validation = workspaceSnapshotSchema.safeParse(payload.data);
    expect(validation.success).toBe(true);
    expect(payload).toEqual({
      data: workspaceFixture,
      meta: expectedMeta
    });
  });

  it('returns 304 when all requested slices are unchanged', async () => {
    const url = new URL(baseUrl);
    url.searchParams.set('commands_updated_after', expectedMeta.commands.updatedAt);
    url.searchParams.set('insights_updated_after', expectedMeta.insights.updatedAt);
    url.searchParams.set('timeline_updated_after', expectedMeta.timeline.updatedAt);
    url.searchParams.set('calendar_updated_after', expectedMeta.calendar.updatedAt);
    url.searchParams.set('snoozed_updated_after', expectedMeta.snoozed.updatedAt);

    const response = await invokeDemoWorkspace(createRouteRequest(url));

    expect(response.status).toBe(304);
    expect(response.headers.get('etag')).toBe(expectedEtag);
    expect(response.headers.get('last-modified')).toBe(expectedLastModified);
  });

  it.each(Object.entries(expectedMeta))(
    'returns 304 when %s refresh timestamp is current',
    async (sliceKey, { updatedAt }) => {
      const url = new URL(baseUrl);
      url.searchParams.set(`${sliceKey}_updated_after`, updatedAt);

      const response = await invokeDemoWorkspace(createRouteRequest(url));

      expect(response.status).toBe(304);
      expect(response.headers.get('etag')).toBe(expectedEtag);
      expect(response.headers.get('last-modified')).toBe(expectedLastModified);
    }
  );

  it.each(Object.entries(expectedMeta))(
    'returns 200 when %s refresh timestamp is stale',
    async (sliceKey, { updatedAt }) => {
      const staleTimestamp = new Date(Date.parse(updatedAt) - 60_000).toISOString();
      const url = new URL(baseUrl);
      url.searchParams.set(`${sliceKey}_updated_after`, staleTimestamp);

      const response = await invokeDemoWorkspace(createRouteRequest(url));

      expect(response.status).toBe(200);
      expect(response.headers.get('etag')).toBe(expectedEtag);
      expect(response.headers.get('last-modified')).toBe(expectedLastModified);

      const payload = await response.json();
      const validation = workspaceSnapshotSchema.safeParse(payload.data);
      expect(validation.success).toBe(true);
      expect(payload.meta).toEqual(expectedMeta);
    }
  );

  it('returns 304 when validators indicate cached copy is fresh via If-None-Match', async () => {
    const response = await invokeDemoWorkspace(
      createRouteRequest(baseUrl, {
        headers: { 'if-none-match': expectedEtag }
      })
    );

    expect(response.status).toBe(304);
    expect(response.headers.get('etag')).toBe(expectedEtag);
    expect(response.headers.get('last-modified')).toBe(expectedLastModified);
  });

  it('returns 304 when validators indicate cached copy is fresh via If-Modified-Since', async () => {
    const response = await invokeDemoWorkspace(
      createRouteRequest(baseUrl, {
        headers: { 'if-modified-since': expectedLastModified }
      })
    );

    expect(response.status).toBe(304);
    expect(response.headers.get('etag')).toBe(expectedEtag);
    expect(response.headers.get('last-modified')).toBe(expectedLastModified);
  });

  it('returns 412 when If-Match does not align with the current ETag', async () => {
    const response = await invokeDemoWorkspace(
      createRouteRequest(baseUrl, {
        headers: { 'if-match': '"some-other-etag"' }
      })
    );

    expect(response.status).toBe(412);
    expect(await response.json()).toEqual({
      error: {
        code: 'precondition_failed',
        message: 'Precondition failed for the provided validators.',
        details: {
          expectedEtag: expectedEtag
        }
      }
    });
  });

  it('returns 412 when If-Unmodified-Since is behind the last modification timestamp', async () => {
    const response = await invokeDemoWorkspace(
      createRouteRequest(baseUrl, {
        headers: {
          'if-unmodified-since': new Date(Date.parse(expectedLastModified) - 60_000).toUTCString()
        }
      })
    );

    expect(response.status).toBe(412);
    expect(await response.json()).toEqual({
      error: {
        code: 'precondition_failed',
        message: 'Precondition failed for the provided validators.',
        details: {
          expectedLastModified: expectedLastModified
        }
      }
    });
  });

  it('returns 404 with shared error envelope when workspace is missing', async () => {
    const response = await invokeDemoWorkspace(
      createRouteRequest('http://localhost/api/v1/workspaces/missing/dashboard'),
      'missing'
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: {
        code: 'workspace_not_found',
        message: 'Workspace missing or inaccessible.',
        details: null
      }
    });
  });

  it('returns 400 when timestamps are invalid', async () => {
    const url = new URL(baseUrl);
    url.searchParams.set('commands_updated_after', 'not-a-date');

    const response = await invokeDemoWorkspace(createRouteRequest(url));

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
