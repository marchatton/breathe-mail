import React, { useEffect, useState } from 'react';
import { mockCalendarEvents } from '../../data/mockData';
import { CalendarIcon, ClockIcon, MapPinIcon, VideoIcon } from 'lucide-react';
export function EventsHub() {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const todayEvents = mockCalendarEvents.filter(event => !event.time.includes('Tomorrow'));
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const dayMinutes = 24 * 60;
    return totalMinutes / dayMinutes * 100;
  };
  const isEventSoon = (eventTime: string) => {
    // Check if event is within next 5 minutes
    const now = new Date();
    const match = eventTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return false;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const eventDate = new Date();
    eventDate.setHours(hours, minutes, 0, 0);
    const diffMs = eventDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins >= 0 && diffMins <= 5;
  };
  return <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Today</h2>
          <CalendarIcon className="w-4 h-4 text-slate-500" />
        </div>
        <div className="text-xs text-slate-500">
          {currentTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        })}
        </div>
      </div>
      {/* Current Time Indicator */}
      <div className="relative h-0.5 bg-white/5 rounded-full mb-2">
        <div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-1000" style={{
        width: `${getCurrentTimePosition()}%`
      }} />
      </div>
      <div className="space-y-1.5">
        {todayEvents.map(event => {
        const isSoon = isEventSoon(event.time);
        return <div key={event.id} className="group rounded-lg bg-white/5 border border-white/10 p-2.5 hover:bg-white/8 transition-all duration-200 cursor-pointer">
              <div className="flex items-start gap-2">
                <div className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 flex-shrink-0">
                  <span className="text-xs font-medium text-white">
                    {event.time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white mb-0.5">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{event.duration}</span>
                    </div>
                    {event.location && <div className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>}
                  </div>
                  {isSoon && <button className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium transition-colors">
                      <VideoIcon className="w-3 h-3" />
                      Join now
                    </button>}
                </div>
              </div>
            </div>;
      })}
      </div>
    </div>;
}