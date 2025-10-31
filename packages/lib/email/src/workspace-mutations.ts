import { z } from 'zod';
import { workspaceFixture } from './fixtures';
import {
  actionMetadataSchema,
  awaitingReplySchema,
  commandCardSchema,
  followUpSchema,
  type AwaitingReply,
  type CommandCard,
  type FollowUp,
  type WorkspaceSnapshot,
  workspaceSnapshotSchema
} from './schemas';

const NOT_FOUND_MESSAGE = "We couldn’t find that item.";
const CONFLICT_MESSAGE = 'This item was already updated.';
const VALIDATION_MESSAGE = 'Please check the form and try again.';

export class WorkspaceMutationError extends Error {
  readonly statusCode: 404 | 409 | 422;

  constructor(statusCode: 404 | 409 | 422, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

type CommandStatus = 'open' | 'resolved';
type FollowUpStatus = 'waiting' | 'nudged';
type AwaitingReplyStatus = 'waiting' | 'snoozed';

type CommandState = {
  card: CommandCard;
  status: CommandStatus;
  completedAtIso?: string;
  note?: string;
};

type FollowUpState = {
  item: FollowUp;
  status: FollowUpStatus;
  nudgedAtIso?: string;
  reminderChannel?: 'email' | 'telegram';
  message?: string;
};

type AwaitingReplyState = {
  item: AwaitingReply;
  status: AwaitingReplyStatus;
  snoozeUntilIso?: string;
  reason?: string;
};

type SnoozedSnapshot = {
  id: string;
  snoozeUntilLabel: string;
};

type IdempotencyRecord<T> = {
  result: T;
};

type CreateServiceOptions = {
  workspaceId: string;
  snapshot?: WorkspaceSnapshot;
  now?: () => Date;
};

type CompleteCommandInput = {
  workspaceId: string;
  commandId: string;
  payload: {
    actionMetadata: CommandCard['content']['actionMetadata'];
    completedAtIso: string;
    note: string;
  };
  idempotencyKey: string;
};

type CompleteCommandResult = {
  command: { id: string; status: 'resolved' };
  debrief: { statistics: { today: { actionsResolved: number } } };
};

type NudgeFollowUpInput = {
  workspaceId: string;
  threadId: string;
  payload: {
    reminderChannel: 'email' | 'telegram';
    message: string;
  };
  idempotencyKey: string;
};

type NudgeFollowUpResult = {
  followUp: { threadId: string; nudgedAtIso: string };
};

type SnoozeAwaitingReplyInput = {
  workspaceId: string;
  awaitingReplyId: string;
  payload: {
    snoozeUntilIso: string;
    reason: string;
  };
  idempotencyKey: string;
};

type SnoozeAwaitingReplyResult = {
  awaitingReply: { id: string; status: 'snoozed'; snoozeUntilIso: string };
  snoozed: SnoozedSnapshot[];
};

type WorkspaceMutationService = {
  completeCommand: (input: CompleteCommandInput) => CompleteCommandResult;
  nudgeFollowUp: (input: NudgeFollowUpInput) => NudgeFollowUpResult;
  snoozeAwaitingReply: (input: SnoozeAwaitingReplyInput) => SnoozeAwaitingReplyResult;
};

const cloneSnapshot = (snapshot: WorkspaceSnapshot): WorkspaceSnapshot => {
  if (typeof structuredClone === 'function') {
    return structuredClone(snapshot);
  }
  return JSON.parse(JSON.stringify(snapshot)) as WorkspaceSnapshot;
};

const completeCommandPayloadSchema = z.object({
  actionMetadata: actionMetadataSchema,
  completedAtIso: z.string().datetime(),
  note: z.string().trim().min(1)
});

const nudgeFollowUpPayloadSchema = z.object({
  reminderChannel: z.enum(['email', 'telegram']),
  message: z.string().trim().min(1).max(500)
});

const idempotencyKeySchema = z.string().uuid();

const createSnoozePayloadSchema = (now: () => Date) =>
  z
    .object({
      snoozeUntilIso: z.string().datetime(),
      reason: z.string().trim().min(1).max(500)
    })
    .superRefine((value, ctx) => {
      const snoozeDate = new Date(value.snoozeUntilIso);
      if (Number.isNaN(snoozeDate.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid datetime', path: ['snoozeUntilIso'] });
        return;
      }
      if (snoozeDate <= now()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Snooze must be in the future', path: ['snoozeUntilIso'] });
      }
    });

const ensureValidation = <T>(schema: z.ZodType<T>, payload: unknown): T => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new WorkspaceMutationError(422, VALIDATION_MESSAGE);
  }
  return result.data;
};

const assertWorkspaceMatches = (expected: string, provided: string) => {
  if (expected !== provided) {
    throw new WorkspaceMutationError(404, NOT_FOUND_MESSAGE);
  }
};

const ensureMetadataConsistency = (
  source: CommandCard['content']['actionMetadata'],
  payload: CommandCard['content']['actionMetadata']
) => {
  if (
    source.type !== payload.type ||
    source.score !== payload.score ||
    source.deadlineIso !== payload.deadlineIso
  ) {
    throw new WorkspaceMutationError(422, VALIDATION_MESSAGE);
  }
};

const formatSnoozeLabel = (iso: string): string => iso;

export const createWorkspaceMutationService = ({
  workspaceId,
  snapshot = workspaceFixture,
  now = () => new Date()
}: CreateServiceOptions): WorkspaceMutationService => {
  const initialSnapshot = ensureValidation(workspaceSnapshotSchema, snapshot);
  const clonedSnapshot = cloneSnapshot(initialSnapshot);

  const commands = new Map<string, CommandState>();
  clonedSnapshot.commands.forEach((command) => {
    ensureValidation(commandCardSchema, command);
    commands.set(command.id, { card: command, status: 'open' });
  });

  const followUps = new Map<string, FollowUpState>();
  clonedSnapshot.debrief.followUps.forEach((item) => {
    ensureValidation(followUpSchema, item);
    followUps.set(item.threadId, { item, status: 'waiting' });
  });

  const awaitingReplies = new Map<string, AwaitingReplyState>();
  clonedSnapshot.awaitingReplies.forEach((item) => {
    ensureValidation(awaitingReplySchema, item);
    awaitingReplies.set(item.id, { item, status: 'waiting' });
  });

  const snoozed = new Map<string, SnoozedSnapshot>();
  clonedSnapshot.snoozed.forEach((item) => {
    snoozed.set(item.id, { id: item.id, snoozeUntilLabel: item.snoozeUntilLabel });
  });

  const metrics = {
    actionsResolved: clonedSnapshot.debrief.statistics.today.actionsResolved
  };

  const actionsLog: Array<{ action: string; payload?: Record<string, unknown>; actor?: string }> = [];

  const idempotency = new Map<string, IdempotencyRecord<unknown>>();

  const snoozePayloadSchema = createSnoozePayloadSchema(now);

  const getIdempotencyKey = (resource: string, resourceId: string, key: string) => `${workspaceId}:${resource}:${resourceId}:${key}`;

  const storeResult = <T>(identifier: string, result: T): T => {
    idempotency.set(identifier, { result });
    return result;
  };

  return {
    completeCommand: ({ workspaceId: providedWorkspaceId, commandId, payload, idempotencyKey }) => {
      assertWorkspaceMatches(workspaceId, providedWorkspaceId);

      const validatedKey = ensureValidation(idempotencyKeySchema, idempotencyKey);
      const memoKey = getIdempotencyKey('command.complete', commandId, validatedKey);
      const cached = idempotency.get(memoKey) as IdempotencyRecord<CompleteCommandResult> | undefined;
      if (cached) {
        return cached.result;
      }

      const commandState = commands.get(commandId);
      if (!commandState) {
        throw new WorkspaceMutationError(404, NOT_FOUND_MESSAGE);
      }

      if (commandState.status === 'resolved') {
        throw new WorkspaceMutationError(409, CONFLICT_MESSAGE);
      }

      const parsedPayload = ensureValidation(completeCommandPayloadSchema, payload);
      ensureMetadataConsistency(commandState.card.content.actionMetadata, parsedPayload.actionMetadata);

      commandState.status = 'resolved';
      commandState.completedAtIso = parsedPayload.completedAtIso;
      commandState.note = parsedPayload.note;
      metrics.actionsResolved += 1;

      actionsLog.push({ action: 'complete', actor: 'dashboard' });

      const result: CompleteCommandResult = {
        command: { id: commandId, status: 'resolved' },
        debrief: {
          statistics: {
            today: {
              actionsResolved: metrics.actionsResolved
            }
          }
        }
      };

      return storeResult(memoKey, result);
    },

    nudgeFollowUp: ({ workspaceId: providedWorkspaceId, threadId, payload, idempotencyKey }) => {
      assertWorkspaceMatches(workspaceId, providedWorkspaceId);

      const validatedKey = ensureValidation(idempotencyKeySchema, idempotencyKey);
      const memoKey = getIdempotencyKey('followUp.nudge', threadId, validatedKey);
      const cached = idempotency.get(memoKey) as IdempotencyRecord<NudgeFollowUpResult> | undefined;
      if (cached) {
        return cached.result;
      }

      const followUpState = followUps.get(threadId);
      if (!followUpState) {
        throw new WorkspaceMutationError(404, NOT_FOUND_MESSAGE);
      }

      if (followUpState.status === 'nudged') {
        throw new WorkspaceMutationError(409, CONFLICT_MESSAGE);
      }

      const parsedPayload = ensureValidation(nudgeFollowUpPayloadSchema, payload);

      const nudgedAtIso = now().toISOString();
      followUpState.status = 'nudged';
      followUpState.nudgedAtIso = nudgedAtIso;
      followUpState.reminderChannel = parsedPayload.reminderChannel;
      followUpState.message = parsedPayload.message;

      actionsLog.push({ action: 'nudge', payload: { channel: parsedPayload.reminderChannel } });

      const result: NudgeFollowUpResult = {
        followUp: { threadId, nudgedAtIso }
      };

      return storeResult(memoKey, result);
    },

    snoozeAwaitingReply: ({ workspaceId: providedWorkspaceId, awaitingReplyId, payload, idempotencyKey }) => {
      assertWorkspaceMatches(workspaceId, providedWorkspaceId);

      const validatedKey = ensureValidation(idempotencyKeySchema, idempotencyKey);
      const memoKey = getIdempotencyKey('awaitingReply.snooze', awaitingReplyId, validatedKey);
      const cached = idempotency.get(memoKey) as IdempotencyRecord<SnoozeAwaitingReplyResult> | undefined;
      if (cached) {
        return cached.result;
      }

      const awaitingState = awaitingReplies.get(awaitingReplyId);
      if (!awaitingState) {
        throw new WorkspaceMutationError(404, NOT_FOUND_MESSAGE);
      }

      if (awaitingState.status === 'snoozed') {
        throw new WorkspaceMutationError(409, CONFLICT_MESSAGE);
      }

      const parsedPayload = ensureValidation(snoozePayloadSchema, payload);

      awaitingState.status = 'snoozed';
      awaitingState.snoozeUntilIso = parsedPayload.snoozeUntilIso;
      awaitingState.reason = parsedPayload.reason;

      const snoozeUntilLabel = formatSnoozeLabel(parsedPayload.snoozeUntilIso);
      snoozed.set(awaitingReplyId, { id: awaitingReplyId, snoozeUntilLabel });

      actionsLog.push({ action: 'snooze', payload: { until: parsedPayload.snoozeUntilIso } });

      const result: SnoozeAwaitingReplyResult = {
        awaitingReply: {
          id: awaitingReplyId,
          status: 'snoozed',
          snoozeUntilIso: parsedPayload.snoozeUntilIso
        },
        snoozed: Array.from(snoozed.values()).filter((item) => item.id === awaitingReplyId)
      };

      return storeResult(memoKey, result);
    }
  };
};
