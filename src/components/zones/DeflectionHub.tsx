import React, { useState, createElement, Component } from 'react';
import { mockDeflection } from '../../data/mockData';
import { TagIcon, UsersIcon, BellIcon, MessageSquareIcon, XIcon, ExternalLinkIcon, CheckIcon } from 'lucide-react';
const categoryIcons: Record<string, any> = {
  Promotions: TagIcon,
  Social: UsersIcon,
  Updates: BellIcon,
  Forums: MessageSquareIcon
};
export function DeflectionHub() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [readCounts, setReadCounts] = useState<Record<string, number>>({
    Promotions: 0,
    Social: 0,
    Updates: 0,
    Forums: 0
  });
  // Mock email data for the modal
  const mockEmails = Array.from({
    length: 15
  }, (_, i) => ({
    id: `email_${i}`,
    subject: `Sample ${selectedCategory} Email ${i + 1}`,
    sender: `sender${i}@example.com`,
    preview: 'This is a preview of the email content...',
    time: `${i + 1}h ago`
  }));
  const handleMarkAllAsRead = (e: React.MouseEvent, category: string, totalCount: number) => {
    e.stopPropagation();
    setReadCounts(prev => ({
      ...prev,
      [category]: totalCount
    }));
  };
  const handleMarkCategoryAsRead = (category: string) => {
    const cluster = mockDeflection.clusters.find(c => c.category === category);
    if (cluster) {
      setReadCounts(prev => ({
        ...prev,
        [category]: cluster.count
      }));
    }
    setSelectedCategory(null);
  };
  return <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Noise zone</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mockDeflection.clusters.map(cluster => {
        const IconComponent = categoryIcons[cluster.category] || TagIcon;
        const unreadCount = cluster.count - (readCounts[cluster.category] || 0);
        return <button key={cluster.id} onClick={() => setSelectedCategory(cluster.category)} className="group rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/8 transition-all duration-200 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-white flex-1">
                  {cluster.category}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && <button onClick={e => handleMarkAllAsRead(e, cluster.category, cluster.count)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100" title="Mark all as read">
                      <CheckIcon className="w-3.5 h-3.5" />
                    </button>}
                  <span className={`px-2 py-0.5 rounded text-xs ${unreadCount > 0 ? 'bg-white/10 text-white font-medium' : 'bg-white/5 text-slate-500'}`}>
                    {unreadCount}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">
                {cluster.preview}
              </p>
            </button>;
      })}
      </div>
      {/* Category Modal */}
      {selectedCategory && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedCategory(null)}>
          <div className="bg-slate-900 rounded-xl border border-white/10 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {createElement(categoryIcons[selectedCategory], {
              className: 'w-5 h-5 text-slate-400'
            })}
                <h2 className="text-lg font-semibold text-white">
                  {selectedCategory}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-slate-300">
                  {mockEmails.length} items
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleMarkCategoryAsRead(selectedCategory)} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs transition-colors">
                  Mark all as read
                </button>
                <button onClick={() => setSelectedCategory(null)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {mockEmails.map(email => <div key={email.id} className="group flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {email.subject}
                        </span>
                        <span className="text-xs text-slate-600 flex-shrink-0">
                          {email.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 truncate">
                          {email.sender}
                        </span>
                      </div>
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>)}
              </div>
            </div>
          </div>
        </div>}
    </div>;
}