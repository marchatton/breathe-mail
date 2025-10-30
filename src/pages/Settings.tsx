import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon } from 'lucide-react';
export function Settings() {
  const navigate = useNavigate();
  const [bionicReading, setBionicReading] = useState(false);
  return <div className="w-full min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Reading Preferences */}
          <div className="rounded-lg bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Reading Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    Bionic Reading
                  </h3>
                  <p className="text-xs text-slate-400">
                    Highlight key parts of words for faster reading and scanning
                  </p>
                </div>
                <button onClick={() => setBionicReading(!bionicReading)} className={`relative w-12 h-6 rounded-full transition-colors ${bionicReading ? 'bg-purple-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${bionicReading ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
          {/* Account Settings */}
          <div className="rounded-lg bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connected Email</span>
                  <span className="text-xs text-slate-500">
                    alex@company.com
                  </span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                <span className="text-sm">Manage Notifications</span>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                <span className="text-sm">Privacy & Data</span>
              </button>
            </div>
          </div>
          {/* Appearance */}
          <div className="rounded-lg bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Appearance
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Theme</span>
                  <span className="text-xs text-slate-500">Dark</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                <span className="text-sm">Compact Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}