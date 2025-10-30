import { z } from 'zod';

export const emailSenderSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
  verificationBadge: z.boolean().default(false)
});

export type EmailSender = z.infer<typeof emailSenderSchema>;

export const actionMetadataSchema = z.object({
  type: z.enum(['approve', 'review', 'respond', 'delegate', 'schedule']),
  score: z.number().min(0).max(100),
  deadlineIso: z.string().datetime().nullable()
});

export type ActionMetadata = z.infer<typeof actionMetadataSchema>;

export const threadContextSchema = z.object({
  messageCount: z.number().int().min(0),
  participants: z.number().int().min(1),
  lastActivity: z.string()
});

export type ThreadContext = z.infer<typeof threadContextSchema>;

export const commandCardSchema = z.object({
  id: z.string(),
  gmailThreadId: z.string(),
  content: z.object({
    sender: emailSenderSchema,
    subject: z.string(),
    preview: z.string(),
    actionMetadata: actionMetadataSchema,
    threadContext: threadContextSchema,
    tags: z.array(z.string())
  })
});

export type CommandCard = z.infer<typeof commandCardSchema>;

export const insightSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  source: z.string(),
  isNew: z.boolean()
});

export type Insight = z.infer<typeof insightSchema>;

export const calendarItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  time: z.string(),
  duration: z.string(),
  type: z.enum(['event', 'deadline']),
  location: z.string().nullable(),
  attendees: z.number().int().nullable()
});

export type CalendarItem = z.infer<typeof calendarItemSchema>;

export const followUpSchema = z.object({
  threadId: z.string(),
  subject: z.string(),
  waitingSinceIso: z.string().datetime(),
  waitingSinceLabel: z.string(),
  recipient: z.string().email(),
  urgency: z.enum(['low', 'medium', 'high'])
});

export type FollowUp = z.infer<typeof followUpSchema>;

export const timelineStatsSchema = z.object({
  actionsResolved: z.number().int(),
  criticalHandled: z.number().int(),
  averageResponseTime: z.string(),
  focusScore: z.number().min(0).max(1)
});

export type TimelineStats = z.infer<typeof timelineStatsSchema>;

export const debriefSnapshotSchema = z.object({
  statistics: z.object({
    today: timelineStatsSchema
  }),
  followUps: z.array(followUpSchema)
});

export type DebriefSnapshot = z.infer<typeof debriefSnapshotSchema>;

export const snoozedItemSchema = z.object({
  id: z.string(),
  gmailThreadId: z.string(),
  sender: emailSenderSchema.pick({ name: true, email: true, avatarUrl: true }),
  subject: z.string(),
  snoozeUntilLabel: z.string(),
  snoozeUntilIso: z.string().datetime(),
  tags: z.array(z.string())
});

export type SnoozedItem = z.infer<typeof snoozedItemSchema>;

export const awaitingReplySchema = z.object({
  id: z.string(),
  gmailThreadId: z.string(),
  email: z.string().email(),
  subject: z.string(),
  lastSentLabel: z.string(),
  daysWaiting: z.number().int().min(0),
  tags: z.array(z.string())
});

export type AwaitingReply = z.infer<typeof awaitingReplySchema>;

export const workspaceSnapshotSchema = z.object({
  commands: z.array(commandCardSchema),
  insights: z.array(insightSchema),
  calendar: z.array(calendarItemSchema),
  debrief: debriefSnapshotSchema,
  snoozed: z.array(snoozedItemSchema),
  awaitingReplies: z.array(awaitingReplySchema)
});

export type WorkspaceSnapshot = z.infer<typeof workspaceSnapshotSchema>;
