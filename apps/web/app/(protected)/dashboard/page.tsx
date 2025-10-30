import type { ReactNode } from 'react';
import { workspaceFixture } from '@breathe-mail/email';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </header>
      <div className="space-y-3 text-sm text-slate-300">{children}</div>
    </section>
  );
}

export default function DashboardPage() {
  const snapshot = workspaceFixture;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-brand-300">Breathe Mail</p>
        <h1 className="text-3xl font-bold text-slate-50">Command Center</h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Typed fixtures showcase how actions, insights, and timeline data flow through the refactored workspace.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section title="Priority Actions">
          <ul className="space-y-3">
            {snapshot.commands.map((command) => (
              <li key={command.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{command.content.subject}</p>
                    <p className="text-xs text-slate-400">{command.content.sender.name}</p>
                  </div>
                  <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-200">
                    {command.content.actionMetadata.type}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">{command.content.preview}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Insights">
          <ul className="space-y-3">
            {snapshot.insights.map((insight) => (
              <li key={insight.id} className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{insight.title}</span>
                  {insight.isNew ? <span className="text-brand-300">New</span> : null}
                </div>
                <p className="text-xs leading-5 text-slate-400">{insight.summary}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Today">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stats</h3>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-slate-500">Actions resolved</dt>
                  <dd className="text-slate-100">{snapshot.debrief.statistics.today.actionsResolved}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Critical handled</dt>
                  <dd className="text-slate-100">{snapshot.debrief.statistics.today.criticalHandled}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Avg response</dt>
                  <dd className="text-slate-100">{snapshot.debrief.statistics.today.averageResponseTime}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Focus score</dt>
                  <dd className="text-slate-100">{snapshot.debrief.statistics.today.focusScore}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Follow ups</h3>
              <ul className="mt-2 space-y-2">
                {snapshot.debrief.followUps.map((followUp) => (
                  <li key={followUp.threadId} className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
                    <p className="text-xs font-medium text-slate-100">{followUp.subject}</p>
                    <p className="text-[11px] text-slate-500">
                      Waiting {followUp.waitingSinceLabel} · {followUp.recipient}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Calendar">
          <ul className="space-y-3">
            {snapshot.calendar.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
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
        </Section>

        <Section title="Snoozed">
          <ul className="space-y-3">
            {snapshot.snoozed.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-medium text-slate-100">{item.subject}</p>
                <p className="text-xs text-slate-400">{item.sender.name}</p>
                <p className="mt-2 text-[11px] text-slate-500">Back at {item.snoozeUntilLabel}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Awaiting Replies">
        <ul className="grid gap-3 sm:grid-cols-2">
          {snapshot.awaitingReplies.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-sm font-medium text-slate-100">{item.subject}</p>
              <p className="text-xs text-slate-400">{item.email}</p>
              <p className="mt-2 text-[11px] text-slate-500">Waiting {item.daysWaiting} days</p>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
