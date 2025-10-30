import React from 'react';
import { MailIcon, UserIcon } from 'lucide-react';
interface BundleClusterProps {
  summary: any;
}
export function BundleCluster({
  summary
}: BundleClusterProps) {
  return <div className="rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 p-4 hover:bg-white/8 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <MailIcon className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-white truncate">
              {summary.subject}
            </h3>
            <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300 flex-shrink-0">
              {summary.message_count}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-400">
              {summary.participants.join(', ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">
            {summary.summary}
          </p>
        </div>
      </div>
    </div>;
}