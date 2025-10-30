import React, { useState, useRef } from 'react';
import { mockNewsletters } from '../../data/mockData';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, CheckCircleIcon, SparklesIcon, StarIcon, TagIcon } from 'lucide-react';
export function Content() {
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
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
  const markAsRead = (itemId: string) => {
    setReadItems(prev => new Set(prev).add(itemId));
  };
  const markAllAsRead = () => {
    setReadItems(new Set(mockNewsletters.map(item => item.item_id)));
  };
  const openArticle = (article: any) => {
    setSelectedArticle(article);
    setShowModal(true);
    markAsRead(article.item_id);
  };
  return <div className="space-y-3" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Newsletters</h2>
          <p className="text-xs text-slate-500 mt-0.5">Most recent reads</p>
        </div>
        <button onClick={markAllAsRead} className={`px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs transition-all ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          Mark all as read
        </button>
      </div>
      {/* Horizontal Scrolling Cards with Hover Controls */}
      <div className="relative">
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
          {mockNewsletters.map(article => {
          const isRead = readItems.has(article.item_id);
          return <div key={article.item_id} className="group flex-shrink-0 w-[280px] rounded-lg bg-white/5 border border-white/10 overflow-hidden hover:bg-white/8 transition-all cursor-pointer" onClick={() => openArticle(article)}>
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <img src={article.content.hero_image.url} alt={article.content.hero_image.alt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  {isRead && <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3 text-white" />
                      <span className="text-white text-xs">Read</span>
                    </div>}
                </div>
                {/* Content */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TagIcon className="w-3 h-3 text-slate-600" />
                    <span className="text-xs text-slate-500 truncate">
                      {article.source.publication}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2 leading-tight line-clamp-2">
                    {article.content.headline}
                  </h3>
                  {/* AI Summary */}
                  <div className="flex items-start gap-1.5 mb-2">
                    <SparklesIcon className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {article.content.summary}
                    </p>
                  </div>
                  {/* Read Time and Rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {article.content.primary_link.reading_time_minutes}m read
                    </span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-slate-400">
                        {Math.ceil(article.source.credibility_score * 5)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>;
        })}
        </div>
      </div>
      {/* Full Article Modal */}
      {showModal && selectedArticle && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">
                  {selectedArticle.source.publication}
                </span>
                <span className="text-sm text-slate-500">
                  {selectedArticle.content.primary_link.reading_time_minutes}{' '}
                  min read
                </span>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <img src={selectedArticle.content.hero_image.url} alt={selectedArticle.content.hero_image.alt} className="w-full h-64 object-cover rounded-lg mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">
                {selectedArticle.content.headline}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <span>By {selectedArticle.source.author}</span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-lg mb-6">
                  {selectedArticle.content.summary}
                </p>
                <p className="text-slate-400 leading-relaxed">
                  This is a preview of the article. The full content would be
                  displayed here with proper formatting, images, and all article
                  sections.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <a href={selectedArticle.content.primary_link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-300 hover:bg-white/15 transition-colors">
                  Read on {selectedArticle.source.publication}
                </a>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}