import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandCenter } from './components/zones/CommandCenter';
import { InsightHub } from './components/zones/InsightHub';
import { WildcardSpace } from './components/zones/WildcardSpace';
import { EventsHub } from './components/zones/EventsHub';
import { DeflectionHub } from './components/zones/DeflectionHub';
import { EmailSummaries } from './components/zones/EmailSummaries';
import { Content } from './components/zones/Content';
import { SnoozedSection } from './components/zones/SnoozedSection';
import { AwaitingRepliesSection } from './components/zones/AwaitingRepliesSection';
import { PinnedItems } from './components/zones/PinnedItems';
import { SettingsIcon, ChevronDownIcon } from 'lucide-react';
export function App() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  return <div className="w-full min-h-screen bg-slate-950">
      <div className="w-full min-h-screen p-4 md:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Breathe Mail
              </h1>
            </div>
            {/* User Profile & Settings */}
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/settings')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <SettingsIcon className="w-5 h-5" />
              </button>
              <div className="relative" ref={userMenuRef}>
                <div onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <img src="https://i.pravatar.cc/150?img=12" alt="User profile" className="w-8 h-8 rounded-full ring-2 ring-white/20" />
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-white">
                      Alex Morgan
                    </p>
                    <p className="text-xs text-slate-500">alex@company.com</p>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                </div>
                {showUserMenu && <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-lg py-1 z-10">
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10">
                      Switch Account
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10">
                      Sign Out
                    </button>
                  </div>}
              </div>
            </div>
          </div>
        </header>
        {/* Hub Layout */}
        <div className="space-y-8">
          {/* Top Row: Action Center (2/3) + Today's Calendar (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CommandCenter />
            </div>
            <div>
              <EventsHub />
            </div>
          </div>
          {/* Email Summaries - Full Width */}
          <EmailSummaries />
          {/* Snoozed and Awaiting Replies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SnoozedSection />
            <AwaitingRepliesSection />
          </div>
          {/* Pinned Items - Full Width */}
          <PinnedItems />
          {/* Insights Carousel - Full Width */}
          <InsightHub />
          {/* Content - Full Width */}
          <Content />
          {/* Wildcard - Full Width */}
          <WildcardSpace />
          {/* Deflection Hub - Full Width */}
          <DeflectionHub />
        </div>
      </div>
    </div>;
}