import type { ReactNode } from 'react';
import { workspaceFixture } from '@breathe-mail/email';

const numberFormatter = new Intl.NumberFormat('en-US');
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0
});
const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const formatRelativeLabel = (label: string) => {
  const match = label.match(/(\d+)\s+(\w+)/);

  if (!match) {
    return label;
  }

  const [, rawValue, rawUnit] = match;
  const value = Number.parseInt(rawValue, 10);
  const unit = rawUnit.toLowerCase().replace(/s$/, '') as Intl.RelativeTimeFormatUnit;

  if (Number.isNaN(value)) {
    return label;
  }

  return relativeTimeFormatter.format(-value, unit);
};

const formatDurationLabel = (label: string) => {
  const parts = Array.from(label.matchAll(/(\d+)([a-z]+)/gi));

  if (parts.length === 0) {
    return label;
  }

  return parts
    .map(([_, value, unit]) => {
      const numeric = numberFormatter.format(Number.parseInt(value, 10));

      switch (unit.toLowerCase()) {
        case 'm':
          return `${numeric} minutes`;
        case 's':
          return `${numeric} seconds`;
        case 'h':
          return `${numeric} hours`;
        default:
          return `${numeric} ${unit}`;
      }
    })
    .join(' ');
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  const sectionId = `section-${slugify(title)}`;
  const headingId = `${sectionId}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="scroll-mt-28 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-sm"
      id={sectionId}
      role="region"
    >
      <header className="flex items-center justify-between">
        <h2 className="scroll-mt-28 text-lg font-semibold text-slate-100" id={headingId}>
          {title}
        </h2>
      </header>
      <div className="space-y-3 text-sm text-slate-300">{children}</div>
    </section>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-800/60 ${className ?? ''}`} />;
}

export default function DashboardPage() {
  const snapshot = workspaceFixture;
  const isLoading = false;

  return (
    <>
      <a className="skip-link" href="#dashboard-content">
        Skip to main content
      </a>
      <main
        className="safe-area-container mx-auto flex w-full max-w-6xl flex-col gap-8"
        id="dashboard-content"
        role="main"
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
          <Section title="Priority Actions">
            {isLoading ? (
              <div className="space-y-3" aria-hidden>
                <SkeletonCard className="h-24" />
                <SkeletonCard className="h-24" />
                <SkeletonCard className="h-24" />
              </div>
            ) : (
              <ul className="space-y-3" aria-live="polite">
                {snapshot.commands.map((command) => {
                  const actionLabel = `Review ${command.content.subject} from ${command.content.sender.name}`;

                  return (
                    <li key={command.id}>
                      <button
                        aria-label={actionLabel}
                        className="motion-fade flex w-full min-h-[3.5rem] flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-left text-sm text-slate-200 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 hover:border-brand-500/60 hover:bg-slate-900/80"
                        type="button"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-100">{command.content.subject}</p>
                            <p className="text-xs text-slate-400">{command.content.sender.name}</p>
                          </div>
                          <span className="flex min-h-6 min-w-[3.5rem] items-center justify-center rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-200">
                            <span aria-hidden>{command.content.actionMetadata.type}</span>
                            <span className="sr-only">Action type {command.content.actionMetadata.type}</span>
                          </span>
                        </div>
                        <p className="text-xs leading-5 text-slate-400">{command.content.preview}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title="Insights">
            {isLoading ? (
              <div className="space-y-3" aria-hidden>
                <SkeletonCard className="h-20" />
                <SkeletonCard className="h-20" />
              </div>
            ) : (
              <ul className="space-y-3">
                {snapshot.insights.map((insight) => (
                  <li
                    key={insight.id}
                    className="motion-fade space-y-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{insight.title}</span>
                      {insight.isNew ? (
                        <span className="rounded-full bg-brand-500/20 px-2 py-1 text-[11px] font-medium text-brand-200">New</span>
                      ) : null}
                    </div>
                    <p className="leading-5 text-slate-400">{insight.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Today">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stats</h3>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  {(
                    [
                      {
                        id: 'actions-resolved',
                        label: 'Actions resolved',
                        value: numberFormatter.format(snapshot.debrief.statistics.today.actionsResolved)
                      },
                      {
                        id: 'critical-handled',
                        label: 'Critical handled',
                        value: numberFormatter.format(snapshot.debrief.statistics.today.criticalHandled)
                      },
                      {
                        id: 'avg-response',
                        label: 'Avg response',
                        value: formatDurationLabel(snapshot.debrief.statistics.today.averageResponseTime)
                      },
                      {
                        id: 'focus-score',
                        label: 'Focus score',
                        value: percentFormatter.format(snapshot.debrief.statistics.today.focusScore)
                      }
                    ] as const
                  ).map((stat) => (
                    <div key={stat.id}>
                      <dt className="text-slate-500" id={`stat-${stat.id}`}>
                        {stat.label}
                      </dt>
                      <dd
                        aria-describedby={`stat-${stat.id}`}
                        className="tabular-nums text-slate-100"
                      >
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Follow ups</h3>
                {isLoading ? (
                  <div aria-hidden className="mt-2 space-y-2">
                    <SkeletonCard className="h-16" />
                    <SkeletonCard className="h-16" />
                  </div>
                ) : (
                  <ul aria-live="polite" className="mt-2 space-y-2">
                    {snapshot.debrief.followUps.map((followUp) => (
                      <li key={followUp.threadId}>
                        <button
                          aria-label={`Open follow-up ${followUp.subject} for ${followUp.recipient}`}
                          className="motion-fade flex w-full min-h-[3.25rem] flex-col gap-1 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-3 text-left text-xs text-slate-200 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 hover:border-brand-500/60 hover:bg-slate-900/70"
                          type="button"
                        >
                          <p className="font-medium text-slate-100">{followUp.subject}</p>
                          <p className="text-[11px] text-slate-400">
                            Waiting {formatRelativeLabel(followUp.waitingSinceLabel)} · {followUp.recipient}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Urgency: <span className="font-semibold text-slate-100 capitalize">{followUp.urgency}</span>
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title="Calendar">
            {isLoading ? (
              <div aria-hidden className="space-y-3">
                <SkeletonCard className="h-20" />
                <SkeletonCard className="h-20" />
              </div>
            ) : (
              <ul className="space-y-3" aria-live="polite">
                {snapshot.calendar.map((item) => (
                  <li key={item.id} className="motion-fade rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-slate-100">{item.title}</span>
                      <span className="text-slate-400">{item.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {item.type === 'deadline' ? 'Deadline' : 'Meeting'} · {item.duration}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Snoozed">
            {isLoading ? (
              <div aria-hidden className="space-y-3">
                <SkeletonCard className="h-20" />
                <SkeletonCard className="h-20" />
              </div>
            ) : (
              <ul className="space-y-3" aria-live="polite">
                {snapshot.snoozed.map((item) => (
                  <li key={item.id} className="motion-fade rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-sm font-medium text-slate-100">{item.subject}</p>
                    <p className="text-xs text-slate-400">{item.sender.name}</p>
                    <p className="mt-2 text-[11px] text-slate-500">Back at {item.snoozeUntilLabel}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <Section title="Awaiting Replies">
          {isLoading ? (
            <div aria-hidden className="grid gap-3 sm:grid-cols-2">
              <SkeletonCard className="h-24" />
              <SkeletonCard className="h-24" />
            </div>
          ) : (
            <ul aria-live="polite" className="grid gap-3 sm:grid-cols-2">
              {snapshot.awaitingReplies.map((item) => (
                <li key={item.id}>
                  <button
                    aria-label={`Review awaiting reply ${item.subject} from ${item.email}`}
                    className="motion-fade flex w-full min-h-[3.5rem] flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-left text-sm text-slate-200 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 hover:border-brand-500/60 hover:bg-slate-900/70"
                    type="button"
                  >
                    <p className="font-medium text-slate-100">{item.subject}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                    <p className="text-[11px] text-slate-500">
                      Waiting {numberFormatter.format(item.daysWaiting)} days · Last sent {item.lastSentLabel}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </main>
    </>
  );
}
