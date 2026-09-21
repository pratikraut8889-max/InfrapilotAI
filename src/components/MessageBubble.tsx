import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { User, Cpu, Sparkles, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
  onRetry?: (message: Message) => void;
  searchQuery?: string;
  isSearchMatch?: boolean;
  isCurrentMatch?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRetry,
  searchQuery,
  isSearchMatch,
  isCurrentMatch,
}) => {
  const isUser = message.role === 'user';
  const isHackathon = message.mode === 'hackathon';
  const [copied, setCopied] = useState(false);
  const bubbleRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isCurrentMatch && bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isCurrentMatch]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      ref={bubbleRef}
      id={`msg-bubble-${message.id}`}
      className={`group flex items-start gap-3.5 my-4 transition-all duration-300 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } ${
        isCurrentMatch
          ? 'ring-2 ring-amber-400/90 rounded-2xl p-1 bg-amber-500/10'
          : isSearchMatch
          ? 'ring-1 ring-blue-500/40 rounded-2xl p-0.5'
          : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg text-xs font-semibold ${
          isUser
            ? 'bg-slate-700 text-slate-100 ring-1 ring-slate-600'
            : isHackathon
            ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-500/20'
            : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isHackathon ? (
          <Sparkles className="w-4 h-4" />
        ) : (
          <Cpu className="w-4 h-4" />
        )}
      </div>

      {/* Bubble Container */}
      <div
        className={`flex flex-col max-w-[86%] sm:max-w-[78%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Header Metadata */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">
            {isUser
              ? 'You'
              : isHackathon
              ? 'Hackathon Builder'
              : 'InfraPilot AI'}
          </span>
          <span>•</span>
          <span>{formattedTime}</span>
          {!isUser && message.model && (
            <>
              <span>•</span>
              <span className="text-slate-500 font-mono text-[10px]">
                {message.model}
              </span>
            </>
          )}
        </div>

        {/* Message Box */}
        <div
          className={`relative rounded-2xl px-4 py-3.5 shadow-md text-sm leading-relaxed ${
            isUser
              ? 'bg-[#1e2738] text-slate-100 border border-slate-700/80 rounded-tr-sm'
              : message.error
              ? 'bg-rose-950/40 text-rose-200 border border-rose-800/80 rounded-tl-sm'
              : 'bg-[#101726] text-slate-200 border border-slate-800 rounded-tl-sm'
          }`}
        >
          {message.error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Diagnostic Warning</span>
            </div>
          )}

          <div className="markdown-content overflow-x-auto text-[13.5px]">
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
              {message.content}
            </Markdown>
          </div>
        </div>

        {/* Footer Actions on hover / mobile always */}
        <div
          className={`flex items-center gap-2 mt-1 px-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400`}
        >
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-slate-200 p-1 rounded transition-colors"
            title="Copy content"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          {!isUser && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(message)}
              className="flex items-center gap-1 hover:text-slate-200 p-1 rounded transition-colors"
              title="Regenerate response"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[11px]">Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
