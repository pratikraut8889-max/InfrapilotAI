import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  Trash2,
  Download,
  Terminal,
  PanelLeft,
  Share2,
  Zap,
  Plus,
  Lock,
  Unlock,
  Keyboard,
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react';
import { Conversation, Message, ChatMode } from '../types';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { PromptInput } from './PromptInput';
import { ExportModal } from './ExportModal';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { AnalyticsService } from '../services/analytics';

interface ChatWindowProps {
  conversation?: Conversation;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onStopGeneration?: () => void;
  onClearConversation: () => void;
  onNewChat?: () => void;
  onToggleReadOnly?: (id: string) => void;
  onOpenShortcuts?: () => void;
  mode: ChatMode;
  model: string;
  onOpenTools: () => void;
  onOpenHackathon: () => void;
  onOpenHackathonBuilder?: () => void;
  onToggleSidebar: () => void;
  onRetryMessage?: (msg: Message) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  onStopGeneration,
  onClearConversation,
  onNewChat,
  onToggleReadOnly,
  onOpenShortcuts,
  mode,
  model,
  onOpenTools,
  onOpenHackathon,
  onOpenHackathonBuilder,
  onToggleSidebar,
  onRetryMessage,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyMatches, setFilterOnlyMatches] = useState(false);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages when not actively searching
  useEffect(() => {
    if (!searchQuery.trim()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, searchQuery]);

  // Compute matched message IDs
  const matchedMessageIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return messages
      .filter((m) => m.content.toLowerCase().includes(q))
      .map((m) => m.id);
  }, [messages, searchQuery]);

  // Reset current match index when search query changes
  useEffect(() => {
    setCurrentMatchIdx(0);
    if (searchQuery.trim().length > 2) {
      AnalyticsService.track('search_in_chat', {
        queryLength: searchQuery.length,
        matchesCount: matchedMessageIds.length,
      });
    }
  }, [searchQuery, matchedMessageIds.length]);

  const nextMatch = () => {
    if (matchedMessageIds.length === 0) return;
    setCurrentMatchIdx((prev) => (prev + 1) % matchedMessageIds.length);
  };

  const prevMatch = () => {
    if (matchedMessageIds.length === 0) return;
    setCurrentMatchIdx((prev) => (prev - 1 + matchedMessageIds.length) % matchedMessageIds.length);
  };

  // Keyboard shortcut Cmd+F / Ctrl+F for searching in chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen((prev) => {
          const nextState = !prev;
          if (nextState) {
            setTimeout(() => {
              searchInputRef.current?.focus();
              searchInputRef.current?.select();
            }, 50);
          }
          return nextState;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayedMessages = useMemo(() => {
    if (!filterOnlyMatches || !searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, filterOnlyMatches, searchQuery]);

  const isReadOnly = Boolean(conversation?.isReadOnly);
  const isHackathon = mode === 'hackathon';

  return (
    <div id="chat-window-main" className="flex-1 flex flex-col h-full bg-[#080b13] overflow-hidden">
      {/* Top Conversation Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800/80 bg-[#0c101c]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md flex items-center gap-2">
                <span className="truncate">{conversation?.title || 'InfraPilot AI Workspace'}</span>
                {isReadOnly && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 border border-amber-700/80 text-amber-300 shrink-0"
                    title="Read-only conversation: edits and additions locked"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">Read-Only</span>
                  </span>
                )}
              </h1>
              <span
                className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isHackathon
                    ? 'bg-purple-950/80 border-purple-800 text-purple-300'
                    : 'bg-blue-950/80 border-blue-800 text-blue-300'
                }`}
              >
                {isHackathon ? (
                  <>
                    <Sparkles className="w-2.5 h-2.5" /> Hackathon Builder
                  </>
                ) : (
                  <>
                    <Cpu className="w-2.5 h-2.5" /> Dev Assistant
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                Engine: {model}
              </p>
              {/* Subtle Auto-Save status badge */}
              <AutoSaveIndicator />
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* In-Chat Search Button */}
          <button
            type="button"
            id="header-search-btn"
            onClick={() => {
              setIsSearchOpen((prev) => {
                const nextState = !prev;
                if (nextState) {
                  AnalyticsService.track('search_in_chat', { action: 'open' });
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }
                return nextState;
              });
            }}
            className={`p-2 rounded-xl border transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${
              isSearchOpen || searchQuery
                ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-xs'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Search text in conversation (⌘F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {onNewChat && (
            <button
              type="button"
              id="header-new-chat-btn"
              onClick={onNewChat}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 min-h-[38px]"
              title="Start a new chat (⌘K)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {conversation && onToggleReadOnly && (
            <button
              type="button"
              id="header-toggle-readonly-btn"
              onClick={() => onToggleReadOnly(conversation.id)}
              className={`p-2 rounded-xl border transition-all min-h-[38px] min-w-[38px] flex items-center justify-center ${
                isReadOnly
                  ? 'bg-amber-950/70 border-amber-700/80 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={
                isReadOnly
                  ? 'Conversation is locked (Click to unlock)'
                  : 'Lock conversation (Toggle Read-Only to prevent edits)'
              }
            >
              {isReadOnly ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          )}

          {onOpenShortcuts && (
            <button
              type="button"
              id="header-shortcuts-btn"
              onClick={onOpenShortcuts}
              className="p-2 text-slate-400 hover:text-blue-400 rounded-xl hover:bg-slate-800 transition-colors hidden sm:inline-flex min-h-[38px] min-w-[38px] items-center justify-center"
              title="Keyboard Shortcuts (⌘/ or ?)"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenHackathonBuilder && (
            <button
              type="button"
              id="header-hackathon-builder-page-btn"
              onClick={onOpenHackathonBuilder}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-200 text-xs font-medium shadow-xs transition-all min-h-[38px]"
              title="Open full 12-section Hackathon Project Builder"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">12-Step Builder</span>
            </button>
          )}

          {isHackathon ? (
            <button
              type="button"
              id="header-hackathon-suite-btn"
              onClick={onOpenHackathon}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-medium shadow-xs transition-all min-h-[38px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Suite</span>
            </button>
          ) : (
            <button
              type="button"
              id="header-tools-btn"
              onClick={onOpenTools}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-all min-h-[38px]"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Tools</span>
            </button>
          )}

          <button
            type="button"
            id="header-export-btn"
            onClick={() => setIsExportModalOpen(true)}
            disabled={messages.length === 0}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Export conversation history (JSON or Markdown)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClearConversation}
            disabled={messages.length === 0 || isReadOnly}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-40 min-h-[38px] min-w-[38px] flex items-center justify-center"
            title={isReadOnly ? 'Conversation is locked (read-only)' : 'Clear current messages'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* In-Chat Search Filter Bar */}
      {isSearchOpen && (
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-slate-800/90 bg-[#0d1322]/95 backdrop-blur-md text-xs z-10 animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              id="in-chat-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (e.shiftKey) prevMatch();
                  else nextMatch();
                } else if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  setFilterOnlyMatches(false);
                }
              }}
              placeholder="Search within this chat... (Enter / Shift+Enter to cycle)"
              className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-full"
            />
            {searchQuery && (
              <span className="text-[11px] font-mono text-slate-400 shrink-0 bg-slate-800/80 px-2 py-0.5 rounded">
                {matchedMessageIds.length > 0
                  ? `${currentMatchIdx + 1} of ${matchedMessageIds.length}`
                  : '0 matches'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button
              type="button"
              onClick={prevMatch}
              disabled={matchedMessageIds.length <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
              title="Previous match (Shift+Enter)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMatch}
              disabled={matchedMessageIds.length <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
              title="Next match (Enter)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFilterOnlyMatches((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] border font-medium flex items-center gap-1 transition-all ${
                filterOnlyMatches
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Show only matching messages"
            >
              <Filter className="w-3 h-3" />
              <span>Only Matches</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
                setFilterOnlyMatches(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors ml-1"
              title="Close search (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 space-y-2">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto my-auto py-12 text-center">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl ${
                isHackathon
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-600/30'
                  : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-600/30'
              }`}
            >
              {isHackathon ? <Sparkles className="w-7 h-7" /> : <Cpu className="w-7 h-7" />}
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {isHackathon ? 'Hackathon Builder Workspace' : 'How can I assist your AI infrastructure?'}
            </h2>
            <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto">
              {isHackathon
                ? 'Design cutting-edge AI projects, generate roadmaps, write starter code, and prepare winning judge pitches for the AI Infra Summit.'
                : 'Analyze serving architectures, debug CUDA OOM errors, optimize vLLM inference clusters, and configure enterprise RAG pipelines.'}
            </p>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {[
                {
                  title: isHackathon ? 'Idea Generator' : 'vLLM Multi-GPU Serving',
                  desc: isHackathon
                    ? 'Brainstorm 4 innovative AI Infra Summit project concepts'
                    : 'Deploy Llama-3.1-70B on 4x L40S with FP8 KV-caching',
                  prompt: isHackathon
                    ? 'Brainstorm 4 award-winning AI Infra Summit hackathon project ideas focusing on autonomous infrastructure and developer productivity.'
                    : 'Provide the production launch configuration and docker-compose for serving Llama-3.1-70B using vLLM with FP8 KV-cache and chunked prefill across 4x GPUs.',
                },
                {
                  title: isHackathon ? '36-Hour Sprint Roadmap' : 'CUDA Memory Debugger',
                  desc: isHackathon
                    ? 'Step-by-step milestone timeline for the hackathon'
                    : 'Diagnose and fix PyTorch CUDA Out-Of-Memory errors',
                  prompt: isHackathon
                    ? 'Generate a detailed 36-hour hackathon development roadmap with hourly milestones and risk mitigations.'
                    : 'How do I diagnose and resolve a CUDA out-of-memory error during long-context batch inference?',
                },
                {
                  title: isHackathon ? 'Starter Code Boilerplate' : 'Hybrid RAG Architecture',
                  desc: isHackathon
                    ? 'FastAPI + Docker + streaming AI endpoint template'
                    : 'Setup Qdrant + BM25 + BGE Reranker pipeline',
                  prompt: isHackathon
                    ? 'Generate a production-grade hackathon starter kit with FastAPI backend, Docker compose, and streaming Gemini client.'
                    : 'Design a hybrid RAG pipeline combining dense embeddings, BM25 sparse search, and a Cohere/BGE cross-encoder reranker in Python.',
                },
                {
                  title: isHackathon ? 'Judge Pitch Script' : 'Quantization & Cost Tuning',
                  desc: isHackathon
                    ? '2-minute stage script and 5-slide outline'
                    : 'AWQ vs GPTQ vs FP8 cost & throughput analysis',
                  prompt: isHackathon
                    ? 'Write a compelling 2-minute stage pitch and 5-slide deck outline for an AI infrastructure project.'
                    : 'Compare AWQ, GPTQ, and FP8 quantization for production LLM serving in terms of throughput, VRAM savings, and perplexity loss.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="p-3.5 rounded-xl bg-[#0e1322] hover:bg-[#131b2e] border border-slate-800 hover:border-slate-700/80 cursor-pointer transition-all shadow-sm group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </span>
                    <Zap className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {filterOnlyMatches && displayedMessages.length === 0 && (
              <div className="text-center py-12 px-4 bg-slate-900/40 rounded-2xl border border-slate-800 my-6">
                <Search className="w-8 h-8 text-slate-500 mx-auto mb-3 opacity-60" />
                <h3 className="text-sm font-semibold text-white mb-1">
                  No messages found
                </h3>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  No messages in this chat match <span className="text-blue-300 font-medium">"{searchQuery}"</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setFilterOnlyMatches(false)}
                  className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  Show All Messages
                </button>
              </div>
            )}

            {displayedMessages.map((msg) => {
              const isMatch =
                Boolean(searchQuery.trim()) &&
                msg.content.toLowerCase().includes(searchQuery.toLowerCase());
              const isCurrent =
                matchedMessageIds.length > 0 &&
                matchedMessageIds[currentMatchIdx] === msg.id;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRetry={onRetryMessage}
                  searchQuery={searchQuery}
                  isSearchMatch={isMatch}
                  isCurrentMatch={isCurrent}
                />
              );
            })}

            {isLoading && (
              <LoadingIndicator
                mode={mode}
                statusText={
                  isHackathon
                    ? 'Synthesizing hackathon blueprint...'
                    : 'Computing infrastructure recommendations...'
                }
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Prompt Input */}
      <div className="border-t border-slate-800/80 bg-[#0a0d16]/90 backdrop-blur-sm pt-2">
        <PromptInput
          onSendMessage={onSendMessage}
          onStopGeneration={onStopGeneration}
          isLoading={isLoading}
          mode={mode}
          model={model}
          onOpenTools={onOpenTools}
          isReadOnly={isReadOnly}
          onUnlockConversation={
            conversation && onToggleReadOnly
              ? () => onToggleReadOnly(conversation.id)
              : undefined
          }
        />
      </div>

      {/* Export Conversation Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        conversation={conversation}
        messages={messages}
      />
    </div>
  );
};
