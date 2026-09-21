import React, { useState } from 'react';
import { Check, Copy, Terminal, Download } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', code, filename }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const ext = language === 'python' ? 'py' : language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language === 'yaml' ? 'yml' : language === 'bash' ? 'sh' : 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `infrapilot-snippet.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = code.trim().split('\n');

  return (
    <div id={`codeblock-${Math.random().toString(36).substring(7)}`} className="my-4 rounded-xl border border-slate-800 bg-[#070a11] overflow-hidden shadow-2xl">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1422] border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono font-medium text-slate-300 uppercase tracking-wider text-[11px]">
            {filename || language}
          </span>
          <span className="text-slate-500 font-mono text-[10px]">
            ({lines.length} lines)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            title="Download file"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto font-mono text-[13px] leading-relaxed text-slate-200">
        <pre className="grid grid-cols-[auto_1fr] gap-x-4">
          <span className="select-none text-slate-600 text-right pr-2 border-r border-slate-800/60 font-mono text-xs">
            {lines.map((_, i) => (
              <span key={i} className="block">
                {i + 1}
              </span>
            ))}
          </span>
          <code className="text-slate-100 font-mono block whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};
