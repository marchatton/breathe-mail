export const mockCommandCards = [{
  id: 'cmd_2025_01_23_001',
  gmail_thread_id: '18d4f2c8a1b9e3f7',
  content: {
    sender: {
      name: 'Sarah Chen',
      email: 'sarah@acme.com',
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      verification_badge: true
    },
    subject: 'Q4 Budget Approval Required',
    preview: "The revised Q4 budget allocation needs your approval by EOD. The finance team has reviewed all departments and we're ready to proceed.",
    action_metadata: {
      type: 'approve',
      score: 92,
      deadline_iso: '2025-01-23T17:00:00Z'
    },
    thread_context: {
      message_count: 7,
      participants: 3,
      last_activity: '12m ago'
    },
    tags: ['Finance', 'Approval']
  }
}, {
  id: 'cmd_2025_01_23_002',
  gmail_thread_id: '18d4f2c8a1b9e3f8',
  content: {
    sender: {
      name: 'Marcus Johnson',
      email: 'marcus@partner.co',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
      verification_badge: false
    },
    subject: 'Partnership Proposal Review',
    preview: "Following up on our partnership discussion. I've attached the updated proposal with the revised terms.",
    action_metadata: {
      type: 'review',
      score: 78,
      deadline_iso: '2025-01-24T12:00:00Z'
    },
    thread_context: {
      message_count: 4,
      participants: 2,
      last_activity: '2h ago'
    },
    tags: ['Partnership']
  }
}, {
  id: 'cmd_2025_01_23_003',
  gmail_thread_id: '18d4f2c8a1b9e3f9',
  content: {
    sender: {
      name: 'Emily Rodriguez',
      email: 'emily@client.com',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      verification_badge: false
    },
    subject: 'Project Timeline Update',
    preview: 'Quick update on the project milestones. We need to discuss the delivery schedule for Q2.',
    action_metadata: {
      type: 'respond',
      score: 65,
      deadline_iso: '2025-01-25T10:00:00Z'
    },
    thread_context: {
      message_count: 2,
      participants: 2,
      last_activity: '5h ago'
    },
    tags: ['Project']
  }
}, {
  id: 'cmd_2025_01_23_004',
  gmail_thread_id: '18d4f2c8a1b9e3f0',
  content: {
    sender: {
      name: 'Alex Kim',
      email: 'alex@startup.io',
      avatar_url: 'https://i.pravatar.cc/150?img=8',
      verification_badge: false
    },
    subject: 'Weekly Team Sync',
    preview: 'Reminder about our weekly sync tomorrow at 10am. Please review the agenda.',
    action_metadata: {
      type: 'respond',
      score: 45,
      deadline_iso: '2025-01-26T10:00:00Z'
    },
    thread_context: {
      message_count: 1,
      participants: 1,
      last_activity: '1d ago'
    },
    tags: ['Team', 'Meeting']
  }
}];
export const mockInsights = [{
  id: 'insight_001',
  title: 'Weekly AI Roundup',
  summary: "Summaries from 3 sources covering the latest in AI development. Key developments include xAI's new model release and ongoing ethics debates in the AI community.",
  highlights: ["xAI's Grok 2.0 shows 40% improvement in reasoning tasks", 'EU finalizes AI Act implementation guidelines', 'OpenAI announces partnership with major healthcare provider'],
  source: 'MIT Technology Review, The Verge, TechCrunch',
  isNew: true
}, {
  id: 'insight_002',
  title: 'Productivity Tools Digest',
  summary: 'Curated insights on the latest productivity tools and techniques from industry leaders. Focus on async communication and deep work strategies.',
  highlights: ['New study shows 4-day work week increases productivity by 23%', 'Top 5 tools for remote team collaboration in 2025', 'Cal Newport discusses digital minimalism strategies'],
  source: 'Harvard Business Review, Hacker News',
  isNew: false
}, {
  id: 'insight_003',
  title: 'Design Trends 2025',
  summary: 'Emerging design patterns and user experience trends shaping digital products. Analysis of successful redesigns and user behavior studies.',
  highlights: ['Minimalist interfaces see 35% higher engagement', 'Dark mode adoption reaches 70% across major platforms', 'Micro-interactions improve perceived performance'],
  source: 'Smashing Magazine, Nielsen Norman Group',
  isNew: true
}];
export const mockSerendipity = [{
  id: 'seren_001',
  title: 'Hackathon Meetup: AI & Productivity',
  category: 'Event',
  teaser: 'Local hackathon focused on building AI-powered productivity tools. Matches your interests in email automation and workflow optimization.',
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  relevanceScore: 87
}, {
  id: 'seren_002',
  title: 'Research Paper: Email Behavior Patterns',
  category: 'Research',
  teaser: 'Stanford study on email management strategies and their impact on productivity. Includes data-driven insights on optimal response times.',
  image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80',
  relevanceScore: 92
}, {
  id: 'seren_003',
  title: 'Podcast: The Future of Communication',
  category: 'Media',
  teaser: 'Interview with leading experts on async communication and the evolution of email. Features discussion on AI assistants and automation.',
  image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
  relevanceScore: 78
}];
export const mockDeflection = {
  clusters: [{
    id: 'deflect_001',
    category: 'Promotions',
    count: 47,
    preview: 'Marketing emails, sales offers, product announcements'
  }, {
    id: 'deflect_002',
    category: 'Social',
    count: 23,
    preview: 'LinkedIn updates, Twitter notifications, Facebook alerts'
  }, {
    id: 'deflect_003',
    category: 'Updates',
    count: 15,
    preview: 'App notifications, service updates, changelog emails'
  }, {
    id: 'deflect_004',
    category: 'Forums',
    count: 8,
    preview: 'Discussion threads, forum replies, community posts'
  }]
};
export const mockEmailSummaries = [{
  thread_id: 'sum_001',
  gmail_thread_id: '18d4f2c8a1b9e3f1',
  subject: 'Marketing Campaign Discussion',
  participants: ['Alex Kim', 'Jordan Lee', 'Taylor Swift'],
  message_count: 8,
  summary: 'Team discussing Q1 marketing campaign strategy. Main focus on social media budget allocation and influencer partnerships. Decision needed on Instagram vs TikTok spend.',
  tags: ['Marketing', 'Campaign']
}, {
  thread_id: 'sum_002',
  gmail_thread_id: '18d4f2c8a1b9e3f2',
  subject: 'Engineering Standup Notes',
  participants: ['Dev Team', 'Product Manager'],
  message_count: 5,
  summary: 'Daily standup summary covering sprint progress. Backend API integration completed, frontend components in review. Blocker on authentication flow resolved.',
  tags: ['Engineering', 'Standup']
}, {
  thread_id: 'sum_003',
  gmail_thread_id: '18d4f2c8a1b9e3f3',
  subject: 'Client Feedback Thread',
  participants: ['Jessica Brown', 'Support Team'],
  message_count: 12,
  summary: 'Client requesting feature enhancements for dashboard. Positive feedback on recent updates. Follow-up meeting scheduled for detailed requirements gathering.',
  tags: ['Client', 'Feedback']
}];
export const mockNewsletters = [{
  item_id: 'news_001',
  source: {
    publication: 'MIT Technology Review',
    author: 'Will Douglas Heaven',
    credibility_score: 0.94
  },
  content: {
    headline: "OpenAI's O3 Achieves Breakthrough in Mathematical Reasoning",
    hero_image: {
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      alt: 'Abstract visualization of neural pathways'
    },
    summary: "OpenAI's latest O3 model demonstrates unprecedented performance on mathematical reasoning tasks, achieving 89% accuracy on International Math Olympiad problems. The new chain-of-thought reasoning approach reduces hallucination by 60%, though compute requirements remain significantly higher than GPT-4.",
    primary_link: {
      url: 'https://www.technologyreview.com/',
      cta_text: 'Read full analysis',
      reading_time_minutes: 8
    }
  }
}, {
  item_id: 'news_002',
  source: {
    publication: 'The Verge',
    author: 'James Vincent',
    credibility_score: 0.88
  },
  content: {
    headline: 'Apple Vision Pro Sales Exceed Expectations in Q1',
    hero_image: {
      url: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80',
      alt: 'Virtual reality headset'
    },
    summary: 'Apple Vision Pro reaches 500,000 units sold globally in its first quarter, driven primarily by enterprise adoption. Companies are using the device for training, design visualization, and remote collaboration. Apple announces new developer tools for spatial computing applications.',
    primary_link: {
      url: 'https://www.theverge.com/',
      cta_text: 'Read article',
      reading_time_minutes: 5
    }
  }
}, {
  item_id: 'news_003',
  source: {
    publication: 'TechCrunch',
    author: 'Sarah Perez',
    credibility_score: 0.85
  },
  content: {
    headline: 'Startup Funding Rebounds with $45B in Q4 Investments',
    hero_image: {
      url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
      alt: 'Business meeting'
    },
    summary: 'Venture capital activity shows strong recovery with $45 billion invested across 2,100 deals in Q4 2024. AI and healthcare sectors lead funding rounds. Late-stage valuations stabilizing after 2023 correction, signaling renewed investor confidence.',
    primary_link: {
      url: 'https://techcrunch.com/',
      cta_text: 'View full report',
      reading_time_minutes: 6
    }
  }
}];
export const mockCalendarEvents = [{
  id: 'event_001',
  title: 'Team Standup',
  time: '9:00 AM',
  duration: '15 min',
  type: 'meeting',
  location: 'Zoom',
  attendees: 8
}, {
  id: 'event_002',
  title: 'Q4 Budget Review',
  time: '2:00 PM',
  duration: '1 hour',
  type: 'meeting',
  location: 'Conference Room A',
  attendees: 5
}, {
  id: 'event_003',
  title: 'Project Proposal Deadline',
  time: '5:00 PM',
  duration: 'All day',
  type: 'deadline',
  location: null,
  attendees: null
}, {
  id: 'event_004',
  title: 'Design Workshop',
  time: 'Tomorrow 10:00 AM',
  duration: '2 hours',
  type: 'event',
  location: 'Design Studio',
  attendees: 12
}];
export const mockDebriefData = {
  statistics: {
    today: {
      actions_resolved: 7,
      critical_handled: 2,
      avg_response_time: '6m 12s',
      focus_score: 0.78
    }
  },
  follow_ups: [{
    thread_id: 'fu_001',
    subject: 'Re: Partnership Proposal',
    waiting_since: '2025-01-22T15:30:00Z',
    waiting_since_formatted: '1 day ago',
    recipient: 'alex@partner.co',
    urgency: 'medium'
  }, {
    thread_id: 'fu_002',
    subject: 'Contract Review Status',
    waiting_since: '2025-01-23T09:00:00Z',
    waiting_since_formatted: '8 hours ago',
    recipient: 'legal@company.com',
    urgency: 'high'
  }, {
    thread_id: 'fu_003',
    subject: 'Design Feedback Request',
    waiting_since: '2025-01-23T14:00:00Z',
    waiting_since_formatted: '3 hours ago',
    recipient: 'design@agency.com',
    urgency: 'low'
  }]
};
export const mockWildcards = [{
  id: 'wild_001',
  category: 'Event',
  subject: 'Local AI Meetup - Jan 25',
  reason: 'This event matches your interest in AI and productivity tools. The speaker lineup includes experts in email automation.',
  preview: 'Join us for an evening of AI discussions. Topics include LLM applications, automation workflows, and productivity hacks.',
  sourceCategory: 'Promotions'
}, {
  id: 'wild_002',
  category: 'Research',
  subject: 'New study on email response patterns',
  reason: 'Academic research relevant to your work on email management. Includes data on optimal response times and user behavior.',
  preview: 'Stanford researchers analyzed 10M emails to understand response patterns. Key findings on urgency detection and prioritization strategies.',
  sourceCategory: 'Updates'
}, {
  id: 'wild_003',
  category: 'Opportunity',
  subject: 'Beta access: New productivity tool',
  reason: 'Early access to a tool that complements your workflow. Limited spots available for users in your field.',
  preview: 'We are offering beta access to our new email intelligence platform. Features include smart bundling and AI-powered summaries.',
  sourceCategory: 'Promotions'
}];
export const mockSnoozedItems = [{
  id: 'snooze_001',
  gmail_thread_id: '18d4f2c8a1b9e3f1',
  sender: {
    name: 'David Park',
    email: 'david@tech.com',
    avatar_url: 'https://i.pravatar.cc/150?img=15'
  },
  subject: 'Follow-up: Product Roadmap Discussion',
  snoozeUntil: 'Tomorrow 9:00 AM',
  snoozeUntilISO: '2025-01-24T09:00:00Z',
  tags: ['Product', 'Roadmap']
}, {
  id: 'snooze_002',
  gmail_thread_id: '18d4f2c8a1b9e3f2',
  sender: {
    name: 'Rachel Green',
    email: 'rachel@sales.com',
    avatar_url: 'https://i.pravatar.cc/150?img=25'
  },
  subject: 'Client proposal needs review',
  snoozeUntil: 'Next Monday',
  snoozeUntilISO: '2025-01-27T09:00:00Z',
  tags: ['Client', 'Proposal']
}, {
  id: 'snooze_003',
  gmail_thread_id: '18d4f2c8a1b9e3f3',
  sender: {
    name: 'Tom Wilson',
    email: 'tom@partners.io',
    avatar_url: 'https://i.pravatar.cc/150?img=33'
  },
  subject: 'Partnership terms update',
  snoozeUntil: 'Friday 2:00 PM',
  snoozeUntilISO: '2025-01-24T14:00:00Z',
  tags: ['Partnership', 'Legal']
}];
export const mockAwaitingReplies = [{
  id: 'await_001',
  gmail_thread_id: '18d4f2c8a1b9e3f4',
  email: 'alex@startup.co',
  subject: 'Re: Investment opportunity',
  lastSent: 'Monday',
  daysWaiting: 3,
  tags: ['Investment']
}, {
  id: 'await_002',
  gmail_thread_id: '18d4f2c8a1b9e3f5',
  email: 'maria@consulting.com',
  subject: 'Re: Project timeline',
  lastSent: 'Last week',
  daysWaiting: 5,
  tags: ['Project', 'Timeline']
}];