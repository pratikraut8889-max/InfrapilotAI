import React from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  Zap,
  Bug,
  Database,
  Rocket,
  ArrowRight,
  Terminal,
  Shield,
  Clock,
  Code2,
  Server,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { ToolType } from '../types';
import { ToolCard } from './ToolCard';

interface LandingPageProps {
  onStartBuilding: () => void;
  onExploreTool: (tool: ToolType) => void;
  onOpenHackathon: () => void;
  onOpenHackathonBuilder?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBuilding,
  onExploreTool,
  onOpenHackathon,
  onOpenHackathonBuilder,
}) => {
  const handleOpenBuilder = onOpenHackathonBuilder || onOpenHackathon;
  return (
    <div id="landing-page-root" className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none -z-0">
        <div className="absolute top-[-150px] left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[-100px] right-1/4 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[140px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center z-10">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-lg mb-8 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            AI Infra Summit Hackathon 2026
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-medium text-blue-400 flex items-center gap-1">
            Powered by Gemini 3.8 Flash
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Build Smarter{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            AI Infrastructure.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Your AI-powered developer assistant for building, debugging, and deploying intelligent applications.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            type="button"
            id="landing-cta-start-building"
            onClick={onStartBuilding}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="landing-cta-explore-tools"
            onClick={() => onExploreTool('architecture')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 shadow-md flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Explore AI Tools</span>
          </button>

          <button
            type="button"
            id="landing-cta-hackathon-builder"
            onClick={handleOpenBuilder}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 hover:text-white font-semibold text-sm border border-purple-800/60 shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Hackathon Builder Suite</span>
          </button>
        </div>

        {/* Interactive Interactive Preview Terminal Card */}
        <div className="relative rounded-2xl border border-slate-800/90 bg-[#0b101c] shadow-2xl shadow-blue-500/5 overflow-hidden text-left max-w-4xl mx-auto">
          {/* Terminal Window Chrome */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f1526] border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-xs font-mono text-slate-400">
                infrapilot-core --vllm-cluster --telemetry
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>CLUSTER HEALTHY (4x L40S)</span>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-6 font-mono text-xs sm:text-sm space-y-4 overflow-x-auto text-slate-300">
            <div className="text-slate-400">
              <span className="text-blue-400 font-bold">dev@infrapilot:~$</span> infrapilot optimize --target vllm --model meta-llama/Llama-3.1-70B --gpus 4
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 space-y-2">
              <p className="text-emerald-400 font-semibold flex items-center gap-2">
                ✓ Auto-Detected Hardware: 4x NVIDIA L40S (192 GB total VRAM)
              </p>
              <p className="text-slate-300">
                • Model Weight Footprint (AWQ 4-bit): <span className="text-amber-300">38.2 GB</span>
              </p>
              <p className="text-slate-300">
                • Allocated KV-Cache (FP8 chunked prefill): <span className="text-blue-400">124.8 GB (~98,000 concurrent tokens)</span>
              </p>
              <p className="text-slate-300">
                • Projected Throughput: <span className="text-purple-300 font-bold">540 tokens/sec</span> | Median TTFT: <span className="text-emerald-300 font-bold">114ms</span>
              </p>
            </div>

            <div className="text-slate-400">
              <span className="text-blue-400 font-bold">dev@infrapilot:~$</span> <span className="text-slate-200"># Launching production container with Prometheus metrics...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
            Designed for AI Systems Engineers
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to conceptualize, benchmark, containerize, and debug production AI workloads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ToolCard
            type="architecture"
            title="AI Architecture Generator"
            description="Create end-to-end cloud and GPU cluster blueprints with VRAM sizing, component breakdowns, and latency estimates."
            badge="Serving & Cloud"
            onClick={() => onExploreTool('architecture')}
          />

          <ToolCard
            type="debugger"
            title="AI Debugging Assistant"
            description="Paste CUDA stack traces, PyTorch OOM logs, or vLLM timeout errors for root-cause diagnosis and instant fixes."
            badge="Zero Downtime"
            onClick={() => onExploreTool('debugger')}
          />

          <ToolCard
            type="rag_planner"
            title="RAG Project Planner"
            description="Architect enterprise retrieval pipelines: semantic chunking, vector database comparison, and cross-encoder reranking."
            badge="Vector & Embeddings"
            onClick={() => onExploreTool('rag_planner')}
          />

          <ToolCard
            type="prompt_opt"
            title="Prompt Hardening Optimizer"
            description="Convert raw developer ideas into structured, XML-delimited, few-shot production system prompts with strict validation."
            badge="Reliability"
            onClick={() => onExploreTool('prompt_opt')}
          />

          <ToolCard
            type="deploy_checklist"
            title="Deployment & VRAM Checklist"
            description="Generate Docker manifests, Kubernetes deployments, health-probe scripts, and FP8 quantization configs."
            badge="Production Ready"
            onClick={() => onExploreTool('deploy_checklist')}
          />

          <div
            onClick={handleOpenBuilder}
            className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-indigo-950/30 hover:from-purple-900/50 hover:to-indigo-900/40 border border-purple-800/60 hover:border-purple-600/80 transition-all cursor-pointer shadow-lg active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-800/60 flex items-center justify-center border border-purple-600/50 text-purple-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-800/80 text-purple-200 border border-purple-600/60 font-mono">
                  Hackathon Mode
                </span>
              </div>

              <h3 className="text-base font-semibold text-white mb-1.5">
                Hackathon Builder Suite
              </h3>
              <p className="text-xs text-purple-200/70 leading-relaxed">
                Ideate winning concepts, generate 36-hour sprint roadmaps, scaffold starter code, and polish 2-minute judge pitch decks.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-purple-800/40 text-xs text-purple-300 font-medium group-hover:text-purple-200">
              <span>Open Hackathon Suite</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* AI Infrastructure Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10 border-t border-slate-800/60">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
            The AI Infrastructure Workflow
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            From initial topology to high-throughput scale in four structured phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Design & Sizing',
              desc: 'Select base models, calculate KV-cache and VRAM budgets, and map multi-GPU tensor parallel topologies.',
              icon: Layers,
              color: 'text-blue-400',
            },
            {
              step: '02',
              title: 'Prototype & Scaffolding',
              desc: 'Generate production starter templates with FastAPI, LangChain, streaming endpoints, and vector search.',
              icon: Code2,
              color: 'text-indigo-400',
            },
            {
              step: '03',
              title: 'Deploy & Serve',
              desc: 'Containerize with vLLM, TensorRT-LLM, or Triton. Launch on Kubernetes, RunPod, or serverless GPU clusters.',
              icon: Server,
              color: 'text-purple-400',
            },
            {
              step: '04',
              title: 'Optimize & Debug',
              desc: 'Apply AWQ/FP8 quantization, chunked prefill, resolve memory fragmentation, and monitor TTFT latency metrics.',
              icon: Zap,
              color: 'text-amber-400',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-5 rounded-2xl bg-[#0c101d] border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-slate-700">
                      {item.step}
                    </span>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#060810] py-12 px-4 sm:px-6 lg:px-8 z-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-200">
              InfraPilot AI
            </span>
            <span>•</span>
            <span>AI Infra Summit Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onStartBuilding}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Launch Chat
            </button>
            <button
              type="button"
              onClick={() => onExploreTool('architecture')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Architecture Tool
            </button>
            <button
              type="button"
              onClick={onOpenHackathon}
              className="text-slate-400 hover:text-purple-300 transition-colors"
            >
              Hackathon Suite
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Systems Online • Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
