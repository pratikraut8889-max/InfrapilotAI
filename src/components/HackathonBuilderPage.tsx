import React, { useState, useRef, useEffect, useMemo } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Terminal,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Code2,
  Rocket,
  ShieldCheck,
  Presentation,
  Film,
  Lightbulb,
  AlertCircle,
  FileText,
  Clock,
  Square,
  MessageSquare,
  Sliders,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { HackathonProjectInputs, ExperienceLevel } from '../types';
import { ApiService } from '../services/api';
import { CodeBlock } from './CodeBlock';

interface HackathonBuilderPageProps {
  onNavigateToChat: (initialPrompt?: string) => void;
  onOpenSettings?: () => void;
}

interface SectionItem {
  number: number;
  title: string;
  icon: React.ReactNode;
  content: string;
  summary: string;
}

const SECTION_METADATA: Array<{ number: number; title: string; summary: string }> = [
  { number: 1, title: 'Project Name', summary: 'Name, punchy tagline, and judge hook' },
  { number: 2, title: 'Problem Statement', summary: 'Pain point, industry gap, and developer friction' },
  { number: 3, title: 'Solution Explanation', summary: 'Core workflow, architecture value, and user journey' },
  { number: 4, title: 'Unique Innovation', summary: 'Secret sauce, moat, and competitive advantage' },
  { number: 5, title: 'System Architecture', summary: 'ASCII diagram, dataflow, and component topology' },
  { number: 6, title: 'Technology Stack', summary: 'Frontend, Gemini models, vector DB, serving, infra' },
  { number: 7, title: 'Development Roadmap', summary: '36-hour sprint schedule across 5 phases' },
  { number: 8, title: 'Starter Code', summary: 'Runnable boilerplate, server setup, and Gemini integration' },
  { number: 9, title: 'Testing Plan', summary: 'Benchmark test, TTFT measurement, and edge cases' },
  { number: 10, title: 'Deployment Instructions', summary: 'Docker compose, environment vars, and cloud run' },
  { number: 11, title: 'Hackathon Pitch', summary: '30s elevator hook, 2-min stage script, judge Q&A' },
  { number: 12, title: 'Demo Script', summary: 'Minute-by-minute live presentation walkthrough' },
];

const PRESET_IDEAS: Array<{
  name: string;
  badge: string;
  idea: string;
  problem: string;
  users: string;
  techs: string[];
  level: ExperienceLevel;
}> = [
  {
    name: 'Autonomous LLM Caching Gateway',
    badge: 'Infra & Optimization',
    idea: 'A high-performance semantic proxy for Gemini that routes queries based on prompt complexity, deduplicates embedding lookups, and automatically detects hallucinated outputs.',
    problem: 'Generative AI applications waste 40% of their API budgets on redundant prompts and experience unpredictable TTFT latency spikes during traffic bursts.',
    users: 'AI Engineers, Platform Tech Leads, Hackathon Teams',
    techs: ['Gemini API', 'Python / FastAPI', 'Redis', 'Docker', 'TypeScript / React', 'Qdrant Vector DB'],
    level: 'intermediate',
  },
  {
    name: 'Real-Time CUDA OOM Diagnoser',
    badge: 'GPU & Reliability',
    idea: 'An observability sidecar that monitors GPU VRAM allocations, intercepts PyTorch/vLLM allocation calls, and auto-adjusts KV-cache batch sizes before an Out-Of-Memory crash occurs.',
    problem: 'Distributed training and multi-tenant inference runs crash unexpectedly with cryptic CUDA OOM errors, wasting costly GPU-hours and halting demo deployments.',
    users: 'MLOps Engineers, LLM Serving Specialists, Hackathon Judges',
    techs: ['Gemini API', 'PyTorch', 'vLLM', 'Docker', 'Python / FastAPI', 'Prometheus'],
    level: 'advanced',
  },
  {
    name: 'Edge-Native Multimodal Agent',
    badge: 'Agents & Multimodal',
    idea: 'A lightweight assistant that streams camera frames and audio to Gemini 3.8 Flash, providing zero-latency industrial equipment inspection with automated maintenance ticket generation.',
    problem: 'Field engineers lack instant hands-free diagnostics for complex machinery, causing prolonged downtime and hazardous manual troubleshooting.',
    users: 'Field Technicians, Robotics Engineers, Operations Managers',
    techs: ['Gemini API', 'TypeScript / React', 'Tailwind CSS', 'Docker', 'FastAPI'],
    level: 'intermediate',
  },
  {
    name: 'vLLM Multi-GPU Autoscaler',
    badge: 'Serving & Scale',
    idea: 'An intelligent load balancer that dynamically spawns tensor-parallel vLLM instances and re-balances prefix-cached contexts to minimize TTFT and maximize token throughput.',
    problem: 'Static model serving clusters suffer from high cold-start latencies and resource fragmentation under fluctuating concurrency loads.',
    users: 'Inference Infrastructure Engineers, Cloud Architects',
    techs: ['Gemini API', 'vLLM', 'Kubernetes', 'Docker', 'Python / FastAPI', 'Redis'],
    level: 'advanced',
  },
];

const AVAILABLE_TECH_SUGGESTIONS = [
  'Gemini API',
  'TypeScript / React',
  'Python / FastAPI',
  'Docker',
  'Qdrant Vector DB',
  'Pinecone',
  'vLLM',
  'Redis',
  'PyTorch',
  'LangChain',
  'Tailwind CSS',
  'Kubernetes',
  'Prometheus',
  'PostgreSQL',
];

export const HackathonBuilderPage: React.FC<HackathonBuilderPageProps> = ({
  onNavigateToChat,
  onOpenSettings,
}) => {
  // Input State
  const [projectIdea, setProjectIdea] = useState(PRESET_IDEAS[0].idea);
  const [problemStatement, setProblemStatement] = useState(PRESET_IDEAS[0].problem);
  const [targetUsers, setTargetUsers] = useState(PRESET_IDEAS[0].users);
  const [preferredTechnologies, setPreferredTechnologies] = useState<string[]>(PRESET_IDEAS[0].techs);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(PRESET_IDEAS[0].level);
  const [customTechInput, setCustomTechInput] = useState('');

  // Touched state for validation messaging
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    projectIdea: true,
    problemStatement: true,
    targetUsers: true,
  });

  // Generation & Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgressStage, setGenerationProgressStage] = useState(0);
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>(() => {
    return localStorage.getItem('infrapilot_last_hackathon_project') || '';
  });
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'step' | 'document'>('step');
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedSection, setCopiedSection] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const [copiedDocSectionId, setCopiedDocSectionId] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const contentContainerRef = useRef<HTMLDivElement | null>(null);

  // Field validation checks
  const isIdeaValid = projectIdea.trim().length >= 5;
  const isProblemValid = problemStatement.trim().length >= 5;
  const isUsersValid = targetUsers.trim().length >= 3;
  const isTechValid = preferredTechnologies.length >= 1;
  const isFormValid = isIdeaValid && isProblemValid && isUsersValid && isTechValid;

  // Staged progress simulator during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && !generatedMarkdown) {
      setGenerationProgressStage(1);
      interval = setInterval(() => {
        setGenerationProgressStage((prev) => (prev < 4 ? prev + 1 : prev));
      }, 2400);
    } else {
      setGenerationProgressStage(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, generatedMarkdown]);

  // Parse markdown into 12 structured sections
  const parseSections = (markdown: string): SectionItem[] => {
    if (!markdown) return [];

    const sections: SectionItem[] = [];

    // Check for "## 1. ", "## 2. " pattern
    const regex = /##\s*(\d+)\.\s*([^\n\r]+)/g;
    const matches: Array<{ number: number; title: string; index: number }> = [];
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      matches.push({
        number: parseInt(match[1], 10),
        title: match[2].trim(),
        index: match.index,
      });
    }

    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];
        const startIndex = current.index;
        const endIndex = next ? next.index : markdown.length;
        const rawContent = markdown.slice(startIndex, endIndex).trim();

        // Remove heading line from section body for cleaner step rendering
        const contentLines = rawContent.split('\n');
        contentLines.shift(); // remove the "## X. Title" line
        const body = contentLines.join('\n').trim();

        const meta = SECTION_METADATA.find((m) => m.number === current.number);

        sections.push({
          number: current.number,
          title: current.title,
          summary: meta?.summary || 'Project blueprint component',
          icon: getSectionIcon(current.number),
          content: body || rawContent,
        });
      }
    } else {
      // Fallback if markdown doesn't have strict number headings yet (e.g. initial streaming)
      sections.push({
        number: 1,
        title: 'Project Blueprint',
        summary: 'Generated AI Infra Project Plan',
        icon: <Sparkles className="w-4 h-4 text-purple-400" />,
        content: markdown,
      });
    }

    return sections;
  };

  function getSectionIcon(num: number): React.ReactNode {
    switch (num) {
      case 1:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 2:
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 3:
        return <Lightbulb className="w-4 h-4 text-emerald-400" />;
      case 4:
        return <Rocket className="w-4 h-4 text-purple-400" />;
      case 5:
        return <Layers className="w-4 h-4 text-blue-400" />;
      case 6:
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 7:
        return <Clock className="w-4 h-4 text-indigo-400" />;
      case 8:
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 9:
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 10:
        return <Terminal className="w-4 h-4 text-amber-400" />;
      case 11:
        return <Presentation className="w-4 h-4 text-purple-400" />;
      case 12:
        return <Film className="w-4 h-4 text-rose-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  }

  const sections = parseSections(generatedMarkdown);
  const currentSection = sections[activeStepIndex] || sections[0];

  // Extract project title if present
  const extractProjectName = (md: string): string => {
    const match = md.match(/##\s*1\.\s*Project Name\s*\n+([^\n\r]+)/i);
    if (match && match[1]) {
      return match[1].replace(/^[#*>\s]+/, '').trim();
    }
    return 'AI Infra Summit Project';
  };

  const projectName = extractProjectName(generatedMarkdown);

  // Toggle technology selection tag
  const handleToggleTech = (tech: string) => {
    if (preferredTechnologies.includes(tech)) {
      setPreferredTechnologies(preferredTechnologies.filter((t) => t !== tech));
    } else {
      setPreferredTechnologies([...preferredTechnologies, tech]);
    }
  };

  // Add custom technology
  const handleAddCustomTech = () => {
    if (customTechInput.trim() && !preferredTechnologies.includes(customTechInput.trim())) {
      setPreferredTechnologies([...preferredTechnologies, customTechInput.trim()]);
      setCustomTechInput('');
    }
  };

  // Select Preset Idea
  const handleSelectPreset = (preset: (typeof PRESET_IDEAS)[0]) => {
    setProjectIdea(preset.idea);
    setProblemStatement(preset.problem);
    setTargetUsers(preset.users);
    setPreferredTechnologies(preset.techs);
    setExperienceLevel(preset.level);
    setTouchedFields({
      projectIdea: true,
      problemStatement: true,
      targetUsers: true,
    });
  };

  // Execute Gemini Project Generation
  const handleGenerateProject = async () => {
    if (!isFormValid || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedMarkdown('');
    setActiveStepIndex(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulated = '';

    await ApiService.buildHackathonProject(
      {
        projectIdea,
        problemStatement,
        targetUsers,
        preferredTechnologies,
        experienceLevel,
      },
      {
        onChunk: (chunk) => {
          accumulated += chunk;
          setGeneratedMarkdown(accumulated);
          localStorage.setItem('infrapilot_last_hackathon_project', accumulated);
        },
        onError: (err) => {
          setGenerationError(err);
          setIsGenerating(false);
          abortControllerRef.current = null;
        },
        onDone: () => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          if (accumulated) {
            localStorage.setItem('infrapilot_last_hackathon_project', accumulated);
          }
        },
      },
      abortController.signal
    );
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Copy Full Markdown
  const handleCopyFullMarkdown = async () => {
    if (!generatedMarkdown) return;
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2200);
    } catch (e) {
      console.error('Failed to copy markdown', e);
    }
  };

  // Copy Active Section
  const handleCopySection = async () => {
    if (!currentSection) return;
    try {
      const textToCopy = `## ${currentSection.number}. ${currentSection.title}\n\n${currentSection.content}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedSection(true);
      setTimeout(() => setCopiedSection(false), 2000);
    } catch (e) {
      console.error('Failed to copy section', e);
    }
  };

  // Extract raw code snippet from active section for direct IDE copy
  const handleCopyCodeToIDE = async () => {
    if (!currentSection) return;
    // Extract code between triple backticks
    const codeRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const codeBlocks: string[] = [];
    let match;
    while ((match = codeRegex.exec(currentSection.content)) !== null) {
      codeBlocks.push(match[1].trim());
    }

    const textToCopy = codeBlocks.length > 0 ? codeBlocks.join('\n\n/* --- Next Component / Script --- */\n\n') : currentSection.content;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedCodeSnippet(true);
      setTimeout(() => setCopiedCodeSnippet(false), 2000);
    } catch (e) {
      console.error('Failed to copy code to IDE', e);
    }
  };

  // Copy specific section from Document view
  const handleCopyDocumentSection = async (sec: SectionItem) => {
    try {
      const textToCopy = `## ${sec.number}. ${sec.title}\n\n${sec.content}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedDocSectionId(sec.number);
      setTimeout(() => setCopiedDocSectionId(null), 2000);
    } catch (e) {
      console.error('Failed to copy document section', e);
    }
  };

  // Download Markdown file with rich frontmatter
  const handleDownloadMarkdown = () => {
    if (!generatedMarkdown) return;
    const sanitizedTitle =
      projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'hackathon-project';
    const filename = `${sanitizedTitle}-blueprint.md`;

    const frontmatter = `---
title: "${projectName}"
event: "AI Infra Summit Hackathon 2026"
generated_by: "InfraPilot AI (Gemini 3.8 Flash)"
date: "${new Date().toISOString()}"
experience_level: "${experienceLevel}"
target_users: "${targetUsers}"
technologies: [${preferredTechnologies.map((t) => `"${t}"`).join(', ')}]
---

# ${projectName} - Comprehensive Technical Blueprint

`;

    const completeMarkdown = frontmatter + generatedMarkdown;
    const blob = new Blob([completeMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Send generated project into Chat Workspace
  const handleOpenInChat = () => {
    const prompt = `Here is our 36-Hour Hackathon Project Plan for "${projectName}":\n\n${generatedMarkdown}\n\nPlease act as our Tech Lead. Help me inspect the architecture, refine the starter code, and prepare for the live judge demonstration!`;
    onNavigateToChat(prompt);
  };

  // Progress percentage calculation
  const streamPercent = useMemo(() => {
    if (!isGenerating) return 100;
    if (!generatedMarkdown) return 10 + generationProgressStage * 18;
    return Math.min(96, Math.max(25, Math.round((sections.length / 12) * 100)));
  }, [isGenerating, generatedMarkdown, generationProgressStage, sections.length]);

  return (
    <div
      id="hackathon-builder-page-root"
      className="w-full h-full overflow-y-auto bg-[#070a12] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white"
    >
      {/* Top Banner Header */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#0e1322] via-[#090d19] to-[#070a12] px-4 sm:px-8 py-7">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-semibold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Infra Summit Hackathon Builder</span>
              <span className="text-purple-500">•</span>
              <span className="font-mono text-[11px] text-purple-400">Gemini 3.8 Flash Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Hackathon Project Builder
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Transform your raw idea into a complete, 12-section technical blueprint—including ASCII system architecture, runnable starter code, 36-hour sprint milestones, and judge pitch scripts.
            </p>
          </div>

          {/* Quick Stats or Navigation */}
          <div className="flex flex-wrap items-center gap-2.5">
            {generatedMarkdown && (
              <>
                <button
                  type="button"
                  id="hb-btn-copy-full"
                  onClick={handleCopyFullMarkdown}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition-all shadow-sm active:scale-95"
                  title="Copy complete 12-section Markdown blueprint"
                >
                  {copiedFull ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedFull ? 'Copied Full Plan!' : 'Copy Plan'}</span>
                </button>

                <button
                  type="button"
                  id="hb-btn-download-md"
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 text-purple-200 hover:text-white border border-purple-800/80 text-xs font-medium transition-all shadow-sm active:scale-95"
                  title="Download complete project plan as a Markdown (.md) file"
                >
                  {downloadSuccess ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Download className="w-4 h-4 text-purple-400" />
                  )}
                  <span>{downloadSuccess ? 'Downloaded!' : 'Download as Markdown'}</span>
                </button>

                <button
                  type="button"
                  id="hb-btn-send-to-chat"
                  onClick={handleOpenInChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all active:scale-95"
                  title="Load project into Chat Workspace"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuss in Chat</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-7 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Interactive Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b0f1d] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-sm text-slate-200 uppercase tracking-wider">
                1. Project Parameters
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleSelectPreset(PRESET_IDEAS[0])}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 hover:underline"
              title="Reset with recommended preset"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Preset
            </button>
          </div>

          {/* Preset Inspiration Chips */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Quick Presets & Inspiration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_IDEAS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-800/60 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono mb-1">
                    <span>{preset.badge}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="font-medium text-slate-200 line-clamp-1">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Project Idea Input */}
          <div>
            <label
              htmlFor="hb-input-idea"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1">
                <span>Project Idea</span>
                <span className="text-rose-400 font-bold">*</span>
              </span>
              {touchedFields.projectIdea && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isIdeaValid
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                      : 'text-rose-400 bg-rose-950/60 border border-rose-800/50'
                  }`}
                >
                  {isIdeaValid ? '✓ Valid' : 'Min 5 chars'}
                </span>
              )}
            </label>
            <textarea
              id="hb-input-idea"
              rows={3}
              value={projectIdea}
              onChange={(e) => {
                setProjectIdea(e.target.value);
                setTouchedFields((prev) => ({ ...prev, projectIdea: true }));
              }}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, projectIdea: true }))}
              placeholder="e.g. Autonomous LLM Proxy that caches embeddings and dynamically routes prompts to minimize latency..."
              className={`w-full bg-[#080c16] border rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors resize-none leading-relaxed ${
                !isIdeaValid && touchedFields.projectIdea
                  ? 'border-rose-700 focus:border-rose-500'
                  : 'border-slate-800 focus:border-purple-500'
              }`}
            />
          </div>

          {/* Problem Statement Input */}
          <div>
            <label
              htmlFor="hb-input-problem"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1">
                <span>Problem Statement</span>
                <span className="text-rose-400 font-bold">*</span>
              </span>
              {touchedFields.problemStatement && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isProblemValid
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                      : 'text-rose-400 bg-rose-950/60 border border-rose-800/50'
                  }`}
                >
                  {isProblemValid ? '✓ Valid' : 'Min 5 chars'}
                </span>
              )}
            </label>
            <textarea
              id="hb-input-problem"
              rows={2}
              value={problemStatement}
              onChange={(e) => {
                setProblemStatement(e.target.value);
                setTouchedFields((prev) => ({ ...prev, problemStatement: true }));
              }}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, problemStatement: true }))}
              placeholder="e.g. Generative AI applications waste 40% of API budgets on redundant queries and suffer unpredictable TTFT spikes..."
              className={`w-full bg-[#080c16] border rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors resize-none leading-relaxed ${
                !isProblemValid && touchedFields.problemStatement
                  ? 'border-rose-700 focus:border-rose-500'
                  : 'border-slate-800 focus:border-purple-500'
              }`}
            />
          </div>

          {/* Target Users Input */}
          <div>
            <label
              htmlFor="hb-input-users"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1">
                <span>Target Users</span>
                <span className="text-rose-400 font-bold">*</span>
              </span>
              {touchedFields.targetUsers && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isUsersValid
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                      : 'text-rose-400 bg-rose-950/60 border border-rose-800/50'
                  }`}
                >
                  {isUsersValid ? '✓ Valid' : 'Min 3 chars'}
                </span>
              )}
            </label>
            <input
              id="hb-input-users"
              type="text"
              value={targetUsers}
              onChange={(e) => {
                setTargetUsers(e.target.value);
                setTouchedFields((prev) => ({ ...prev, targetUsers: true }));
              }}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, targetUsers: true }))}
              placeholder="e.g. AI Engineers, MLOps Specialists, Platform Tech Leads"
              className={`w-full bg-[#080c16] border rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors ${
                !isUsersValid && touchedFields.targetUsers
                  ? 'border-rose-700 focus:border-rose-500'
                  : 'border-slate-800 focus:border-purple-500'
              }`}
            />
          </div>

          {/* Preferred Technologies Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Preferred Technologies</span>
                <span className="text-rose-400 font-bold">*</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isTechValid
                    ? 'text-purple-400 bg-purple-950/60 border border-purple-800/50'
                    : 'text-rose-400 bg-rose-950/60 border border-rose-800/50'
                }`}
              >
                {preferredTechnologies.length} selected {isTechValid ? '✓' : '(select ≥ 1)'}
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {AVAILABLE_TECH_SUGGESTIONS.map((tech) => {
                const isSelected = preferredTechnologies.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleToggleTech(tech)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-900/60 text-purple-200 border border-purple-600/80 shadow-xs'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Tech Tag */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTechInput}
                onChange={(e) => setCustomTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTech();
                  }
                }}
                placeholder="Add other tech (e.g. Supabase, WebSockets)..."
                className="flex-1 bg-[#080c16] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTech}
                disabled={!customTechInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Experience Level Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'beginner',
                  label: 'Beginner',
                  desc: 'Hackathon Novice',
                },
                {
                  id: 'intermediate',
                  label: 'Intermediate',
                  desc: 'Full-Stack Builder',
                },
                {
                  id: 'advanced',
                  label: 'Advanced',
                  desc: 'Staff AI Engineer',
                },
              ].map((lvl) => {
                const isSelected = experienceLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id as ExperienceLevel)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-600 text-white shadow-md shadow-purple-900/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-xs font-semibold">{lvl.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{lvl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Validation Status Checklist */}
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-xs space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Validation Checklist:</span>
              <span className={isFormValid ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                {isFormValid ? 'All Requirements Ready' : 'Required Information Needed'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className={`flex items-center gap-1.5 ${isIdeaValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{isIdeaValid ? '✓' : '○'}</span>
                <span>Project Idea</span>
              </div>
              <div className={`flex items-center gap-1.5 ${isProblemValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{isProblemValid ? '✓' : '○'}</span>
                <span>Problem Statement</span>
              </div>
              <div className={`flex items-center gap-1.5 ${isUsersValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{isUsersValid ? '✓' : '○'}</span>
                <span>Target Users</span>
              </div>
              <div className={`flex items-center gap-1.5 ${isTechValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{isTechValid ? '✓' : '○'}</span>
                <span>Technologies (≥1)</span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {generationError && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Generation Encountered an Error</span>
                <span className="text-rose-300/90 leading-relaxed">{generationError}</span>
              </div>
            </div>
          )}

          {/* Action CTA Button with strict validation */}
          <div className="pt-1">
            {isGenerating ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    id="hb-btn-generating-active"
                    disabled
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-2 cursor-wait"
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gemini 3.8 Flash Synthesizing Blueprint...</span>
                  </button>
                  <button
                    type="button"
                    id="hb-btn-stop-generating"
                    onClick={handleStopGeneration}
                    className="px-4 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    title="Stop generating"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${streamPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                id="hb-btn-generate-project"
                onClick={handleGenerateProject}
                disabled={!isFormValid}
                className={`w-full py-3.5 rounded-xl text-xs font-semibold shadow-xl flex items-center justify-center gap-2.5 transition-all transform active:scale-95 ${
                  isFormValid
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white shadow-purple-600/30 hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/60'
                }`}
                title={!isFormValid ? 'Please complete all required fields above to generate' : 'Generate complete 12-section blueprint with Gemini'}
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>
                  {isFormValid ? 'Generate Complete Hackathon Project' : 'Complete Required Fields to Generate'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Step-by-Step Blueprint & Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b0f1d] border border-slate-800/90 rounded-2xl shadow-xl flex flex-col min-h-[720px] overflow-hidden">
          {/* Header Bar with View Toggles, Download, and Project Info */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0e1424] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0">
                <Rocket className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="truncate max-w-[220px] sm:max-w-xs">{projectName}</span>
                  {generatedMarkdown && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-[10px] text-emerald-300 font-mono shrink-0">
                      {sections.length}/12 Sections
                    </span>
                  )}
                </h2>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                  <span>AI Infra Summit 2026</span>
                  <span>•</span>
                  <span className="text-purple-400">Gemini 3.8 Flash</span>
                </div>
              </div>
            </div>

            {/* View Switcher & Action Tools */}
            {generatedMarkdown && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('step')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      viewMode === 'step'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Step-by-Step</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('document')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      viewMode === 'document'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Full Document</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Progress Indicator Banner when Generating */}
          {isGenerating && (
            <div className="px-4 py-2.5 bg-purple-950/40 border-b border-purple-800/50 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-purple-200 font-medium truncate">
                  {generatedMarkdown
                    ? `Streaming Section ${sections.length} of 12 in real time...`
                    : 'Gemini 3.8 Flash is architecting technical specifications...'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-purple-300">
                <span>{streamPercent}%</span>
                <div className="w-20 bg-slate-900 rounded-full h-2 overflow-hidden border border-purple-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${streamPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Indicator Pills (Step Navigation) */}
          {generatedMarkdown && viewMode === 'step' && (
            <div className="px-4 py-2.5 bg-[#080c18] border-b border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-1.5">
              {SECTION_METADATA.map((meta, idx) => {
                const hasContent = sections.some((s) => s.number === meta.number);
                const isActive = activeStepIndex === idx;
                return (
                  <button
                    key={meta.number}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                        : hasContent
                        ? 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        : 'bg-slate-900/40 text-slate-600 border border-slate-900'
                    }`}
                    title={meta.title}
                  >
                    <span className="font-mono text-[10px] opacity-75">{meta.number}.</span>
                    <span>{meta.title}</span>
                    {hasContent && (
                      <CheckCircle2 className={`w-3 h-3 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Content Body Area */}
          <div ref={contentContainerRef} className="p-5 sm:p-6 flex-1 overflow-y-auto">
            {/* 1. Empty State (Before Generation) */}
            {!generatedMarkdown && !isGenerating && (
              <div className="h-full min-h-[440px] flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-900/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-1.5">
                  Ready to Architect Your Hackathon Winner
                </h3>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
                  Provide your project idea and requirements on the left, then click{' '}
                  <strong className="text-purple-300">Generate Complete Hackathon Project</strong>. Gemini will assemble your 12-section blueprint in real time.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg text-left w-full">
                  {SECTION_METADATA.slice(0, 6).map((s) => (
                    <div
                      key={s.number}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]"
                    >
                      <div className="text-purple-400 font-mono text-[10px]">Section {s.number}</div>
                      <div className="font-medium text-slate-300 truncate">{s.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Skeleton Loader State (During Initial Generation before markdown chunks arrive) */}
            {isGenerating && !generatedMarkdown && (
              <div className="space-y-6 animate-pulse py-4">
                {/* Skeleton Header */}
                <div className="space-y-2.5 border-b border-slate-800/80 pb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-24 bg-purple-900/40 rounded-full" />
                    <div className="h-5 w-32 bg-slate-800 rounded-full" />
                  </div>
                  <div className="h-8 w-3/4 bg-slate-800/80 rounded-xl" />
                  <div className="h-4 w-1/2 bg-slate-800/50 rounded-lg" />
                </div>

                {/* Simulated Generation Phase Progress */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-purple-300">
                    <span className="font-medium flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                      {generationProgressStage === 1 && 'Phase 1/4: Analyzing project idea & problem domain...'}
                      {generationProgressStage === 2 && 'Phase 2/4: Synthesizing system architecture & ASCII diagram...'}
                      {generationProgressStage === 3 && 'Phase 3/4: Compiling production starter code & sprint roadmap...'}
                      {generationProgressStage >= 4 && 'Phase 4/4: Polishing hackathon pitch hooks & live demo script...'}
                      {generationProgressStage === 0 && 'Connecting to Google GenAI Gemini 3.8 Flash SDK...'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">Gemini 3.8 Flash</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-400 h-full transition-all duration-700"
                      style={{ width: `${Math.max(20, generationProgressStage * 25)}%` }}
                    />
                  </div>
                </div>

                {/* Simulated Architecture Cards Skeleton */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="h-4 w-20 bg-slate-800 rounded" />
                    <div className="h-12 bg-slate-800/40 rounded-lg" />
                    <div className="h-3 w-16 bg-slate-800/60 rounded" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="h-4 w-24 bg-slate-800 rounded" />
                    <div className="h-12 bg-slate-800/40 rounded-lg" />
                    <div className="h-3 w-20 bg-slate-800/60 rounded" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="h-4 w-16 bg-slate-800 rounded" />
                    <div className="h-12 bg-slate-800/40 rounded-lg" />
                    <div className="h-3 w-14 bg-slate-800/60 rounded" />
                  </div>
                </div>

                {/* Simulated Code Block Skeleton */}
                <div className="rounded-xl border border-slate-800 bg-[#070a11] overflow-hidden p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <div className="h-4 w-28 bg-slate-800 rounded" />
                    <div className="h-4 w-16 bg-slate-800 rounded" />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="h-3.5 w-11/12 bg-slate-800/60 rounded font-mono" />
                    <div className="h-3.5 w-4/5 bg-slate-800/50 rounded font-mono" />
                    <div className="h-3.5 w-2/3 bg-slate-800/60 rounded font-mono" />
                    <div className="h-3.5 w-3/4 bg-slate-800/40 rounded font-mono" />
                    <div className="h-3.5 w-5/6 bg-slate-800/60 rounded font-mono" />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Step-by-Step View */}
            {generatedMarkdown && viewMode === 'step' && currentSection && (
              <div className="space-y-5">
                {/* Step Header with multiple Copy actions */}
                <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-slate-800/80 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      {currentSection.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider">
                        Section {currentSection.number} of 12
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {currentSection.title}
                      </h3>
                    </div>
                  </div>

                  {/* Copy Actions Group */}
                  <div className="flex items-center gap-2">
                    {/* Copy Raw Code to IDE button if section contains code */}
                    {(currentSection.number === 8 || currentSection.content.includes('```')) && (
                      <button
                        type="button"
                        id="hb-btn-copy-code-ide"
                        onClick={handleCopyCodeToIDE}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 hover:text-white text-xs border border-emerald-800/80 transition-colors shadow-xs"
                        title="Extract and copy raw code blocks directly to clipboard for your IDE"
                      >
                        {copiedCodeSnippet ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{copiedCodeSnippet ? 'Code Copied!' : 'Copy Code to IDE'}</span>
                      </button>
                    )}

                    {/* Copy Section Button */}
                    <button
                      type="button"
                      id="hb-btn-copy-section"
                      onClick={handleCopySection}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors shadow-xs"
                      title="Copy this section text to clipboard"
                    >
                      {copiedSection ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{copiedSection ? 'Section Copied!' : 'Copy Section'}</span>
                    </button>
                  </div>
                </div>

                {/* Step Content */}
                <div className="markdown-content text-slate-200 text-xs sm:text-[13px] leading-relaxed py-1">
                  <Markdown
                    components={{
                      code(props: any) {
                        const { children, className, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        const codeText = String(children || '').replace(/\n$/, '');
                        const isMultiLine = codeText.includes('\n');

                        if (match || isMultiLine) {
                          return (
                            <CodeBlock
                              language={match ? match[1] : 'bash'}
                              code={codeText}
                            />
                          );
                        }

                        return (
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {currentSection.content}
                  </Markdown>
                </div>

                {/* Step Footer Navigation & Actions */}
                <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                      disabled={activeStepIndex === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-300 font-medium border border-slate-800 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous Section</span>
                    </button>

                    <button
                      type="button"
                      id="hb-btn-download-step-footer"
                      onClick={handleDownloadMarkdown}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-purple-300 font-medium border border-slate-800 transition-colors"
                      title="Download complete project plan as a Markdown file"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-400" />
                      <span>Download .md</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 font-mono hidden sm:block">
                    {activeStepIndex + 1} / {sections.length || 12}
                  </div>

                  {activeStepIndex < sections.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex(activeStepIndex + 1)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all"
                    >
                      <span>Next: {sections[activeStepIndex + 1]?.title || 'Next Step'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenInChat}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Take Blueprint into Chat</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 4. Full Continuous Document View */}
            {generatedMarkdown && viewMode === 'document' && (
              <div className="space-y-6">
                {/* Document Action Toolbar */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold">Full 12-Section Architecture Document</span>
                    <span className="text-slate-500 font-mono">({sections.length} parsed sections)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="hb-btn-copy-doc-full"
                      onClick={handleCopyFullMarkdown}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
                      title="Copy complete document"
                    >
                      {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedFull ? 'Copied All' : 'Copy All'}</span>
                    </button>

                    <button
                      type="button"
                      id="hb-btn-download-doc-toolbar"
                      onClick={handleDownloadMarkdown}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-200 text-xs border border-purple-800/80 transition-colors"
                      title="Download .md file"
                    >
                      {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{downloadSuccess ? 'Downloaded!' : 'Download .md'}</span>
                    </button>
                  </div>
                </div>

                {/* Render Each Section with its own Copy Section action */}
                <div className="space-y-6">
                  {sections.map((sec) => (
                    <div
                      key={sec.number}
                      id={`doc-sec-${sec.number}`}
                      className="p-5 rounded-xl bg-[#090d18] border border-slate-800/80 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-slate-800 text-purple-400">
                            {sec.icon}
                          </span>
                          <h3 className="text-sm font-bold text-white">
                            {sec.number}. {sec.title}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyDocumentSection(sec)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700 transition-colors"
                          title="Copy this section"
                        >
                          {copiedDocSectionId === sec.number ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-mono">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy Section</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="markdown-content text-slate-200 text-xs sm:text-[13px] leading-relaxed">
                        <Markdown
                          components={{
                            code(props: any) {
                              const { children, className, ...rest } = props;
                              const match = /language-(\w+)/.exec(className || '');
                              const codeText = String(children || '').replace(/\n$/, '');
                              const isMultiLine = codeText.includes('\n');

                              if (match || isMultiLine) {
                                return (
                                  <CodeBlock
                                    language={match ? match[1] : 'bash'}
                                    code={codeText}
                                  />
                                );
                              }

                              return (
                                <code className={className} {...rest}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {sec.content}
                        </Markdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
