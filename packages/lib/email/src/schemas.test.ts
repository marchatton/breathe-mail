import { describe, expect, it } from 'vitest';
import { workspaceSnapshotSchema } from './schemas';
import { workspaceFixture } from './fixtures';

describe('workspaceSnapshotSchema', () => {
  it('accepts the provided fixture', () => {
    const result = workspaceSnapshotSchema.safeParse(workspaceFixture);
    expect(result.success).toBe(true);
  });

  it('rejects invalid action scores', () => {
    const invalid = {
      ...workspaceFixture,
      commands: workspaceFixture.commands.map((command, index) =>
        index === 0
          ? {
              ...command,
              content: {
                ...command.content,
                actionMetadata: {
                  ...command.content.actionMetadata,
                  score: 150
                }
              }
            }
          : command
      )
    };

    const result = workspaceSnapshotSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
