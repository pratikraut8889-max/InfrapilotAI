import React from 'react';
import { Cpu, Sparkles, Layers, Settings, User, Home, MessageSquare, ShieldCheck } from 'lucide-react';
import { ChatMode, UserProfile } from '../types';

interface NavbarProps {
  currentView: 'landing' | 'app' | 'hackathon-builder';
  onSetView: (view: 'landing' | 'app' | 'hackathon-builder') => void;
  mode: ChatMode;
  onToggleMode: (newMode: ChatMode) => void;
  onOpenTools: () => void;
  onOpenHackathon: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  currentUser: UserProfile;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSetView,
  mode,
  onToggleMode,
  onOpenTools,
  onOpenHackathon,
  onOpenSettings,
  onOpenAuth,
  currentUser,
  hasApiKey,
}) => {
  const isHackathon = mode === 'hackathon';

  return (
    <header className="h-14 border-b border-slate-800/90 bg-[#090d17]/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between text-xs">
      {/* Brand / Logo */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => onSetView('landing')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1">
            InfraPilot <span className="text-blue-400 font-mono text-xs">AI</span>
          </span>
        </div>

        {/* View Switcher: Landing vs Chat Workspace vs Hackathon Builder */}
        <nav className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            id="nav-tab-landing"
            onClick={() => onSetView('landing')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              currentView === 'landing'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Landing</span>
          </button>
          <button
            type="button"
            id="nav-tab-chat"
            onClick={() => onSetView('app')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              currentView === 'app'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Workspace</span>
          </button>
          <button
            type="button"
            id="nav-tab-hackathon-builder"
            onClick={() => onSetView('hackathon-builder')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              currentView === 'hackathon-builder'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Hackathon Builder</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-900/90 text-[9px] text-purple-200 font-mono">
              NEW
            </span>
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleMode(isHackathon ? 'developer' : 'hackathon')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
            isHackathon
              ? 'bg-purple-950/80 border-purple-800 text-purple-200 hover:bg-purple-900'
              : 'bg-blue-950/80 border-blue-800 text-blue-200 hover:bg-blue-900'
          }`}
          title="Toggle between Developer and Hackathon mode"
        >
          {isHackathon ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Hackathon Builder</span>
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Dev Assistant</span>
            </>
          )}
        </button>

        {/* AI Infra Tools Button */}
        <button
          type="button"
          onClick={onOpenTools}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Tools</span>
        </button>

        {/* Hackathon Suite Button */}
        <button
          type="button"
          onClick={onOpenHackathon}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 text-purple-300 hover:text-purple-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Hackathon Suite</span>
        </button>

        {/* User Account / Auth */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
          title="Developer Account / Authentication"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline font-medium">{currentUser.name.split(' ')[0]}</span>
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          title="App Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
