import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Sparkles, Cpu, Terminal, FileText, CornerDownLeft, Lock, Unlock } from 'lucide-react';
import { ChatMode } from '../types';

interface PromptInputProps {
  onSendMessage: (text: string) => void;
  onStopGeneration?: () => void;
  isLoading: boolean;
  mode: ChatMode;
  model: string;
  onOpenTools?: () => void;
  isReadOnly?: boolean;
  onUnlockConversation?: () => void;
}

const DEV_PRESETS = [
  '⚡ Deploy vLLM with FP8 KV-Cache',
  '🚨 Fix CUDA Out of Memory Error',
  '🔍 Design Hybrid RAG with Qdrant',
  '🐳 Dockerize FastAPI + PyTorch',
];

const HACKATHON_PRESETS = [
  '💡 Brainstorm winning AI Infra Hackathon ideas',
  '⏱️ Generate a 36-hour sprint roadmap',
  '🚀 Create FastAPI + LangChain starter kit',
  '🎤 Draft a 2-minute stage pitch for judges',
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isLoading,
  mode,
  model,
  onOpenTools,
  isReadOnly = false,
  onUnlockConversation,
}) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const presets = mode === 'hackathon' ? HACKATHON_PRESETS : DEV_PRESETS;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isReadOnly || !prompt.trim() || isLoading) return;
    onSendMessage(prompt.trim());
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePresetClick = (presetText: string) => {
    if (isReadOnly) return;
    // Remove leading emoji and trim
    const cleanText = presetText.replace(/^[\p{Emoji}\s]+/u, '').trim();
    setPrompt(cleanText);
    textareaRef.current?.focus();
  };

  const handleInsertSampleError = () => {
    if (isReadOnly) return;
    setPrompt(
      `Diagnose this error:
torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 2.40 GiB (GPU 0; 23.69 GiB total capacity; 21.80 GiB already allocated; 1.20 GiB free; 22.00 GiB reserved in total by PyTorch)
Running Llama-3.1-70B on 2x A10G with vLLM.`
    );
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {isReadOnly ? (
        <div className="rounded-2xl bg-[#13120c] border border-amber-800/80 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/90 border border-amber-700/80 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-amber-200 flex items-center gap-1.5 justify-center sm:justify-start">
                Conversation is in Read-Only Mode
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                  Protected
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                New messages and edits are locked to prevent accidental modifications to this archive.
              </p>
            </div>
          </div>

          {onUnlockConversation && (
            <button
              type="button"
              id="unlock-conversation-btn"
              onClick={onUnlockConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition-all shrink-0 active:scale-95"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Session</span>
            </button>
          )}
        </div>
      ) : (
        <>
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1 shrink-0">
          <Terminal className="w-3 h-3 text-slate-400" />
          Quick:
        </span>
        {presets.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetClick(item)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 shadow-sm"
          >
            <span>{item}</span>
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <div className="relative rounded-2xl bg-[#0f1523] border border-slate-800 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-xl">
        <textarea
          ref={textareaRef}
          id="main-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'hackathon'
              ? 'Ask for hackathon project ideas, architecture roadmaps, starter code, or demo pitch scripts...'
              : 'Ask about vLLM, CUDA OOMs, RAG pipelines, quantization, Docker manifests, or paste error logs...'
          }
          rows={1}
          className="w-full bg-transparent px-4 pt-3.5 pb-12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none min-h-[56px] max-h-[180px] leading-relaxed"
        />

        {/* Input Bar Controls */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Left Badges */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                mode === 'hackathon'
                  ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                  : 'bg-blue-950/60 border-blue-800 text-blue-300'
              }`}
            >
              {mode === 'hackathon' ? (
                <>
                  <Sparkles className="w-3 h-3" />
                  Hackathon Mode
                </>
              ) : (
                <>
                  <Cpu className="w-3 h-3" />
                  Dev Assistant
                </>
              )}
            </span>

            <span className="hidden sm:inline-flex text-[11px] text-slate-400 font-mono">
              {model}
            </span>

            <button
              type="button"
              onClick={handleInsertSampleError}
              title="Insert sample CUDA OOM log to test"
              className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-3 h-3" />
              Sample Log
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {isLoading && onStopGeneration && (
              <button
                type="button"
                id="stop-generation-btn"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-medium shadow-md shadow-rose-600/30 transition-all active:scale-95"
                title="Stop generation"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Stop</span>
              </button>
            )}

            <button
              type="button"
              id="send-prompt-btn"
              onClick={() => handleSubmit()}
              disabled={isLoading || !prompt.trim()}
              className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all shadow-md active:scale-95 ${
                isLoading || !prompt.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : mode === 'hackathon'
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white shadow-purple-500/30'
                  : 'bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/30'
              }`}
              title={isLoading ? 'Generating AI response...' : 'Send message (Enter)'}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tip footer */}
      <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <CornerDownLeft className="w-3 h-3" />
          <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px]">Shift+Enter</kbd> for newline
        </span>
        {onOpenTools && (
          <button
            type="button"
            onClick={onOpenTools}
            className="hover:text-blue-400 underline decoration-dotted transition-colors"
          >
            Launch AI Infra Tools →
          </button>
        )}
      </div>
    </>
  )}
</div>
  );
};
