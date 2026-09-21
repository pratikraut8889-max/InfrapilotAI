import React, { useState } from 'react';
import { X, Sparkles, Lightbulb, Clock, Code, Presentation, Copy, Check, MessageSquareShare, ArrowRight } from 'lucide-react';
import { ApiService } from '../services/api';
import Markdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';

interface HackathonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat: (content: string) => void;
  onOpenFullBuilder?: () => void;
}

export const HackathonPanel: React.FC<HackathonPanelProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
  onOpenFullBuilder,
}) => {
  const [activeTab, setActiveTab] = useState<'ideate' | 'roadmap' | 'starter_kit' | 'pitch'>('ideate');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Parameters
  const [projectName, setProjectName] = useState('InfraPulse');
  const [category, setCategory] = useState('Autonomous AI Agents & Infrastructure Optimization');
  const [description, setDescription] = useState('Real-time LLM inference auto-tuner & self-healing proxy');

  if (!isOpen) return null;

  const handleGenerate = async (action = activeTab) => {
    setIsLoading(true);
    setResult('');
    try {
      const res = await ApiService.runHackathonAction(action, {
        projectName,
        category,
        description,
      });
      setResult(res.content);
    } catch (err: any) {
      setResult(`### Error\nFailed to generate hackathon asset: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    if (!result) return;
    onInsertToChat(`[Hackathon Builder - ${activeTab.toUpperCase()}]:\n\n${result}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="hackathon-panel-container"
        className="w-full max-w-5xl h-[88vh] bg-[#0c101c] border border-purple-900/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-[#121626]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  Hackathon Builder Suite
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI Infra Summit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rapidly prototype, architect, and pitch winning AI infrastructure hackathon projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenFullBuilder && (
              <button
                type="button"
                id="hackathon-panel-open-builder-page-btn"
                onClick={() => {
                  onClose();
                  onOpenFullBuilder();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>12-Section Project Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-800/60 bg-[#0a0d17] overflow-x-auto">
          {[
            { id: 'ideate', label: '1. Project Ideas', icon: Lightbulb },
            { id: 'roadmap', label: '2. 36-Hr Roadmap', icon: Clock },
            { id: 'starter_kit', label: '3. Starter Boilerplate', icon: Code },
            { id: 'pitch', label: '4. Pitch & Demo Deck', icon: Presentation },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setResult('');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content: Config Form + Output */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Controls column */}
          <div className="lg:col-span-4 p-5 border-r border-slate-800/60 bg-[#0e1220] overflow-y-auto space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Project Context
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Hackathon Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Autonomous AI Agents & Infrastructure Optimization">Autonomous AI Agents & Infra</option>
                  <option value="High-Throughput Model Serving & Quantization">Serving & Quantization</option>
                  <option value="Enterprise RAG & Hybrid Vector Retrieval">Enterprise RAG & Vectors</option>
                  <option value="Observability, Cost & Latency Profiling">Observability & Cost Profiling</option>
                  <option value="Edge AI & WebGPU Distributed Inference">Edge AI & WebGPU</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">One-Line Pitch / Target</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="button"
              id="generate-hackathon-asset-btn"
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating Hackathon Asset...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {activeTab.replace('_', ' ').toUpperCase()}
                </>
              )}
            </button>
          </div>

          {/* Results column */}
          <div className="lg:col-span-8 p-6 flex flex-col bg-[#080b13] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">
                Generated Hackathon Deliverable
              </span>
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendToChat}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600/80 hover:bg-purple-600 text-white text-xs transition-colors"
                  >
                    <MessageSquareShare className="w-3.5 h-3.5" />
                    <span>Send to Chat</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pt-4 text-sm leading-relaxed">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-xs font-mono">Synthesizing hackathon blueprint...</p>
                </div>
              ) : result ? (
                <div className="markdown-content text-[13px]">
                  <Markdown
                    components={{
                      code(props: any) {
                        const { children, className, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const codeText = String(children || '').replace(/\n$/, '');
                        const isMultiLine = codeText.includes('\n');
                        if (match || isMultiLine) {
                          return <CodeBlock language={match ? match[1] : 'bash'} code={codeText} />;
                        }
                        return <code className={className} {...rest}>{children}</code>;
                      },
                    }}
                  >
                    {result}
                  </Markdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center mb-3 text-purple-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-1">
                    Hackathon Ready
                  </h4>
                  <p className="text-xs max-w-sm">
                    Select any phase above (Project Ideas, 36-Hr Roadmap, Starter Code, or Pitch Deck) and click &quot;Generate&quot; to build an award-winning submission.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
