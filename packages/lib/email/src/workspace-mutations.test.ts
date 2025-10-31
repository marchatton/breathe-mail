import { describe, expect, it } from 'vitest';
import {
  createWorkspaceMutationService,
  WorkspaceMutationError
} from './workspace-mutations';
import { workspaceFixture } from './fixtures';

describe('workspace mutations', () => {
  const command = workspaceFixture.commands[0];
  const followUp = workspaceFixture.debrief.followUps[0];
  const awaitingReply = workspaceFixture.awaitingReplies[0];
  const workspaceId = 'ws-1';
  const nowIso = '2025-01-10T14:25:00.000Z';

  const createService = () =>
    createWorkspaceMutationService({
      workspaceId,
      snapshot: workspaceFixture,
      now: () => new Date(nowIso)
    });

  describe('completeCommand', () => {
    it('resolves a command, bumps metrics, and logs idempotently', () => {
      const service = createService();

      const result = service.completeCommand({
        workspaceId,
        commandId: command.id,
        payload: {
          actionMetadata: command.content.actionMetadata,
          completedAtIso: nowIso,
          note: 'Paid via Stripe'
        },
        idempotencyKey: '1f1f0a9c-8a1f-4e66-9b57-7d5f596b2f5a'
      });

      expect(result).toEqual({
        command: { id: command.id, status: 'resolved' },
        debrief: {
          statistics: {
            today: {
              actionsResolved: workspaceFixture.debrief.statistics.today.actionsResolved + 1
            }
          }
        }
      });

      // Same key replays prior result without throwing.
      const replay = service.completeCommand({
        workspaceId,
        commandId: command.id,
        payload: {
          actionMetadata: command.content.actionMetadata,
          completedAtIso: nowIso,
          note: 'Paid via Stripe'
        },
        idempotencyKey: '1f1f0a9c-8a1f-4e66-9b57-7d5f596b2f5a'
      });

      expect(replay).toEqual(result);
    });

    it('throws 404 when the command cannot be found', () => {
      const service = createService();

      expect(() =>
        service.completeCommand({
          workspaceId,
          commandId: 'missing',
          payload: {
            actionMetadata: command.content.actionMetadata,
            completedAtIso: nowIso,
            note: 'Test'
          },
          idempotencyKey: 'a46c02d5-73db-41de-a2d4-87ce6a9cb0df'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 404
      }));
    });

    it('throws 409 when the command is already resolved under a new key', () => {
      const service = createService();

      service.completeCommand({
        workspaceId,
        commandId: command.id,
        payload: {
          actionMetadata: command.content.actionMetadata,
          completedAtIso: nowIso,
          note: 'Paid via Stripe'
        },
        idempotencyKey: '1f1f0a9c-8a1f-4e66-9b57-7d5f596b2f5a'
      });

      expect(() =>
        service.completeCommand({
          workspaceId,
          commandId: command.id,
          payload: {
            actionMetadata: command.content.actionMetadata,
            completedAtIso: nowIso,
            note: 'Paid via Stripe'
          },
          idempotencyKey: '645fdf72-8180-4c08-80ef-8ae372f5fce7'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 409
      }));
    });

    it('throws 422 when payload fails validation', () => {
      const service = createService();

      expect(() =>
        service.completeCommand({
          workspaceId,
          commandId: command.id,
          payload: {
            actionMetadata: command.content.actionMetadata,
            completedAtIso: 'invalid',
            note: ''
          },
          idempotencyKey: '0b9dd2b9-ec0f-402c-8cc0-f80ccab5201d'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 422
      }));
    });
  });

  describe('nudgeFollowUp', () => {
    it('marks the follow-up as nudged and stamps the time', () => {
      const service = createService();

      const result = service.nudgeFollowUp({
        workspaceId,
        threadId: followUp.threadId,
        payload: {
          reminderChannel: 'email',
          message: 'Just checking in on next steps.'
        },
        idempotencyKey: '2dfd3c3f-d3d3-4e44-8a54-1fc50af9f7ef'
      });

      expect(result).toEqual({
        followUp: {
          threadId: followUp.threadId,
          nudgedAtIso: nowIso
        }
      });
    });

    it('returns stored result when the same idempotency key repeats', () => {
      const service = createService();

      const first = service.nudgeFollowUp({
        workspaceId,
        threadId: followUp.threadId,
        payload: {
          reminderChannel: 'email',
          message: 'Just checking in on next steps.'
        },
        idempotencyKey: '2dfd3c3f-d3d3-4e44-8a54-1fc50af9f7ef'
      });

      const replay = service.nudgeFollowUp({
        workspaceId,
        threadId: followUp.threadId,
        payload: {
          reminderChannel: 'email',
          message: 'Just checking in on next steps.'
        },
        idempotencyKey: '2dfd3c3f-d3d3-4e44-8a54-1fc50af9f7ef'
      });

      expect(replay).toEqual(first);
    });

    it('throws 409 if the follow-up was already nudged with a new key', () => {
      const service = createService();

      service.nudgeFollowUp({
        workspaceId,
        threadId: followUp.threadId,
        payload: {
          reminderChannel: 'email',
          message: 'Just checking in on next steps.'
        },
        idempotencyKey: '2dfd3c3f-d3d3-4e44-8a54-1fc50af9f7ef'
      });

      expect(() =>
        service.nudgeFollowUp({
          workspaceId,
          threadId: followUp.threadId,
          payload: {
            reminderChannel: 'email',
            message: 'Another ping'
          },
          idempotencyKey: '1d99a21b-9eaa-4eea-9d9a-6b427fd6326f'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 409
      }));
    });

    it('throws 404 when the follow-up is missing', () => {
      const service = createService();

      expect(() =>
        service.nudgeFollowUp({
          workspaceId,
          threadId: 'missing',
          payload: {
            reminderChannel: 'email',
            message: 'Ping'
          },
          idempotencyKey: '89ff754d-b3a5-4ae7-9f43-5aa98b34d87a'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 404
      }));
    });

    it('throws 422 when payload fails validation', () => {
      const service = createService();

      expect(() =>
        service.nudgeFollowUp({
          workspaceId,
          threadId: followUp.threadId,
          payload: {
            reminderChannel: 'sms' as 'email',
            message: ''
          },
          idempotencyKey: 'a8c6c5b4-1a26-4ef6-8d4b-6fd0b31121c8'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 422
      }));
    });
  });

  describe('snoozeAwaitingReply', () => {
    it('moves the awaiting reply to snoozed with optimistic payload', () => {
      const service = createService();

      const snoozeUntilIso = '2025-01-17T09:00:00.000Z';

      const result = service.snoozeAwaitingReply({
        workspaceId,
        awaitingReplyId: awaitingReply.id,
        payload: {
          snoozeUntilIso,
          reason: 'Waiting for vendor availability'
        },
        idempotencyKey: 'ce0a5745-3f69-4f53-9878-8795a0f6e38d'
      });

      expect(result).toEqual({
        awaitingReply: {
          id: awaitingReply.id,
          status: 'snoozed',
          snoozeUntilIso
        },
        snoozed: [{ id: awaitingReply.id, snoozeUntilLabel: snoozeUntilIso }]
      });
    });

    it('throws 409 when already snoozed with a different key', () => {
      const service = createService();
      const snoozeUntilIso = '2025-01-17T09:00:00.000Z';

      service.snoozeAwaitingReply({
        workspaceId,
        awaitingReplyId: awaitingReply.id,
        payload: {
          snoozeUntilIso,
          reason: 'Waiting for vendor availability'
        },
        idempotencyKey: 'ce0a5745-3f69-4f53-9878-8795a0f6e38d'
      });

      expect(() =>
        service.snoozeAwaitingReply({
          workspaceId,
          awaitingReplyId: awaitingReply.id,
          payload: {
            snoozeUntilIso,
            reason: 'Waiting for vendor availability'
          },
          idempotencyKey: '8a154aef-99c9-4b1f-8d9e-9a7a9f0211c1'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 409
      }));
    });

    it('throws 404 when awaiting reply is missing', () => {
      const service = createService();

      expect(() =>
        service.snoozeAwaitingReply({
          workspaceId,
          awaitingReplyId: 'missing',
          payload: {
            snoozeUntilIso: '2025-01-17T09:00:00.000Z',
            reason: 'Waiting for vendor availability'
          },
          idempotencyKey: '5f98a541-f701-43da-9b6f-4f49caa0f867'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 404
      }));
    });

    it('throws 422 when snooze time is invalid', () => {
      const service = createService();

      expect(() =>
        service.snoozeAwaitingReply({
          workspaceId,
          awaitingReplyId: awaitingReply.id,
          payload: {
            snoozeUntilIso: 'not-a-date',
            reason: ''
          },
          idempotencyKey: 'c4383df5-9a6a-4d61-b255-6258ca77097f'
        })
      ).toThrowError(expect.objectContaining<WorkspaceMutationError>({
        statusCode: 422
      }));
    });
  });
});
