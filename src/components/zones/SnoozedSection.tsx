import React, { useEffect, useState, useRef } from 'react';
import { mockSnoozedItems } from '../../data/mockData';
import { ReplyModal } from '../shared/ReplyModal';
import { ClockIcon, XIcon, ExternalLinkIcon, PinIcon, TagIcon } from 'lucide-react';
export function SnoozedSection() {
  const [showAll, setShowAll] = useState(false);
  const displayedItems = showAll ? mockSnoozedItems : mockSnoozedItems.slice(0, 10);
  const hasMore = mockSnoozedItems.length > 10;
  const [showSnoozeMenu, setShowSnoozeMenu] = useState<string | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
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
  const handleOpenReplyModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setSelectedEmail(item);
    setReplyModalOpen(true);
  };
  const handleUnsnooze = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    console.log('Unsnooze:', threadId);
  };
  const handlePin = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    console.log('Pinned:', threadId);
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
  return <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">Snoozed</h2>
      </div>
      <div className="space-y-1.5">
        {displayedItems.map(item => <div key={item.id} className="group rounded-lg bg-white/5 border border-white/10 p-2.5 hover:bg-white/8 transition-all duration-200 cursor-pointer relative" onClick={e => handleOpenReplyModal(e, item)}>
            <div className="flex items-start gap-2">
              <img src={item.sender.avatar_url} alt={item.sender.name} className="w-8 h-8 rounded-full ring-1 ring-white/20 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-xs font-semibold text-white truncate">
                    {item.subject}
                  </h3>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500 truncate">
                    {item.sender.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ClockIcon className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-500">
                    {item.snoozeUntil}
                  </span>
                  {item.tags && item.tags.length > 0 && <>
                      <span className="text-xs text-slate-600">·</span>
                      <TagIcon className="w-3 h-3 text-slate-600" />
                      <div className="flex gap-1.5">
                        {item.tags.map((tag, idx) => <span key={idx} className="text-xs text-slate-500 truncate">
                            {tag}
                          </span>)}
                      </div>
                    </>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => handlePin(e, item.id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Pin">
                  <PinIcon className="w-3.5 h-3.5" />
                </button>
                <div className="relative" ref={showSnoozeMenu === item.id ? snoozeMenuRef : null}>
                  <button onClick={e => handleSnoozeClick(e, item.id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Change snooze">
                    <ClockIcon className="w-3.5 h-3.5" />
                  </button>
                  {showSnoozeMenu === item.id && <div className="absolute right-0 top-full mt-1 z-10 bg-slate-800 border border-white/10 rounded-lg shadow-lg py-1 min-w-[140px]">
                      <button onClick={e => handleSnooze(e, item.id, 'Tomorrow')} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
                        Tomorrow
                      </button>
                      <button onClick={e => handleSnooze(e, item.id, 'In 2 days')} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
                        In 2 days
                      </button>
                      <button onClick={e => handleSnooze(e, item.id, 'In 3 days')} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
                        In 3 days
                      </button>
                      <button onClick={e => handleSnooze(e, item.id, 'In a week')} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
                        In a week
                      </button>
                    </div>}
                </div>
                <button onClick={e => handleUnsnooze(e, item.gmail_thread_id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Unsnooze">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
                <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>
          </div>)}
      </div>
      {hasMore && <button onClick={() => setShowAll(!showAll)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          {showAll ? 'Show less' : 'See more'}
        </button>}
      {selectedEmail && <ReplyModal isOpen={replyModalOpen} onClose={() => setReplyModalOpen(false)} recipient={selectedEmail.sender.email} subject={selectedEmail.subject} />}
    </div>;
}