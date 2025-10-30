import React, { useState } from 'react';
import { mockEmailSummaries } from '../../data/mockData';
import { ReplyModal } from '../shared/ReplyModal';
import { SparklesIcon, ExternalLinkIcon, TagIcon, PinIcon } from 'lucide-react';
export function EmailSummaries() {
  const [showAll, setShowAll] = useState(false);
  const displayedItems = showAll ? mockEmailSummaries : mockEmailSummaries.slice(0, 10);
  const hasMore = mockEmailSummaries.length > 10;
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const handleOpenReplyModal = (e: React.MouseEvent, summary: any) => {
    e.stopPropagation();
    setSelectedEmail({
      email: summary.participants[0],
      subject: summary.subject
    });
    setReplyModalOpen(true);
  };
  const handleOpenThread = (gmailThreadId: string) => {
    const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${gmailThreadId}`;
    window.open(gmailUrl, '_blank');
  };
  const handlePin = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    console.log('Pinned:', threadId);
  };
  return <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Email summaries</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayedItems.map(summary => <div key={summary.thread_id} className="group rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/8 transition-all duration-200 cursor-pointer" onClick={e => handleOpenReplyModal(e, summary)}>
            <div className="flex items-start gap-2 mb-2">
              <img src={`https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`} alt="Thread avatar" className="w-8 h-8 rounded-full ring-1 ring-white/20 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className="text-xs font-semibold text-white truncate">
                    {summary.subject}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button onClick={e => handlePin(e, summary.thread_id)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100" title="Pin">
                      <PinIcon className="w-3 h-3" />
                    </button>
                    <ExternalLinkIcon className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs text-slate-500 truncate">
                    {summary.participants.join(', ')}
                  </span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-600">2h ago</span>
                </div>
                {summary.tags && summary.tags.length > 0 && <div className="flex items-center gap-1.5 mb-2">
                    <span className="px-1.5 py-0.5 rounded text-xs bg-white/10 text-slate-300 flex-shrink-0">
                      {summary.message_count}
                    </span>
                    <TagIcon className="w-3 h-3 text-slate-600" />
                    <div className="flex gap-1.5">
                      {summary.tags.map((tag, idx) => <span key={idx} className="text-xs text-slate-500 truncate">
                          {tag}
                        </span>)}
                    </div>
                  </div>}
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <SparklesIcon className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {summary.summary}
              </p>
            </div>
          </div>)}
      </div>
      {hasMore && <button onClick={() => setShowAll(!showAll)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          {showAll ? 'Show less' : 'See more'}
        </button>}
      {selectedEmail && <ReplyModal isOpen={replyModalOpen} onClose={() => setReplyModalOpen(false)} recipient={selectedEmail.email} subject={selectedEmail.subject} />}
    </div>;
}