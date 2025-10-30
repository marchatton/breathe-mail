import React, { useState, useRef } from 'react';
import { mockInsights } from '../../data/mockData';
import { BookOpenIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from 'lucide-react';
export function InsightHub() {
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [isHovering, setIsHovering] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  return <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Curated insights</h2>
      </div>
      {/* Horizontal Scrolling Cards with Hover Controls */}
      <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        {/* Left Scroll Button */}
        <button onClick={() => scroll('left')} className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white transition-all shadow-lg ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        {/* Right Scroll Button */}
        <button onClick={() => scroll('right')} className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white transition-all shadow-lg ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <ChevronRightIcon className="w-5 h-5" />
        </button>
        <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
          {mockInsights.map(insight => <div key={insight.id} className="group flex-shrink-0 w-[280px] rounded-lg bg-white/5 border border-white/10 overflow-hidden hover:bg-white/8 transition-all duration-200 cursor-pointer" onClick={() => setSelectedInsight(insight)}>
              {/* Header with icon */}
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpenIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-500">
                    {insight.source}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
                  {insight.title}
                </h3>
              </div>
              {/* Content */}
              <div className="p-3">
                <div className="flex items-start gap-1.5 mb-3">
                  <SparklesIcon className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {insight.summary}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {insight.highlights.slice(0, 2).map((highlight: string, idx: number) => <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-500">
                        <span className="mt-1">•</span>
                        <span className="line-clamp-1">{highlight}</span>
                      </div>)}
                </div>
              </div>
            </div>)}
        </div>
      </div>
      {/* Expanded Modal */}
      {selectedInsight && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedInsight(null)}>
          <div className="bg-slate-900 rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-slate-500" />
                  <h2 className="text-xl font-semibold text-white">
                    {selectedInsight.title}
                  </h2>
                </div>
                <button onClick={() => setSelectedInsight(null)} className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                {selectedInsight.summary}
              </p>
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-white">
                  Key Highlights:
                </h3>
                {selectedInsight.highlights.map((highlight: string, idx: number) => <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
                      <span className="text-slate-500 text-sm mt-0.5">•</span>
                      <span className="text-sm text-slate-300">
                        {highlight}
                      </span>
                    </div>)}
              </div>
              <div className="pt-4 border-t border-white/10">
                <span className="text-xs text-slate-600">
                  {selectedInsight.source}
                </span>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}