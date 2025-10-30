import { workspaceSnapshotSchema } from './schemas';

export const workspaceFixture = workspaceSnapshotSchema.parse({
  commands: [
    {
      id: 'cmd_2025_01_23_001',
      gmailThreadId: '18d4f2c8a1b9e3f7',
      content: {
        sender: {
          name: 'Sarah Chen',
          email: 'sarah@acme.com',
          avatarUrl: 'https://i.pravatar.cc/150?img=1',
          verificationBadge: true
        },
        subject: 'Q4 Budget Approval Required',
        preview:
          "The revised Q4 budget allocation needs your approval by EOD. The finance team has reviewed all departments and we're ready to proceed.",
        actionMetadata: {
          type: 'approve',
          score: 92,
          deadlineIso: '2025-01-23T17:00:00Z'
        },
        threadContext: {
          messageCount: 7,
          participants: 3,
          lastActivity: '12m ago'
        },
        tags: ['Finance', 'Approval']
      }
    },
    {
      id: 'cmd_2025_01_23_002',
      gmailThreadId: '18d4f2c8a1b9e3f8',
      content: {
        sender: {
          name: 'Marcus Johnson',
          email: 'marcus@partner.co',
          avatarUrl: 'https://i.pravatar.cc/150?img=12'
        },
        subject: 'Partnership Proposal Review',
        preview:
          "Following up on our partnership discussion. I've attached the updated proposal with the revised terms.",
        actionMetadata: {
          type: 'review',
          score: 78,
          deadlineIso: '2025-01-24T12:00:00Z'
        },
        threadContext: {
          messageCount: 4,
          participants: 2,
          lastActivity: '2h ago'
        },
        tags: ['Partnership']
      }
    },
    {
      id: 'cmd_2025_01_23_003',
      gmailThreadId: '18d4f2c8a1b9e3f9',
      content: {
        sender: {
          name: 'Emily Rodriguez',
          email: 'emily@client.com',
          avatarUrl: 'https://i.pravatar.cc/150?img=5'
        },
        subject: 'Project Timeline Update',
        preview:
          'Quick update on the project milestones. We need to discuss the delivery schedule for Q2.',
        actionMetadata: {
          type: 'respond',
          score: 65,
          deadlineIso: '2025-01-25T10:00:00Z'
        },
        threadContext: {
          messageCount: 2,
          participants: 2,
          lastActivity: '5h ago'
        },
        tags: ['Project']
      }
    }
  ],
  insights: [
    {
      id: 'insight_001',
      title: 'Weekly AI Roundup',
      summary:
        "Summaries from 3 sources covering the latest in AI development. Key developments include xAI's new model release and ongoing ethics debates in the AI community.",
      highlights: [
        "xAI's Grok 2.0 shows 40% improvement in reasoning tasks",
        'EU finalizes AI Act implementation guidelines',
        'OpenAI announces partnership with major healthcare provider'
      ],
      source: 'MIT Technology Review, The Verge, TechCrunch',
      isNew: true
    },
    {
      id: 'insight_002',
      title: 'Productivity Tools Digest',
      summary:
        'Curated insights on the latest productivity tools and techniques from industry leaders. Focus on async communication and deep work strategies.',
      highlights: [
        'New study shows 4-day work week increases productivity by 23%',
        'Top 5 tools for remote team collaboration in 2025',
        'Cal Newport discusses digital minimalism strategies'
      ],
      source: 'Harvard Business Review, Hacker News',
      isNew: false
    }
  ],
  calendar: [
    {
      id: 'event_001',
      title: 'AI Governance Briefing',
      time: 'Today 2:00 PM',
      duration: '45 minutes',
      type: 'event',
      location: 'Board Room',
      attendees: 6
    },
    {
      id: 'event_002',
      title: 'Finance Deadline',
      time: 'Tomorrow 9:00 AM',
      duration: 'All day',
      type: 'deadline',
      location: null,
      attendees: null
    }
  ],
  debrief: {
    statistics: {
      today: {
        actionsResolved: 7,
        criticalHandled: 2,
        averageResponseTime: '6m 12s',
        focusScore: 0.78
      }
    },
    followUps: [
      {
        threadId: 'fu_001',
        subject: 'Re: Partnership Proposal',
        waitingSinceIso: '2025-01-22T15:30:00Z',
        waitingSinceLabel: '1 day ago',
        recipient: 'alex@partner.co',
        urgency: 'medium'
      },
      {
        threadId: 'fu_002',
        subject: 'Contract Review Status',
        waitingSinceIso: '2025-01-23T09:00:00Z',
        waitingSinceLabel: '8 hours ago',
        recipient: 'legal@company.com',
        urgency: 'high'
      }
    ]
  },
  snoozed: [
    {
      id: 'snooze_001',
      gmailThreadId: '18d4f2c8a1b9e3f1',
      sender: {
        name: 'David Park',
        email: 'david@tech.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=15'
      },
      subject: 'Follow-up: Product Roadmap Discussion',
      snoozeUntilLabel: 'Tomorrow 9:00 AM',
      snoozeUntilIso: '2025-01-24T09:00:00Z',
      tags: ['Product', 'Roadmap']
    }
  ],
  awaitingReplies: [
    {
      id: 'await_001',
      gmailThreadId: '18d4f2c8a1b9e3f4',
      email: 'alex@startup.co',
      subject: 'Re: Investment opportunity',
      lastSentLabel: 'Monday',
      daysWaiting: 3,
      tags: ['Investment']
    }
  ]
});

export type WorkspaceFixture = typeof workspaceFixture;
