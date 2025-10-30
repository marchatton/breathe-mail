import React, { useState } from 'react';
import { ReplyModal } from '../shared/ReplyModal';
import { SparklesIcon, ExternalLinkIcon, TagIcon, PinIcon } from 'lucide-react';
// Mock data for pinned items
const mockPinnedItems = [{
  id: 'pin_001',
  gmail_thread_id: '18d4f2c8a1b9e3f1',
  subject: 'Q1 Marketing Strategy',
  sender: {
    name: 'Marketing Team',
    email: 'marketing@company.com',
    avatar_url: 'https://i.pravatar.cc/150?img=4'
  },
  tags: ['Marketing', 'Strategy'],
  preview: 'The Q1 marketing plan includes a focus on social media campaigns and influencer partnerships.',
  pinned_at: '2025-01-20T14:30:00Z'
}, {
  id: 'pin_002',
  gmail_thread_id: '18d4f2c8a1b9e3f2',
  subject: 'Project Milestones',
  sender: {
    name: 'Project Management',
    email: 'pm@company.com',
    avatar_url: 'https://i.pravatar.cc/150?img=7'
  },
  tags: ['Project'],
  preview: 'Key milestones for Q1: Backend API (Jan 15), Frontend (Feb 10), Testing (Feb 25), Launch (Mar 15).',
  pinned_at: '2025-01-21T09:45:00Z'
}, {
  id: 'pin_003',
  gmail_thread_id: '18d4f2c8a1b9e3f3',
  subject: 'Annual Budget Review',
  sender: {
    name: 'Finance Department',
    email: 'finance@company.com',
    avatar_url: 'https://i.pravatar.cc/150?img=11'
  },
  tags: ['Finance', 'Budget'],
  preview: 'The annual budget review meeting is scheduled for February 5th. Please prepare your department requests.',
  pinned_at: '2025-01-22T16:20:00Z'
}];
export function PinnedItems() {
  const [showAll, setShowAll] = useState(false);
  const displayedItems = showAll ? mockPinnedItems : mockPinnedItems.slice(0, 10);
  const hasMore = mockPinnedItems.length > 10;
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const handleOpenReplyModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setSelectedEmail({
      email: item.sender.email,
      subject: item.subject
    });
    setReplyModalOpen(true);
  };
  const handleOpenThread = (gmailThreadId: string) => {
    const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${gmailThreadId}`;
    window.open(gmailUrl, '_blank');
  };
  const handleUnpin = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    console.log('Unpinned:', itemId);
  };
  return <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Pinned items</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayedItems.map(item => <div key={item.id} className="group rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/8 transition-all duration-200 cursor-pointer" onClick={e => handleOpenReplyModal(e, item)}>
            <div className="flex items-start gap-2 mb-2">
              <img src={item.sender.avatar_url} alt={item.sender.name} className="w-8 h-8 rounded-full ring-1 ring-white/20 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className="text-xs font-semibold text-white truncate">
                    {item.subject}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button onClick={e => handleUnpin(e, item.id)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100" title="Unpin">
                      <PinIcon className="w-3 h-3 fill-current" />
                    </button>
                    <ExternalLinkIcon className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs text-slate-500 truncate">
                    {item.sender.name}
                  </span>
                  {item.tags.length > 0 && <>
                      <span className="text-xs text-slate-600">·</span>
                      <TagIcon className="w-3 h-3 text-slate-600" />
                      <div className="flex gap-1.5">
                        {item.tags.map((tag, idx) => <span key={idx} className="text-xs text-slate-500">
                            {tag}
                          </span>)}
                      </div>
                    </>}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <SparklesIcon className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {item.preview}
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