import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, ChatMode, AppSettings, UserProfile, ToolType } from './types';
import { StorageService, DEFAULT_SETTINGS, DEFAULT_USER } from './services/storage';
import { ApiService } from './services/api';
import { AnalyticsService } from './services/analytics';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { ToolsModal } from './components/ToolsModal';
import { HackathonPanel } from './components/HackathonPanel';
import { HackathonBuilderPage } from './components/HackathonBuilderPage';
import { SettingsPanel } from './components/SettingsPanel';
import { AuthModal } from './components/AuthModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'hackathon-builder'>('landing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // App Core Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<ChatMode>('developer');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);

  // AI Generation State
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Modals
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolType>('architecture');
  const [isHackathonModalOpen, setIsHackathonModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Initial Load from local storage
  useEffect(() => {
    const loadedConversations = StorageService.getConversations();
    const loadedSettings = StorageService.getSettings();
    const loadedUser = StorageService.getUser();
    const activeId = StorageService.getActiveConversationId();

    setConversations(loadedConversations);
    setSettings(loadedSettings);
    setCurrentUser(loadedUser);
    setMode(loadedSettings.defaultMode || 'developer');

    if (loadedConversations.some((c) => c.id === activeId)) {
      setActiveConversationId(activeId);
      setMessages(StorageService.getMessages(activeId));
    } else if (loadedConversations.length > 0) {
      setActiveConversationId(loadedConversations[0].id);
      setMessages(StorageService.getMessages(loadedConversations[0].id));
    }

    // Check backend health and API key availability
    ApiService.checkHealth().then((health) => {
      setHasApiKey(health.hasApiKey);
    });
  }, []);

  // Update messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      const convMessages = StorageService.getMessages(activeConversationId);
      setMessages(convMessages);
      StorageService.setActiveConversationId(activeConversationId);

      const activeConv = conversations.find((c) => c.id === activeConversationId);
      if (activeConv) {
        setMode(activeConv.mode);
      }
    }
  }, [activeConversationId, conversations]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K, ? / Cmd+/ for shortcuts help, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Cmd+K or Ctrl+K: New Chat
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
        return;
      }

      // '?' key (outside input fields) or Cmd+/ : Open shortcuts modal
      if (
        ((e.key === '?' && !isInput) ||
          ((e.metaKey || e.ctrlKey) && e.key === '/')) &&
        !e.altKey
      ) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Escape key: Close open modals
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
        if (isToolsModalOpen) setIsToolsModalOpen(false);
        if (isHackathonModalOpen) setIsHackathonModalOpen(false);
        if (isSettingsModalOpen) setIsSettingsModalOpen(false);
        if (isAuthModalOpen) setIsAuthModalOpen(false);
        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    mode,
    conversations,
    isShortcutsModalOpen,
    isToolsModalOpen,
    isHackathonModalOpen,
    isSettingsModalOpen,
    isAuthModalOpen,
    isMobileSidebarOpen,
  ]);

  // Handle New Chat
  const handleNewChat = (newMode?: ChatMode) => {
    const chatMode = newMode || mode;
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: chatMode === 'hackathon' ? 'Hackathon Project Discussion' : 'New AI Infra Session',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      mode: chatMode,
      isReadOnly: false,
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    StorageService.saveConversations(updated);
    setActiveConversationId(newConv.id);
    setMessages([]);
    setCurrentView('app');
    setIsMobileSidebarOpen(false);
    AnalyticsService.track('new_chat', { mode: chatMode });
  };

  // Handle Toggle Conversation Read-Only
  const handleToggleReadOnly = (id: string) => {
    StorageService.toggleConversationReadOnly(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isReadOnly: !c.isReadOnly } : c))
    );
    AnalyticsService.track('toggle_read_only', { conversationId: id });
  };

  // Handle Delete Conversation
  const handleDeleteConversation = (id: string) => {
    // Check if read-only
    const target = conversations.find((c) => c.id === id);
    if (target?.isReadOnly) {
      return;
    }
    StorageService.deleteConversation(id);
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    AnalyticsService.track('delete_conversation', { conversationId: id });

    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Handle Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    const target = conversations.find((c) => c.id === id);
    if (target?.isReadOnly) return;
    StorageService.renameConversation(id, newTitle);
    setConversations(
      conversations.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Handle Clear Current Conversation
  const handleClearConversation = () => {
    if (!activeConversationId) return;
    const all = StorageService.getMessages().filter((m) => m.conversationId !== activeConversationId);
    StorageService.saveMessages(all);
    setMessages([]);
    AnalyticsService.track('clear_conversation', { conversationId: activeConversationId });
  };

  // Handle Toggle Mode
  const handleToggleMode = (newMode: ChatMode) => {
    setMode(newMode);
    AnalyticsService.track('toggle_mode', { mode: newMode });
    if (activeConversationId) {
      const updated = conversations.map((c) =>
        c.id === activeConversationId ? { ...c, mode: newMode } : c
      );
      setConversations(updated);
      StorageService.saveConversations(updated);
    }
  };

  // Handle Stop AI Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Send Message & Stream AI Response
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Guard: Prevent sending message in a read-only conversation
    const currentConv = conversations.find((c) => c.id === activeConversationId);
    if (currentConv?.isReadOnly) {
      return;
    }

    let targetConvId = activeConversationId;
    if (!targetConvId || !conversations.some((c) => c.id === targetConvId)) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        title: text.slice(0, 36).replace(/\n/g, ' ').trim() || 'AI Infra Session',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode,
      };
      const updated = [newConv, ...conversations];
      setConversations(updated);
      StorageService.saveConversations(updated);
      setActiveConversationId(newConv.id);
      targetConvId = newConv.id;
    }

    // 1. Create and append user message
    const userMsg: Message = {
      id: `msg_${Date.now()}_u`,
      conversationId: targetConvId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      mode,
    };

    StorageService.addMessage(userMsg);
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    AnalyticsService.track('send_message', {
      mode,
      length: text.length,
      conversationId: targetConvId,
    });

    // 2. Prepare assistant placeholder
    const assistantMsgId = `msg_${Date.now()}_a`;
    let accumulatedText = '';

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const allCurrentMessages = [...messages, userMsg];

    await ApiService.streamChat(
      allCurrentMessages,
      mode,
      settings.aiModel || 'gemini-3.8-flash',
      settings.systemPromptCustom,
      {
        onChunk: (chunk) => {
          accumulatedText += chunk;
          setMessages((prev) => {
            const hasPlaceholder = prev.some((m) => m.id === assistantMsgId);
            if (hasPlaceholder) {
              return prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
              );
            } else {
              return [
                ...prev,
                {
                  id: assistantMsgId,
                  conversationId: targetConvId,
                  role: 'assistant',
                  content: accumulatedText,
                  timestamp: Date.now(),
                  mode,
                  model: settings.aiModel,
                },
              ];
            }
          });
        },
        onError: (err) => {
          const errorMsg: Message = {
            id: `msg_err_${Date.now()}`,
            conversationId: targetConvId,
            role: 'assistant',
            content: `**Error generating response:** ${err}\n\nPlease verify your environment configuration or review AI Studio Settings.`,
            timestamp: Date.now(),
            mode,
            error: true,
          };
          StorageService.addMessage(errorMsg);
          setMessages((prev) => [...prev.filter((m) => m.id !== assistantMsgId), errorMsg]);
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        onDone: () => {
          if (accumulatedText) {
            const finalAssistantMsg: Message = {
              id: assistantMsgId,
              conversationId: targetConvId,
              role: 'assistant',
              content: accumulatedText,
              timestamp: Date.now(),
              mode,
              model: settings.aiModel,
            };
            StorageService.addMessage(finalAssistantMsg);
          }
          setIsLoading(false);
          abortControllerRef.current = null;
        },
      },
      abortController.signal
    );
  };

  // Retry previous assistant message
  const handleRetryMessage = (msg: Message) => {
    // Find preceding user message
    const msgIndex = messages.findIndex((m) => m.id === msg.id);
    if (msgIndex > 0) {
      const precedingUserMsg = messages[msgIndex - 1];
      if (precedingUserMsg.role === 'user') {
        // Remove the assistant message and resend
        const filtered = messages.filter((m) => m.id !== msg.id);
        setMessages(filtered);
        StorageService.saveMessages(
          StorageService.getMessages().filter((m) => m.id !== msg.id)
        );
        AnalyticsService.track('retry_message', { messageId: msg.id });
        handleSendMessage(precedingUserMsg.content);
      }
    }
  };

  // Insert generated tool or hackathon asset directly into chat
  const handleInsertToChat = (content: string) => {
    AnalyticsService.track('tool_inserted_to_chat', { length: content.length });
    setCurrentView('app');
    handleSendMessage(content);
  };

  // Launch specific tool from Landing Page
  const handleExploreTool = (tool: ToolType) => {
    AnalyticsService.track('use_tool', { tool });
    setSelectedTool(tool);
    setIsToolsModalOpen(true);
  };

  const handleNavigateToChatFromBuilder = (initialPrompt?: string) => {
    setMode('hackathon');
    setCurrentView('app');
    if (initialPrompt) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        title: 'Hackathon Project Blueprint',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode: 'hackathon',
      };
      const updated = [newConv, ...conversations];
      setConversations(updated);
      StorageService.saveConversations(updated);
      setActiveConversationId(newConv.id);
      setMessages([]);
      handleSendMessage(initialPrompt);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070a12] overflow-hidden text-slate-100">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onSetView={setCurrentView}
        mode={mode}
        onToggleMode={handleToggleMode}
        onOpenTools={() => {
          setSelectedTool('architecture');
          setIsToolsModalOpen(true);
        }}
        onOpenHackathon={() => setIsHackathonModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentView === 'landing' ? (
          <div className="w-full h-full overflow-y-auto">
            <LandingPage
              onStartBuilding={() => {
                setCurrentView('app');
                if (conversations.length === 0) {
                  handleNewChat();
                }
              }}
              onExploreTool={handleExploreTool}
              onOpenHackathon={() => setIsHackathonModalOpen(true)}
              onOpenHackathonBuilder={() => setCurrentView('hackathon-builder')}
            />
          </div>
        ) : currentView === 'hackathon-builder' ? (
          <div className="w-full h-full overflow-y-auto">
            <HackathonBuilderPage
              onNavigateToChat={handleNavigateToChatFromBuilder}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          </div>
        ) : (
          <div className="flex w-full h-full overflow-hidden">
            {/* Sidebar */}
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={(id) => {
                setActiveConversationId(id);
                setIsMobileSidebarOpen(false);
              }}
              onNewChat={handleNewChat}
              onDeleteConversation={handleDeleteConversation}
              onRenameConversation={handleRenameConversation}
              onToggleReadOnly={handleToggleReadOnly}
              onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
              mode={mode}
              onToggleMode={handleToggleMode}
              onOpenTools={() => setIsToolsModalOpen(true)}
              onOpenHackathonBuilder={() => setCurrentView('hackathon-builder')}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              currentUser={currentUser}
              isOpen={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            {/* Main Chat Interface */}
            <ChatWindow
              conversation={activeConv}
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              onClearConversation={handleClearConversation}
              onNewChat={handleNewChat}
              onToggleReadOnly={handleToggleReadOnly}
              onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
              mode={mode}
              model={settings.aiModel || 'gemini-3.8-flash'}
              onOpenTools={() => setIsToolsModalOpen(true)}
              onOpenHackathon={() => setIsHackathonModalOpen(true)}
              onOpenHackathonBuilder={() => setCurrentView('hackathon-builder')}
              onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              onRetryMessage={handleRetryMessage}
            />
          </div>
        )}
      </main>

      {/* Interactive AI Tools Modal */}
      <ToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        initialTool={selectedTool}
        onInsertToChat={handleInsertToChat}
      />

      {/* Hackathon Builder Suite Modal */}
      <HackathonPanel
        isOpen={isHackathonModalOpen}
        onClose={() => setIsHackathonModalOpen(false)}
        onInsertToChat={handleInsertToChat}
        onOpenFullBuilder={() => setCurrentView('hackathon-builder')}
      />

      {/* App Settings Modal */}
      <SettingsPanel
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          StorageService.saveSettings(newSettings);
        }}
        onClearHistory={() => {
          StorageService.clearAllData();
          setConversations([]);
          setMessages([]);
          handleNewChat();
        }}
      />

      {/* Developer Authentication / Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
