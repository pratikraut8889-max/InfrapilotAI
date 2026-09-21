import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  Cpu,
  Layers,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  PanelLeftClose,
  Award,
  Database,
  Info,
  Lock,
  Unlock,
  Keyboard,
} from 'lucide-react';
import { Conversation, ChatMode, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { AnalyticsService } from '../services/analytics';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: (mode?: ChatMode) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onToggleReadOnly?: (id: string) => void;
  mode: ChatMode;
  onToggleMode: (newMode: ChatMode) => void;
  onOpenTools: () => void;
  onOpenHackathonBuilder?: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenShortcuts?: () => void;
  currentUser: UserProfile;
  isOpen: boolean;
  onCloseMobile: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onToggleReadOnly,
  mode,
  onToggleMode,
  onOpenTools,
  onOpenHackathonBuilder,
  onOpenSettings,
  onOpenAuth,
  onOpenShortcuts,
  currentUser,
  isOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showPersistenceNotice, setShowPersistenceNotice] = useState(false);

  // Search results that also look into message contents
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations.map((conv) => ({
        conversation: conv,
        matchedMessagesCount: 0,
        snippet: undefined,
      }));
    }
    return StorageService.searchConversations(searchQuery, currentUser.id);
  }, [conversations, searchQuery, currentUser.id]);

  const filteredConversations = useMemo(() => {
    return searchResults.map((r) => r.conversation);
  }, [searchResults]);

  // Group conversations by date
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const groups: { [key: string]: Conversation[] } = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    Older: [],
  };

  filteredConversations.forEach((conv) => {
    const diff = now - conv.updatedAt;
    if (diff < oneDay) {
      groups.Today.push(conv);
    } else if (diff < 2 * oneDay) {
      groups.Yesterday.push(conv);
    } else if (diff < 7 * oneDay) {
      groups['Previous 7 Days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  });

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleConfirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setConfirmDeleteId(null);
  };

  const persistenceInfo = StorageService.getPersistenceInfo();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        id="chat-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 flex flex-col bg-[#0b0f19] border-r border-slate-800/90 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header / Branding */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                InfraPilot <span className="text-blue-400 font-mono text-xs">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                AI Infra Summit
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1 text-slate-400 hover:text-white rounded"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons: New Chat & Tools */}
        <div className="p-3 space-y-2">
          <button
            type="button"
            id="new-chat-btn"
            onClick={() => {
              onNewChat(mode);
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-3 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] group min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
              New Conversation
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-blue-700/80 text-[10px] font-mono text-blue-200">
              ⌘K
            </kbd>
          </button>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl text-xs">
            <button
              type="button"
              id="switch-mode-developer"
              onClick={() => {
                onToggleMode('developer');
                onCloseMobile();
              }}
              className={`flex items-center justify-center gap-1.5 py-2 sm:py-1.5 rounded-lg font-medium transition-all min-h-[38px] ${
                mode === 'developer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Dev Assistant</span>
            </button>
            <button
              type="button"
              id="switch-mode-hackathon"
              onClick={() => {
                onToggleMode('hackathon');
                onCloseMobile();
              }}
              className={`flex items-center justify-center gap-1.5 py-2 sm:py-1.5 rounded-lg font-medium transition-all min-h-[38px] ${
                mode === 'hackathon'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hackathon</span>
            </button>
          </div>

          {/* Tools Launcher Button */}
          <button
            type="button"
            id="sidebar-tools-launcher-btn"
            onClick={() => {
              onOpenTools();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              AI Infra Tools
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-400 border border-blue-800 font-mono">
              5 Tools
            </span>
          </button>

          {/* Hackathon Builder Page Launcher Button */}
          {onOpenHackathonBuilder && (
            <button
              type="button"
              id="sidebar-hackathon-builder-btn"
              onClick={() => {
                onOpenHackathonBuilder();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 hover:border-purple-700 text-purple-200 hover:text-white text-xs font-medium transition-all min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Hackathon Builder
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-900 text-purple-200 border border-purple-700 font-mono">
                12 Steps
              </span>
            </button>
          )}

          {/* Search Bar */}
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              id="sidebar-search-input"
              placeholder="Search chats & logs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  AnalyticsService.track('search_conversations', { queryLength: e.target.value.length });
                }
              }}
              className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl py-2 pl-8 pr-7 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
              <span>{filteredConversations.length} {filteredConversations.length === 1 ? 'match' : 'matches'} found</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-blue-400 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 text-xs">
          {Object.entries(groups).map(([groupTitle, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={groupTitle} className="space-y-1">
                <span className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {groupTitle}
                </span>
                {list.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isEditing = editingId === conv.id;
                  const isConfirmingDelete = confirmDeleteId === conv.id;
                  const searchItem = searchResults.find((r) => r.conversation.id === conv.id);

                  return (
                    <div
                      key={conv.id}
                      id={`conv-item-${conv.id}`}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onCloseMobile();
                      }}
                      className={`group relative flex flex-col px-3 py-2.5 sm:py-2 rounded-xl cursor-pointer transition-all min-h-[44px] justify-center ${
                        isActive
                          ? 'bg-[#162035] text-white font-medium border border-blue-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive
                                ? conv.mode === 'hackathon'
                                  ? 'text-purple-400'
                                  : 'text-blue-400'
                                : 'text-slate-500'
                            }`}
                          />
                          {isEditing ? (
                            <input
                              type="text"
                              autoFocus
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(conv.id, e);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="bg-slate-900 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white w-full focus:outline-none"
                            />
                          ) : (
                            <span className="truncate text-xs flex items-center gap-1.5">
                              {conv.title}
                              {conv.isReadOnly && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-mono bg-amber-950/80 border border-amber-700/70 text-amber-300 shrink-0"
                                  title="Read-only conversation: protected against edits and deletions"
                                >
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Inline Delete Confirmation or Hover Actions */}
                        {isConfirmingDelete ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 shrink-0 ml-1.5 bg-rose-950/90 border border-rose-800/80 rounded-lg px-1.5 py-0.5 text-[10px] text-rose-200"
                          >
                            <span>Delete?</span>
                            <button
                              type="button"
                              onClick={(e) => handleConfirmDelete(conv.id, e)}
                              className="font-bold text-rose-300 hover:text-white px-1 hover:bg-rose-800 rounded"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(null);
                              }}
                              className="text-slate-400 hover:text-slate-200 px-1"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pl-1 shrink-0">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => handleSaveRename(conv.id, e)}
                                  className="p-1 hover:text-emerald-400 text-slate-400"
                                  title="Save title"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(null);
                                  }}
                                  className="p-1 hover:text-rose-400 text-slate-400"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                {onToggleReadOnly && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleReadOnly(conv.id);
                                    }}
                                    className={`p-1.5 rounded-md transition-colors ${
                                      conv.isReadOnly
                                        ? 'text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-950/60'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                                    title={
                                      conv.isReadOnly
                                        ? 'Unlock conversation (allow messages & changes)'
                                        : 'Lock conversation (make read-only to prevent accidental edits/deletions)'
                                    }
                                  >
                                    {conv.isReadOnly ? (
                                      <Lock className="w-3.5 h-3.5" />
                                    ) : (
                                      <Unlock className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}

                                {!conv.isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(conv, e)}
                                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800"
                                    title="Rename conversation"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {!conv.isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDeleteId(conv.id);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-rose-950/40"
                                    title="Delete conversation"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Snippet or relative time subtitle */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pl-5.5">
                        <span className="font-mono">
                          {formatRelativeTime(conv.updatedAt)}
                        </span>
                        {conv.mode === 'hackathon' && (
                          <span className="text-purple-400/80 font-mono text-[9px]">
                            hackathon
                          </span>
                        )}
                      </div>

                      {searchItem?.snippet && (
                        <p className="mt-1 pl-5.5 text-[10px] text-slate-400 italic line-clamp-1 border-l-2 border-blue-500/40 pl-1.5 ml-5.5">
                          "{searchItem.snippet}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-xs space-y-2">
              <p>No conversations found.</p>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-blue-400 text-[11px] hover:underline"
                >
                  Clear search query
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNewChat(mode)}
                  className="inline-flex items-center gap-1 text-blue-400 text-[11px] hover:underline"
                >
                  <Plus className="w-3 h-3" /> Start a new session
                </button>
              )}
            </div>
          )}
        </div>

        {/* Persistence Architecture Badge & Tooltip */}
        <div className="px-3 py-2 border-t border-slate-800/60 bg-[#090d16]">
          <button
            type="button"
            onClick={() => setShowPersistenceNotice(!showPersistenceNotice)}
            className="w-full flex items-center justify-between text-[10px] text-slate-400 hover:text-slate-200 py-1 px-1.5 rounded bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-mono">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Isolated Local Storage</span>
            </span>
            <Info className="w-3 h-3 text-slate-500" />
          </button>

          {showPersistenceNotice && (
            <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 space-y-1.5 shadow-lg animate-in fade-in duration-150">
              <div className="font-semibold text-white flex items-center gap-1">
                <span>Persistence Architecture</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {persistenceInfo.description}
              </p>
              <div className="pt-1 border-t border-slate-800 text-[9px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Production Cloud Requirements:</span>
                {persistenceInfo.requirements.slice(0, 2).map((req, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-blue-400 shrink-0">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080c14]">
          <div className="flex items-center justify-between">
            <div
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity min-w-0 flex-1 mr-2"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {currentUser.name}
                  </span>
                  {currentUser.hackathonTeam && (
                    <span className="flex items-center text-[9px] px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800 shrink-0">
                      <Award className="w-2.5 h-2.5 mr-0.5" />
                      Team
                    </span>
                  )}
                </div>
                <span className="block text-[10px] text-slate-500 truncate">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onOpenShortcuts && (
                <button
                  type="button"
                  id="sidebar-open-shortcuts-btn"
                  onClick={onOpenShortcuts}
                  className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Keyboard Shortcuts (?)"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                id="sidebar-open-settings-btn"
                onClick={onOpenSettings}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                title="Settings & Sync"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
