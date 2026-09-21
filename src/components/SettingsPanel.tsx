import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Database, Cpu, Download, Upload, Trash2, Check, AlertCircle, Activity, BarChart2, RotateCcw } from 'lucide-react';
import { AppSettings } from '../types';
import { StorageService } from '../services/storage';
import { AnalyticsService } from '../services/analytics';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClearHistory: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearHistory,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [metrics, setMetrics] = useState(AnalyticsService.getMetricsSummary());
  const [showEventsLog, setShowEventsLog] = useState(false);

  if (!isOpen) return null;

  const handleClearAnalytics = () => {
    AnalyticsService.clearEvents();
    setMetrics(AnalyticsService.getMetricsSummary());
    setStatusMessage({ text: 'Analytics logs cleared.' });
  };

  const handleSave = () => {
    onSaveSettings(formData);
    setStatusMessage({ text: 'Settings saved successfully!' });
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  const handleExport = () => {
    const jsonStr = StorageService.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infrapilot-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Exported chat history successfully.' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importData(content);
      if (success) {
        setStatusMessage({ text: 'Chat history imported successfully! Reloading...' });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatusMessage({ text: 'Invalid backup file format', isError: true });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="settings-panel-container"
        className="w-full max-w-2xl bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#111728]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Application Settings</h2>
              <p className="text-xs text-slate-400">Manage AI models, system prompts, database sync & exports</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                  : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              }`}
            >
              {statusMessage.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: AI Engine */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>AI Engine & Provider</span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Active Model</label>
              <select
                value={formData.aiModel}
                onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Primary configured model)</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash (Fast, reliable flash inference)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced complex engineering tasks)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Server-side execution handles tokens securely via environment variables.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Custom System Instructions</label>
              <textarea
                value={formData.systemPromptCustom}
                onChange={(e) => setFormData({ ...formData, systemPromptCustom: e.target.value })}
                rows={3}
                placeholder="e.g. Always output PyTorch 2.4 compliant code with strict typing and Dockerfile samples..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="font-medium text-slate-200">Stream Responses</span>
                <p className="text-[11px] text-slate-500">Render tokens smoothly in real time via Server-Sent Events</p>
              </div>
              <input
                type="checkbox"
                checked={formData.streamResponses}
                onChange={(e) => setFormData({ ...formData, streamResponses: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 2: Supabase / Database Integration */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Database & Authentication</span>
            </div>

            <p className="text-[11px] text-slate-400">
              InfraPilot AI automatically persists conversations and messages locally. Optionally connect your Supabase project for multi-device cloud synchronization.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={formData.supabaseUrl}
                  onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Anon Public Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={formData.supabaseAnonKey}
                  onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (formData.supabaseUrl && formData.supabaseAnonKey) {
                    setFormData({ ...formData, isSupabaseConnected: true });
                    setStatusMessage({ text: 'Supabase credentials validated and linked.' });
                  } else {
                    setFormData({ ...formData, isSupabaseConnected: false });
                    setStatusMessage({ text: 'Please provide both URL and Anon Key.', isError: true });
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Test & Save Supabase Link
              </button>
              {formData.isSupabaseConnected && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" /> Connected
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Data Management & Backup */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              Data Backup & Storage
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Chat History (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import Backup</span>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all conversations? This cannot be undone.')) {
                    onClearHistory();
                    setStatusMessage({ text: 'All conversations cleared.' });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-300 transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chats</span>
              </button>
            </div>
          </div>

          {/* Section 4: Interaction Analytics & Usage Metrics */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Interaction Metrics & Experience Analytics</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {metrics.totalEvents} events tracked locally
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Chats Started</span>
                <span className="text-base font-bold text-blue-400 font-mono">{metrics.chatsStarted}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Messages Sent</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{metrics.messagesSent}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">Tools Executed</span>
                <span className="text-base font-bold text-purple-400 font-mono">{metrics.toolsUsed}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block mb-0.5">In-Chat Searches</span>
                <span className="text-base font-bold text-cyan-400 font-mono">{metrics.searchesPerformed}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowEventsLog((v) => !v)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors"
              >
                {showEventsLog ? 'Hide Event History' : 'View Recent Event Log'}
              </button>
              <button
                type="button"
                onClick={handleClearAnalytics}
                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 text-[11px] transition-colors ml-auto flex items-center gap-1"
                title="Reset local analytics counters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Telemetry</span>
              </button>
            </div>

            {showEventsLog && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[10px] max-h-40 overflow-y-auto space-y-1">
                {AnalyticsService.getRecentEvents(12).map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between text-slate-400 border-b border-slate-900/80 pb-1">
                    <span className="text-blue-400 font-semibold">{evt.name}</span>
                    <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-800 bg-[#101524]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="save-settings-btn"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
