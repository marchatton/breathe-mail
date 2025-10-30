import React, { useEffect, useState, useRef } from 'react';
import { mockCommandCards } from '../../data/mockData';
import { ExternalLinkIcon, ChevronDownIcon, ArchiveIcon, ClockIcon, PinIcon, TagIcon, SparklesIcon } from 'lucide-react';
export function CommandCenter() {
  const [showAll, setShowAll] = useState(false);
  const sortedCards = [...mockCommandCards].sort((a, b) => b.content.action_metadata.score - a.content.action_metadata.score);
  const displayedCards = showAll ? sortedCards : sortedCards.slice(0, 10);
  const hasMore = sortedCards.length > 10;
  const [showSnoozeMenu, setShowSnoozeMenu] = useState<string | null>(null);
  const snoozeMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (snoozeMenuRef.current && !snoozeMenuRef.current.contains(event.target as Node)) {
        setShowSnoozeMenu(null);
      }
    };
    if (showSnoozeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSnoozeMenu]);
  const handleOpenGmail = (threadId: string) => {
    const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
    window.open(gmailUrl, '_blank');
  };
  const handleArchive = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    console.log('Archive:', threadId);
  };
  const handleSnoozeClick = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    setShowSnoozeMenu(threadId === showSnoozeMenu ? null : threadId);
  };
  const handleSnooze = (e: React.MouseEvent, threadId: string, option: string) => {
    e.stopPropagation();
    console.log(`Snooze ${threadId} until ${option}`);
    setShowSnoozeMenu(null);
  };
  const handlePin = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    console.log('Pinned:', threadId);
  };
  return <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Actions needed</h2>
      </div>
      <div className="space-y-1">
        {displayedCards.map(card => {
        const score = card.content.action_metadata.score;
        const tags = card.content.tags || [];
        const hasDeadline = card.content.action_metadata.deadline_iso;
        return <div key={card.id} className="group flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-200 cursor-pointer relative" onClick={() => handleOpenGmail(card.gmail_thread_id)}>
              {/* Avatar */}
              <img src={card.content.sender.avatar_url} alt={card.content.sender.name} className="w-8 h-8 rounded-full ring-1 ring-white/20 flex-shrink-0" />
              {/* Content - 3 rows */}
              <div className="flex-1 min-w-0">
                {/* Row 1: Subject + Sender + Actions */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white truncate">
                    {card.content.subject}
                  </span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500 truncate">
                    {card.content.sender.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                    <button onClick={e => handlePin(e, card.gmail_thread_id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Pin">
                      <PinIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative" ref={showSnoozeMenu === card.gmail_thread_id ? snoozeMenuRef : null}>
                      <button onClick={e => handleSnoozeClick(e, card.gmail_thread_id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Snooze">
                        <ClockIcon className="w-3.5 h-3.5" />
                      </button>
                      {showSnoozeMenu === card.gmail_thread_id && <div className="absolute right-0 top-full mt-1 z-10 bg-slate-800 border border-white/10 rounded-lg shadow-lg py-1 min-w-[140px]">
                          <button onClick={e => handleSnooze(e, card.gmail_thread_id, 'Tomorrow')} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
                            Tomorrow
                          </button>
                          <button onClick={e => handleSnooze(e, card.gmail_thread_id, 'In 2 days')} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
                            In 2 days
                          </button>
                          <button onClick={e => handleSnooze(e, card.gmail_thread_id, 'In 3 days')} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
                            In 3 days
                          </button>
                          <button onClick={e => handleSnooze(e, card.gmail_thread_id, 'In a week')} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
                            In a week
                          </button>
                        </div>}
                    </div>
                    <button onClick={e => handleArchive(e, card.gmail_thread_id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Archive">
                      <ArchiveIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Row 2: AI Summary + Deadline */}
                <div className="flex items-start gap-1.5 mb-1">
                  <SparklesIcon className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 line-clamp-1 flex-1">
                    {card.content.preview}
                  </p>
                  {hasDeadline && <span className="text-xs text-purple-400 flex-shrink-0">
                      Due EOD
                    </span>}
                </div>
                {/* Row 3: Time + Tags */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600">
                    {card.content.thread_context.last_activity}
                  </span>
                  {tags.length > 0 && <>
                      <span className="text-xs text-slate-600">·</span>
                      <TagIcon className="w-3 h-3 text-slate-600" />
                      <div className="flex gap-1.5">
                        {tags.map((tag, idx) => <span key={idx} className="text-xs text-slate-500 truncate">
                            {tag}
                          </span>)}
                      </div>
                    </>}
                </div>
              </div>
              {/* External Link Icon - 2nd from right */}
              <ExternalLinkIcon className="w-4 h-4 text-slate-600 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
              {/* Score Badge - rightmost */}
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-slate-300 flex-shrink-0">
                {score}
              </span>
            </div>;
      })}
      </div>
      {hasMore && <button onClick={() => setShowAll(!showAll)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          {showAll ? 'Show less' : 'See more'}
        </button>}
    </div>;
}