import React, { useState, useEffect } from 'react';
import { CheckCircle2, HardDrive, ArrowDownCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ className = '' }) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isSavingPulse, setIsSavingPulse] = useState(false);

  useEffect(() => {
    // Initial saved state
    setLastSaved(new Date());

    const handleAutoSaved = (e: Event) => {
      const customEvent = e as CustomEvent<{ timestamp: number; type: string; count: number }>;
      const time = customEvent.detail?.timestamp ? new Date(customEvent.detail.timestamp) : new Date();
      setLastSaved(time);
      setIsSavingPulse(true);
      setShowToast(true);

      const pulseTimer = setTimeout(() => {
        setIsSavingPulse(false);
      }, 1500);

      const toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 2500);

      return () => {
        clearTimeout(pulseTimer);
        clearTimeout(toastTimer);
      };
    };

    window.addEventListener('infrapilot:autosaved', handleAutoSaved);
    return () => {
      window.removeEventListener('infrapilot:autosaved', handleAutoSaved);
    };
  }, []);

  const formattedTime = lastSaved
    ? lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <>
      {/* Subtle Header Status Indicator Badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all duration-300 ${
          isSavingPulse
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-xs shadow-emerald-500/20 scale-105'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-300'
        } ${className}`}
        title={`All changes auto-saved to browser local storage${formattedTime ? ` at ${formattedTime}` : ''}`}
      >
        {isSavingPulse ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-400 animate-pulse shrink-0" />
        ) : (
          <HardDrive className="w-3 h-3 text-slate-500 shrink-0" />
        )}
        <span className="hidden sm:inline">
          {isSavingPulse ? 'Auto-saved' : 'Local'}
        </span>
        {formattedTime && (
          <span className="text-[9px] text-slate-500 hidden md:inline">
            {formattedTime}
          </span>
        )}
      </div>

      {/* Floating Auto-Save Toast Notification */}
      {showToast && (
        <div
          id="autosave-toast-notification"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 px-3 py-2 bg-[#0c1220]/95 border border-emerald-600/50 rounded-xl shadow-xl shadow-black/40 backdrop-blur-md text-xs text-emerald-300 animate-in fade-in slide-in-from-bottom-3 duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700/80 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-emerald-200 text-[11px]">
              History Auto-Saved
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              Persisted locally in storage
            </span>
          </div>
        </div>
      )}
    </>
  );
};
