import type { CSSProperties, ReactNode } from 'react';
import { formatDurationMinutes, formatRelativeTime, workspaceFixture } from '@breathe-mail/email';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400';
const interactiveCardBase =
  `${focusRing} relative block w-full rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 text-left shadow-sm transition-[transform,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-slate-900/80 motion-reduce:transition-none`;

const safeAreaStyle: CSSProperties = {
  paddingTop: 'calc(2.5rem + env(safe-area-inset-top, 0px))',
  paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
};

const skipLinkClasses =
  'sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-brand-500 focus-visible:px-4 focus-visible:py-2 focus-visible:text-white';

const numberFormatter = new Intl.NumberFormat('en-US');
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0
});

const commandUrgency = (score: number): { label: string; tone: string } => {
  if (score >= 85) {
    return { label: 'High urgency', tone: 'bg-rose-400/80' };
  }
  if (score >= 70) {
    return { label: 'Medium urgency', tone: 'bg-amber-300/80' };
  }
  return { label: 'Low urgency', tone: 'bg-emerald-300/80' };
};

const followUpTone: Record<string, string> = {
  high: 'bg-rose-400/80',
  medium: 'bg-amber-300/80',
  low: 'bg-emerald-300/80'
};

function Section({
  id,
  title,
  description,
  children
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={headingId}
      className="scroll-mt-32 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm"
      id={id}
      role="region"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-100" id={headingId}>
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-slate-400" id={descriptionId}>
            {description}
          </p>
        ) : null}
      </header>
      <div className="space-y-3 text-sm text-slate-300">{children}</div>
    </section>
  );
}

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
      <div className="h-4 w-3/4 rounded bg-slate-700/50" />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-3 w-full rounded bg-slate-800/50" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const snapshot = workspaceFixture;
  const now = new Date();
  const isLoading = false;

  const stats = snapshot.debrief.statistics.today;
  const responseMinutes = (() => {
    const matchMinutes = stats.averageResponseTime.match(/(\d+)m/);
    const matchSeconds = stats.averageResponseTime.match(/(\d+)s/);
    const minutes = matchMinutes ? Number(matchMinutes[1]) : 0;
    const seconds = matchSeconds ? Number(matchSeconds[1]) : 0;
    return minutes + Math.round(seconds / 60);
  })();

  return (
    <>
      <a className={skipLinkClasses} href="#dashboard-main">
        Skip to main content
      </a>
      <main
        aria-live="polite"
        className="safe-area-container mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:px-10"
        id="dashboard-main"
        role="main"
        style={safeAreaStyle}
        tabIndex={-1}
      >
        <div aria-live="polite" className="sr-only" data-slot="dashboard-optimistic-messages" />

        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-brand-300">Breathe Mail</p>
          <h1 className="text-3xl font-bold text-slate-50">Command Center</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Typed fixtures showcase how actions, insights, and timeline data flow through the refactored workspace.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Section
            description="High-impact threads awaiting a decision or response."
            id="priority-actions"
            title="Priority Actions"
          >
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : (
              <ul aria-live="polite" className="space-y-3">
                {snapshot.commands.map((command) => {
                  const deadlineLabel = formatRelativeTime(now, command.content.actionMetadata.deadlineIso);
                  const urgency = commandUrgency(command.content.actionMetadata.score);

                  return (
                    <li key={command.id}>
                      <button
                        aria-label={`Review ${command.content.subject} from ${command.content.sender.name}`}
                        className={`${interactiveCardBase} min-h-[3.5rem]`}
                        type="button"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-100">{command.content.subject}</p>
                            <p className="text-xs text-slate-400">{command.content.sender.name}</p>
                          </div>
                          <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
                            {command.content.actionMetadata.type}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{command.content.preview}</p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-2 text-slate-200">
                            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${urgency.tone}`} />
                            <span className="font-semibold">{urgency.label}</span>
                          </span>
                          <span>Due {deadlineLabel}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section
            description="Recent summaries surfaced for your workspace."
            id="insights"
            title="Insights"
          >
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <SkeletonCard key={index} lines={2} />
                ))}
              </div>
            ) : (
              <ul className="space-y-3">
                {snapshot.insights.map((insight) => (
                  <li key={insight.id} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{insight.title}</span>
                      {insight.isNew ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{insight.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            description="Snapshot of throughput and outstanding follow ups."
            id="today"
            title="Today"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stats</h3>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-200 sm:grid-cols-4">
                  {[
                    {
                      id: 'actions-resolved',
                      label: 'Actions resolved',
                      value: numberFormatter.format(stats.actionsResolved)
                    },
                    {
                      id: 'critical-handled',
                      label: 'Critical handled',
                      value: numberFormatter.format(stats.criticalHandled)
                    },
                    {
                      id: 'average-response',
                      label: 'Avg response',
                      value: formatDurationMinutes(responseMinutes)
                    },
                    {
                      id: 'focus-score',
                      label: 'Focus score',
                      value: percentFormatter.format(stats.focusScore)
                    }
                  ].map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                      <dt className="text-xs uppercase tracking-wide text-slate-400" id={`stat-${item.id}`}>
                        {item.label}
                      </dt>
                      <dd
                        aria-describedby={`stat-${item.id}`}
                        className="mt-2 text-lg font-semibold tabular-nums text-slate-50"
                      >
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div
                aria-labelledby="follow-ups-region-heading"
                aria-live="polite"
                className="space-y-3"
                id="follow-ups"
                role="region"
              >
                <h3
                  className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                  id="follow-ups-region-heading"
                >
                  Follow ups
                </h3>
                <ul className="space-y-2">
                  {isLoading
                    ? Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={index} lines={2} />)
                    : snapshot.debrief.followUps.map((followUp) => (
                        <li key={followUp.threadId}>
                          <button
                            aria-label={`Open follow up ${followUp.subject} for ${followUp.recipient}`}
                            className={`${interactiveCardBase} min-h-[3.5rem]`}
                            type="button"
                          >
                            <p className="text-sm font-medium text-slate-100">{followUp.subject}</p>
                            <p className="mt-1 text-xs text-slate-400">{followUp.recipient}</p>
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                              <span>Waiting {formatRelativeTime(now, followUp.waitingSinceIso)}</span>
                              <span className="inline-flex items-center gap-2 text-slate-200">
                                <span
                                  aria-hidden
                                  className={`h-2 w-2 rounded-full ${followUpTone[followUp.urgency] ?? 'bg-slate-500'}`}
                                />
                                <span className="capitalize">{followUp.urgency} priority</span>
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                </ul>
              </div>
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section
            description="Upcoming meetings and deadlines."
            id="calendar"
            title="Calendar"
          >
            <ul className="space-y-3">
              {(isLoading ? Array.from({ length: 2 }) : snapshot.calendar).map((item, index) => {
                if (isLoading) {
                  return <SkeletonCard key={index} lines={2} />;
                }

                const durationMatch = item.duration.match(/(\d+)\s+minutes?/i);
                const formattedDuration = durationMatch
                  ? formatDurationMinutes(Number(durationMatch[1]))
                  : item.duration;

                return (
                  <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-slate-100">{item.title}</span>
                      <span className="text-slate-400">{item.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.type === 'deadline' ? 'Deadline' : 'Meeting'} · {formattedDuration}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section
            description="Threads scheduled to return to focus."
            id="snoozed"
            title="Snoozed"
          >
            <ul aria-live="polite" className="space-y-3">
              {isLoading
                ? Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={index} lines={2} />)
                : snapshot.snoozed.map((item) => (
                    <li key={item.id}>
                      <button
                        aria-label={`Open snoozed thread ${item.subject} from ${item.sender.name}`}
                        className={`${interactiveCardBase} min-h-[3.5rem]`}
                        type="button"
                      >
                        <p className="text-sm font-medium text-slate-100">{item.subject}</p>
                        <p className="text-xs text-slate-400">{item.sender.name}</p>
                        <p className="mt-3 text-xs text-slate-400">Back {formatRelativeTime(now, item.snoozeUntilIso)}</p>
                      </button>
                    </li>
                  ))}
            </ul>
          </Section>
        </div>

        <Section
          description="Contacts that still owe you a response."
          id="awaiting-replies"
          title="Awaiting Replies"
        >
          <div
            aria-labelledby="awaiting-replies-region-heading"
            aria-live="polite"
            className="space-y-3"
            id="awaiting-replies-region"
            role="region"
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wide text-slate-400"
              id="awaiting-replies-region-heading"
            >
              Threads on hold
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} lines={2} />)
                : snapshot.awaitingReplies.map((item) => {
                    const waitingIso = new Date(now.getTime() - item.daysWaiting * 24 * 60 * 60 * 1000).toISOString();

                    return (
                      <li key={item.id}>
                        <button
                          aria-label={`Review awaiting reply ${item.subject} from ${item.email}`}
                          className={`${interactiveCardBase} min-h-[3.5rem]`}
                          type="button"
                        >
                          <p className="text-sm font-medium text-slate-100">{item.subject}</p>
                          <p className="text-xs text-slate-400">{item.email}</p>
                          <p className="mt-3 text-xs text-slate-400">
                            Waiting {numberFormatter.format(item.daysWaiting)} days · Last heard {formatRelativeTime(now, waitingIso)}
                          </p>
                        </button>
                      </li>
                    );
                  })}
            </ul>
          </div>
        </Section>

        <div aria-live="assertive" className="sr-only" data-dashboard-undo-announcement />
      </main>
    </>
  );
}
