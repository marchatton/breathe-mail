export type Session = {
  userId: string;
  email: string | null;
  workspaceIds: string[];
  activeWorkspaceId: string | null;
};

export type SessionResolver = (request: Request) => Promise<Session | null>;

// Placeholder session seeded with demo workspace access. Swap via
// `registerSessionResolver` when hooking up the real identity provider.
const placeholderSession: Session = {
  userId: 'demo-user',
  email: 'demo@breathe.mail',
  workspaceIds: ['demo'],
  activeWorkspaceId: 'demo'
};

const placeholderResolver: SessionResolver = async () => placeholderSession;

let sessionResolver: SessionResolver = placeholderResolver;

export function registerSessionResolver(nextResolver: SessionResolver) {
  sessionResolver = nextResolver;
}

export function resetSessionResolver() {
  sessionResolver = placeholderResolver;
}

export async function resolveSession(request: Request): Promise<Session | null> {
  return sessionResolver(request);
}

type WorkspaceAuthSuccess = { session: Session };

type WorkspaceAuthFailure = { response: Response };

export type WorkspaceAuthResult = WorkspaceAuthSuccess | WorkspaceAuthFailure;

export function isWorkspaceAuthFailure(result: WorkspaceAuthResult): result is WorkspaceAuthFailure {
  return 'response' in result;
}

function unauthenticatedResponse(): Response {
  return Response.json(
    {
      error: {
        code: 'unauthenticated',
        message: 'Sign-in required to access this resource.',
        details: null
      }
    },
    { status: 401 }
  );
}

function forbiddenResponse(workspaceId: string): Response {
  return Response.json(
    {
      error: {
        code: 'workspace_forbidden',
        message: 'You do not have access to this workspace.',
        details: { workspaceId }
      }
    },
    { status: 403 }
  );
}

export async function guardWorkspaceAccess(
  request: Request,
  workspaceId: string
): Promise<WorkspaceAuthResult> {
  const session = await resolveSession(request);

  if (!session) {
    return { response: unauthenticatedResponse() };
  }

  if (!workspaceId || !session.workspaceIds.includes(workspaceId)) {
    return { response: forbiddenResponse(workspaceId) };
  }

  return { session };
}
