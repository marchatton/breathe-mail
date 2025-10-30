import React from 'react';
import { ExternalLinkIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';
interface EditorialTileProps {
  item: any;
  isRead?: boolean;
}
export function EditorialTile({
  item,
  isRead = false
}: EditorialTileProps) {
  return <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
      {/* Hero Image */}
      {item.content.hero_image && <div className="relative h-48 overflow-hidden">
          <img src={item.content.hero_image.url} alt={item.content.hero_image.alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          {isRead && <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-purple-500/30 backdrop-blur-sm border border-purple-500/50 flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3 text-purple-300" />
              <span className="text-xs text-purple-300">Read</span>
            </div>}
        </div>}
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-purple-400">
            {item.source.publication}
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400">{item.source.author}</span>
        </div>
        <h3 className="text-base font-semibold text-white mb-3 leading-snug">
          {item.content.headline}
        </h3>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            {item.content.summary}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <a href={item.content.primary_link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
            Read full article
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <ClockIcon className="w-3 h-3" />
            {item.content.primary_link.reading_time_minutes}m
          </div>
        </div>
      </div>
    </div>;
}