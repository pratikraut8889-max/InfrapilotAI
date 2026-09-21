import React from 'react';
import { Sparkles, Cpu } from 'lucide-react';

interface LoadingIndicatorProps {
  statusText?: string;
  mode?: 'developer' | 'hackathon';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  statusText = 'Analyzing infrastructure requirements...',
  mode = 'developer',
}) => {
  const isHackathon = mode === 'hackathon';

  return (
    <div className="flex items-start gap-3.5 my-3 animate-fadeIn">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${
        isHackathon
          ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-500/20'
          : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/20'
      }`}>
        {isHackathon ? (
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
        ) : (
          <Cpu className="w-4 h-4 animate-pulse" />
        )}
      </div>

      <div className="flex-1 bg-[#101726] border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md max-w-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold tracking-wide text-slate-300">
            {isHackathon ? 'Hackathon Builder' : 'InfraPilot AI'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            Generating response
          </span>
        </div>

        <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
          {statusText}
        </p>

        {/* Pulsing skeleton bars */}
        <div className="mt-3 space-y-2">
          <div className="h-2 bg-slate-800/80 rounded-full w-4/5 animate-pulse" />
          <div className="h-2 bg-slate-800/60 rounded-full w-3/5 animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="h-2 bg-slate-800/40 rounded-full w-2/5 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
