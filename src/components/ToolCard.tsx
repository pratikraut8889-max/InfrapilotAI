import React from 'react';
import { Layers, Zap, Bug, Database, Rocket, ArrowRight } from 'lucide-react';
import { ToolType } from '../types';

interface ToolCardProps {
  type: ToolType;
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
  accentColor?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  type,
  title,
  description,
  badge,
  onClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'architecture':
        return <Layers className="w-5 h-5 text-blue-400" />;
      case 'prompt_opt':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'debugger':
        return <Bug className="w-5 h-5 text-rose-400" />;
      case 'rag_planner':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'deploy_checklist':
        return <Rocket className="w-5 h-5 text-purple-400" />;
      default:
        return <Layers className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div
      id={`tool-card-${type}`}
      onClick={onClick}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#0f1523] hover:bg-[#141b2d] border border-slate-800/80 hover:border-slate-700/90 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/5 active:scale-[0.99]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-slate-800 flex items-center justify-center border border-slate-700/50 shadow-inner">
            {getIcon()}
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
            {badge}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-100 group-hover:text-white mb-1.5 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60 text-xs text-blue-400 font-medium group-hover:text-blue-300">
        <span>Launch Tool</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
