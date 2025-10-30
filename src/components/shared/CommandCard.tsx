import React from 'react';
import { ArchiveIcon, ClockIcon, ExternalLinkIcon, AlertCircleIcon } from 'lucide-react';
interface CommandCardProps {
  card: any;
}
export function CommandCard({
  card
}: CommandCardProps) {
  const score = card.content.action_metadata.score;
  const isUrgent = score >= 85;
  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${card.gmail_thread_id || ''}`;
    window.open(gmailUrl, '_blank');
  };
  return <div className="group rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 p-4 hover:bg-white/8 transition-all duration-200">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <img src={card.content.sender.avatar_url} alt={card.content.sender.name} className="w-10 h-10 rounded-full ring-2 ring-purple-500/30 flex-shrink-0" />
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {card.content.sender.name}
              </h3>
              {isUrgent && <AlertCircleIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-slate-400">
                {card.content.thread_context.last_activity}
              </span>
            </div>
          </div>
          <h4 className="text-sm font-medium text-white mb-1 truncate">
            {card.content.subject}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {card.content.preview}
          </p>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={handleOpenGmail} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs transition-colors">
              <ExternalLinkIcon className="w-3 h-3" />
              Open
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs transition-colors">
              <ClockIcon className="w-3 h-3" />
              Snooze
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs transition-colors">
              <ArchiveIcon className="w-3 h-3" />
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>;
}