import React, { useState } from 'react';
import { mockWildcards } from '../../data/mockData';
import { SparklesIcon, XIcon, ArrowUpIcon } from 'lucide-react';
export function WildcardSpace() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const activeWildcards = mockWildcards.filter(card => !dismissed.has(card.id));
  const handleDismiss = (cardId: string) => {
    setDismissed(prev => new Set(prev).add(cardId));
  };
  const handlePromote = (cardId: string) => {
    console.log('Promoting:', cardId);
    handleDismiss(cardId);
  };
  if (activeWildcards.length === 0) {
    return <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Wildcard</h2>
          <SparklesIcon className="w-4 h-4 text-slate-500" />
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-xs text-slate-500">
            No interesting items found in noise
          </p>
        </div>
      </div>;
  }
  return <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-white">Wildcard</h2>
        <SparklesIcon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="space-y-1.5">
        {activeWildcards.map(card => <div key={card.id} className="group flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 transition-all duration-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-white truncate">
                  {card.subject}
                </h3>
                <span className="px-1.5 py-0.5 rounded text-xs bg-white/10 text-slate-400 flex-shrink-0">
                  {card.category}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                  <button onClick={() => handlePromote(card.id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Promote to Actions">
                    <ArrowUpIcon className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDismiss(card.id)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Dismiss">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {card.reason}
              </p>
            </div>
          </div>)}
      </div>
    </div>;
}