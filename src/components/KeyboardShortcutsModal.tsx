import React, { useEffect } from 'react';
import {
  Keyboard,
  X,
  Command,
  Plus,
  Search,
  Lock,
  Download,
  Trash2,
  Cpu,
  Sparkles,
  Sliders,
  Send,
  HelpCircle,
  Code,
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'General' | 'Navigation' | 'Chat & Editor';
  badge?: string;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['⌘', 'K'],
    description: 'Start a new conversation',
    category: 'General',
    badge: 'Global',
  },
  {
    keys: ['?'],
    description: 'Open this Keyboard Shortcuts help modal',
    category: 'General',
    badge: 'Anywhere',
  },
  {
    keys: ['Esc'],
    description: 'Close active modal, search, or dialog',
    category: 'General',
  },
  {
    keys: ['Enter'],
    description: 'Send message / submit prompt',
    category: 'Chat & Editor',
  },
  {
    keys: ['Shift', 'Enter'],
    description: 'Insert newline in prompt textarea',
    category: 'Chat & Editor',
  },
  {
    keys: ['⌘', 'Enter'],
    description: 'Force submit prompt from anywhere in the input box',
    category: 'Chat & Editor',
  },
  {
    keys: ['⌘', 'E'],
    description: 'Export active conversation (JSON or Markdown)',
    category: 'Chat & Editor',
  },
  {
    keys: ['⌘', 'L'],
    description: 'Toggle Read-Only lock on active conversation',
    category: 'Chat & Editor',
  },
  {
    keys: ['⌘', '/'],
    description: 'Focus conversation search in sidebar',
    category: 'Navigation',
  },
  {
    keys: ['⌘', '1'],
    description: 'Switch to Developer Assistant mode',
    category: 'Navigation',
  },
  {
    keys: ['⌘', '2'],
    description: 'Switch to Hackathon Builder mode',
    category: 'Navigation',
  },
  {
    keys: ['⌘', 'B'],
    description: 'Open full 12-step Hackathon Project Builder',
    category: 'Navigation',
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: Array<'General' | 'Navigation' | 'Chat & Editor'> = [
    'General',
    'Chat & Editor',
    'Navigation',
  ];

  return (
    <div
      id="keyboard-shortcuts-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0c101c] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-[#0c101c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Keyboard Shortcuts
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/80">
                  InfraPilot AI
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Quick commands to navigate and control your workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-shortcuts-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {categories.map((cat) => {
            const list = SHORTCUTS.filter((s) => s.category === cat);
            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800/60">
                  <span>{cat}</span>
                  <span className="font-mono text-[10px] text-slate-500 lowercase">
                    {list.length} shortcuts
                  </span>
                </div>

                <div className="space-y-1.5">
                  {list.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 pr-4">
                        <span className="text-slate-200 font-medium">
                          {item.description}
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-950/70 border border-purple-800/60 text-purple-300">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="inline-flex items-center justify-center min-w-[22px] px-1.5 py-1 rounded-md bg-[#131a2e] border border-slate-700/80 text-[11px] font-mono font-semibold text-slate-200 shadow-xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#090d18] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">?</kbd> anytime to open this guide
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
