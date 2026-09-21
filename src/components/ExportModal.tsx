import React, { useState } from 'react';
import { Download, FileJson, FileText, X, Check, Copy } from 'lucide-react';
import { Conversation, Message } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation?: Conversation;
  messages: Message[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  conversation,
  messages,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<'md' | 'json' | null>(null);

  if (!isOpen) return null;

  const title = conversation?.title || 'infrapilot-conversation';
  const cleanFilename = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'infrapilot-chat';

  // Format as Markdown with metadata frontmatter
  const generateMarkdown = () => {
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `date: "${new Date(conversation?.createdAt || Date.now()).toISOString()}"`,
      `exported_at: "${new Date().toISOString()}"`,
      `mode: "${conversation?.mode || 'developer'}"`,
      `read_only: ${conversation?.isReadOnly ? 'true' : 'false'}`,
      `total_messages: ${messages.length}`,
      'generator: "InfraPilot AI - AI Infra Summit 2026"',
      '---',
      '',
      `# ${title}`,
      '',
      `*Exported on ${new Date().toLocaleString()}*`,
      '',
      '---',
      '',
    ].join('\n');

    const formattedMessages = messages
      .map((m) => {
        const roleLabel =
          m.role === 'user'
            ? '### 👤 User'
            : m.mode === 'hackathon'
            ? '### ⚡ InfraPilot AI (Hackathon Builder)'
            : '### 🤖 InfraPilot AI (Dev Assistant)';
        const time = new Date(m.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${roleLabel} *(${time})*\n\n${m.content}\n`;
      })
      .join('\n---\n\n');

    return frontmatter + formattedMessages;
  };

  // Format as structured JSON
  const generateJSON = () => {
    const payload = {
      version: '1.0',
      application: 'InfraPilot AI',
      exportedAt: new Date().toISOString(),
      conversation: {
        id: conversation?.id || 'unknown',
        title: conversation?.title || 'Untitled',
        mode: conversation?.mode || 'developer',
        isReadOnly: Boolean(conversation?.isReadOnly),
        createdAt: conversation?.createdAt || Date.now(),
        updatedAt: conversation?.updatedAt || Date.now(),
      },
      messageCount: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        formattedTime: new Date(m.timestamp).toISOString(),
        mode: m.mode || conversation?.mode,
        model: m.model,
      })),
    };

    return JSON.stringify(payload, null, 2);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFilename}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleDownloadJSON = () => {
    const jsonStr = generateJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFilename}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleCopy = async (format: 'md' | 'json') => {
    const text = format === 'md' ? generateMarkdown() : generateJSON();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div
      id="export-conversation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0c101c] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-[#0c101c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Export Conversation</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px]">
                {title} ({messages.length} messages)
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3.5 text-xs">
          {/* Markdown Option */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-xs flex items-center gap-2">
                  Markdown (.md)
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                    Human-readable
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Best for documentation, GitHub issues, Obsidian/Notion imports, or sharing readable prompt logs. Includes YAML frontmatter.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleCopy('md')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-xs"
              >
                {copiedFormat === 'md' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
              <button
                type="button"
                id="export-md-download-btn"
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors font-medium text-xs shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          {/* JSON Option */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center shrink-0">
                <FileJson className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-xs flex items-center gap-2">
                  JSON (.json)
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                    Machine-readable
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Best for automated fine-tuning datasets, archiving structured messages, and importing into other LLM evaluation pipelines.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleCopy('json')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-xs"
              >
                {copiedFormat === 'json' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
              <button
                type="button"
                id="export-json-download-btn"
                onClick={handleDownloadJSON}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors font-medium text-xs shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#090d18] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Encoding: UTF-8</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
