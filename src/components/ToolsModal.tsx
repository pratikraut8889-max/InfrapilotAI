import React, { useState } from 'react';
import { X, Layers, Zap, Bug, Database, Rocket, Sparkles, Copy, Check, MessageSquareShare } from 'lucide-react';
import { ToolType } from '../types';
import { ApiService } from '../services/api';
import { AnalyticsService } from '../services/analytics';
import { CodeBlock } from './CodeBlock';
import Markdown from 'react-markdown';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: ToolType;
  onInsertToChat: (text: string) => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  initialTool = 'architecture',
  onInsertToChat,
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [archParams, setArchParams] = useState({
    useCase: 'High-throughput LLM API gateway with RAG & Semantic Cache',
    throughput: '250 req/sec peak',
    latency: '< 200ms TTFT',
    hardware: 'Self-hosted vLLM on 4x NVIDIA L40S (48GB each)',
    modality: 'Multimodal (Text + Document OCR)',
  });

  const [promptParams, setPromptParams] = useState({
    rawPrompt: 'Write a python script that calls Gemini to extract key parameters from server logs and alerts if errors spike.',
    targetModel: 'gemini-3.8-flash',
    outputFormat: 'Strict JSON schema with Pydantic model',
    constraints: 'Zero hallucinations, robust error handling, fast latency',
  });

  const [debugParams, setDebugParams] = useState({
    errorLogs: `torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 2.40 GiB (GPU 0; 23.69 GiB total capacity; 21.80 GiB already allocated; 1.20 GiB free; 22.00 GiB reserved in total by PyTorch)
  File "/workspace/serving/vllm_server.py", line 142, in generate
    output = model.generate(input_ids, max_tokens=4096)`,
    context: 'vLLM v0.6.2 running Llama-3.1-70B AWQ on 2x A10G with tensor-parallel-size=2',
  });

  const [ragParams, setRagParams] = useState({
    source: '50,000 PDF enterprise technical manuals and internal code repositories',
    updateFrequency: 'Daily batch updates + real-time webhook updates',
    queryComplexity: 'Multi-hop technical queries requiring code verification',
    compliance: 'Strict On-Prem / VPC isolation with RBAC',
  });

  const [deployParams, setDeployParams] = useState({
    modelName: 'Qwen2.5-Coder-32B-Instruct',
    targetEnv: 'Kubernetes on RunPod / Cloud GPU cluster with 4x A100 (80GB)',
    load: '100 concurrent engineering team queries with streaming responses',
  });

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsLoading(true);
    setResult('');
    AnalyticsService.track('run_tool', { tool: activeTool });
    try {
      let params = {};
      if (activeTool === 'architecture') params = archParams;
      if (activeTool === 'prompt_opt') params = promptParams;
      if (activeTool === 'debugger') params = debugParams;
      if (activeTool === 'rag_planner') params = ragParams;
      if (activeTool === 'deploy_checklist') params = deployParams;

      const res = await ApiService.runTool(activeTool, params);
      setResult(res.content);
      AnalyticsService.track('tool_success', { tool: activeTool });
    } catch (err: any) {
      setResult(`### Error\nFailed to generate tool output: ${err.message || 'Unknown error'}`);
      AnalyticsService.track('tool_error', { tool: activeTool, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    AnalyticsService.track('copy_tool_output', { tool: activeTool });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    if (!result) return;
    AnalyticsService.track('insert_tool_to_chat', { tool: activeTool });
    onInsertToChat(`[From ${activeTool.toUpperCase()} Tool]:\n\n${result}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="tools-modal-container"
        className="w-full max-w-5xl h-[90vh] bg-[#0c111d] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0f1524]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                AI Infrastructure Tools
              </h2>
              <p className="text-xs text-slate-400">
                Specialized generators for cloud architectures, RAG pipelines, prompt hardening, and GPU debugging
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-800/60 bg-[#090d16] overflow-x-auto">
          {[
            { id: 'architecture', label: 'Architecture Generator', icon: Layers },
            { id: 'prompt_opt', label: 'Prompt Optimizer', icon: Zap },
            { id: 'debugger', label: 'Debugging Assistant', icon: Bug },
            { id: 'rag_planner', label: 'RAG Project Planner', icon: Database },
            { id: 'deploy_checklist', label: 'Deployment Checklist', icon: Rocket },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTool(tab.id as ToolType);
                  setResult('');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body: Split into Form Inputs and Result */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Input Form (5 cols) */}
          <div className="lg:col-span-5 p-6 border-r border-slate-800/60 overflow-y-auto bg-[#0b0f1a] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tool Parameters
            </h3>

            {/* Form Fields for Architecture */}
            {activeTool === 'architecture' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Use Case & Goal</label>
                  <textarea
                    value={archParams.useCase}
                    onChange={(e) => setArchParams({ ...archParams, useCase: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Peak Throughput</label>
                  <input
                    type="text"
                    value={archParams.throughput}
                    onChange={(e) => setArchParams({ ...archParams, throughput: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Latency (TTFT)</label>
                  <input
                    type="text"
                    value={archParams.latency}
                    onChange={(e) => setArchParams({ ...archParams, latency: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Hardware & GPUs</label>
                  <input
                    type="text"
                    value={archParams.hardware}
                    onChange={(e) => setArchParams({ ...archParams, hardware: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Form Fields for Prompt Optimizer */}
            {activeTool === 'prompt_opt' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Raw / Draft Prompt</label>
                  <textarea
                    value={promptParams.rawPrompt}
                    onChange={(e) => setPromptParams({ ...promptParams, rawPrompt: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Model</label>
                  <input
                    type="text"
                    value={promptParams.targetModel}
                    onChange={(e) => setPromptParams({ ...promptParams, targetModel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Specific Constraints & Formatting</label>
                  <input
                    type="text"
                    value={promptParams.constraints}
                    onChange={(e) => setPromptParams({ ...promptParams, constraints: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Form Fields for Debugger */}
            {activeTool === 'debugger' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Error Logs / Stack Trace</label>
                  <textarea
                    value={debugParams.errorLogs}
                    onChange={(e) => setDebugParams({ ...debugParams, errorLogs: e.target.value })}
                    rows={6}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-rose-300 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Environment Context</label>
                  <input
                    type="text"
                    value={debugParams.context}
                    onChange={(e) => setDebugParams({ ...debugParams, context: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Form Fields for RAG Planner */}
            {activeTool === 'rag_planner' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Document Corpus & Volume</label>
                  <input
                    type="text"
                    value={ragParams.source}
                    onChange={(e) => setRagParams({ ...ragParams, source: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Update Frequency</label>
                  <input
                    type="text"
                    value={ragParams.updateFrequency}
                    onChange={(e) => setRagParams({ ...ragParams, updateFrequency: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Query Complexity & Modality</label>
                  <input
                    type="text"
                    value={ragParams.queryComplexity}
                    onChange={(e) => setRagParams({ ...ragParams, queryComplexity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Form Fields for Deployment Checklist */}
            {activeTool === 'deploy_checklist' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Model Name / Architecture</label>
                  <input
                    type="text"
                    value={deployParams.modelName}
                    onChange={(e) => setDeployParams({ ...deployParams, modelName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Infrastructure</label>
                  <input
                    type="text"
                    value={deployParams.targetEnv}
                    onChange={(e) => setDeployParams({ ...deployParams, targetEnv: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Expected Load Profile</label>
                  <input
                    type="text"
                    value={deployParams.load}
                    onChange={(e) => setDeployParams({ ...deployParams, load: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              id="run-tool-btn"
              onClick={handleRun}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating Specification...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run AI Generator
                </>
              )}
            </button>
          </div>

          {/* Right Column: Generated Output (7 cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col bg-[#070a11] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">
                Generated Result & Artifacts
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
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-xs transition-colors"
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
                  <Sparkles className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-xs font-mono">Synthesizing production specifications...</p>
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
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3 text-slate-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-1">
                    Ready to Generate
                  </h4>
                  <p className="text-xs max-w-sm">
                    Configure your parameters on the left and click &quot;Run AI Generator&quot; to produce production-grade specifications, architectures, or debugging fixes.
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
