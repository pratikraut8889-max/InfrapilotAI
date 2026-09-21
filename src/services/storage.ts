import { Conversation, Message, AppSettings, UserProfile } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS_PREFIX: 'infrapilot_conversations_',
  MESSAGES_PREFIX: 'infrapilot_messages_',
  ACTIVE_CONVERSATION_PREFIX: 'infrapilot_active_id_',
  LEGACY_CONVERSATIONS: 'infrapilot_conversations_v1',
  LEGACY_MESSAGES: 'infrapilot_messages_v1',
  LEGACY_ACTIVE_CONVERSATION: 'infrapilot_active_id_v1',
  SETTINGS: 'infrapilot_settings_v1',
  USER: 'infrapilot_user_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  aiModel: 'gemini-3.8-flash',
  systemPromptCustom: '',
  streamResponses: true,
  supabaseUrl: '',
  supabaseAnonKey: '',
  isSupabaseConnected: false,
  enableSoundFx: false,
  defaultMode: 'developer',
};

export const DEFAULT_USER: UserProfile = {
  id: 'dev_user_01',
  name: 'Dev Engineer',
  email: 'developer@aiinfrasummit.io',
  role: 'AI Systems Architect',
  hackathonTeam: 'InfraScale Zero',
  isGuest: false,
};

export const INITIAL_CONVERSATION: Conversation = {
  id: 'conv_welcome_01',
  title: 'Welcome to InfraPilot AI',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
  mode: 'developer',
  pinned: true,
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_welcome_init',
    conversationId: 'conv_welcome_01',
    role: 'assistant',
    content: `### Welcome to InfraPilot AI ⚡
I am your developer assistant for the **AI Infra Summit Hackathon**, specialized in high-performance AI infrastructure, model serving, and distributed systems.

Here is what we can do together:
- **vLLM & Inference Serving**: Optimize FP8 KV-caching, chunked prefill, and multi-GPU tensor parallelism.
- **RAG Architectures**: Design hybrid search pipelines with Qdrant, pgvector, and BGE rerankers.
- **CUDA & PyTorch Debugging**: Troubleshoot Out-Of-Memory (OOM) errors, shape mismatches, and latency jitter.
- **Hackathon Builder Mode**: Toggle to Hackathon mode in the sidebar to generate ideas, 36-hr sprint roadmaps, starter templates, and judge pitch scripts.
- **AI Infrastructure Tools**: Use our Architecture Generator, Prompt Optimizer, RAG Planner, and Deployment Checklist.

Try typing an error log, asking for an inference cluster setup, or click **Hackathon Builder**!`,
    timestamp: Date.now() - 3500000,
    mode: 'developer',
  },
];

export const StorageService = {
  getCurrentUserId(): string {
    try {
      const user = this.getUser();
      return user.id || 'dev_user_01';
    } catch {
      return 'dev_user_01';
    }
  },

  getConversationsKey(userId?: string): string {
    const uid = userId || this.getCurrentUserId();
    return `${STORAGE_KEYS.CONVERSATIONS_PREFIX}${uid}_v1`;
  },

  getMessagesKey(userId?: string): string {
    const uid = userId || this.getCurrentUserId();
    return `${STORAGE_KEYS.MESSAGES_PREFIX}${uid}_v1`;
  },

  getActiveConversationKey(userId?: string): string {
    const uid = userId || this.getCurrentUserId();
    return `${STORAGE_KEYS.ACTIVE_CONVERSATION_PREFIX}${uid}_v1`;
  },

  getConversations(userId?: string): Conversation[] {
    try {
      const key = this.getConversationsKey(userId);
      const data = localStorage.getItem(key);

      if (!data) {
        // Fallback: Check for legacy non-user-scoped data if this is the default user
        const currentUid = userId || this.getCurrentUserId();
        if (currentUid === DEFAULT_USER.id) {
          const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_CONVERSATIONS);
          if (legacy) {
            try {
              const parsed = JSON.parse(legacy);
              if (Array.isArray(parsed) && parsed.length > 0) {
                localStorage.setItem(key, legacy);
                return parsed;
              }
            } catch {
              // ignore
            }
          }
        }

        const initialList = [
          {
            ...INITIAL_CONVERSATION,
            id: `conv_${currentUid}_init`,
            title: `Welcome to InfraPilot (${currentUid === 'guest_judge_01' ? 'Judge Suite' : 'Dev Workspace'})`,
          },
        ];
        localStorage.setItem(key, JSON.stringify(initialList));
        return initialList;
      }

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [INITIAL_CONVERSATION];
    }
  },

  saveConversations(conversations: Conversation[], userId?: string): void {
    try {
      const key = this.getConversationsKey(userId);
      localStorage.setItem(key, JSON.stringify(conversations));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('infrapilot:autosaved', {
            detail: { timestamp: Date.now(), type: 'conversations', count: conversations.length },
          })
        );
      }
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  },

  getMessages(conversationId?: string, userId?: string): Message[] {
    try {
      const key = this.getMessagesKey(userId);
      const data = localStorage.getItem(key);
      let all: Message[] = [];

      if (!data) {
        const currentUid = userId || this.getCurrentUserId();
        if (currentUid === DEFAULT_USER.id) {
          const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_MESSAGES);
          if (legacy) {
            try {
              const parsed = JSON.parse(legacy);
              if (Array.isArray(parsed)) {
                all = parsed;
                localStorage.setItem(key, legacy);
              }
            } catch {
              all = INITIAL_MESSAGES;
            }
          } else {
            all = INITIAL_MESSAGES;
          }
        } else {
          all = [
            {
              ...INITIAL_MESSAGES[0],
              id: `msg_${currentUid}_init`,
              conversationId: `conv_${currentUid}_init`,
            },
          ];
        }
        localStorage.setItem(key, JSON.stringify(all));
      } else {
        all = JSON.parse(data);
      }

      if (conversationId) {
        return all.filter((m) => m.conversationId === conversationId);
      }
      return all;
    } catch {
      return INITIAL_MESSAGES;
    }
  },

  saveMessages(messages: Message[], userId?: string): void {
    try {
      const key = this.getMessagesKey(userId);
      localStorage.setItem(key, JSON.stringify(messages));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('infrapilot:autosaved', {
            detail: { timestamp: Date.now(), type: 'messages', count: messages.length },
          })
        );
      }
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  },

  addMessage(message: Message, userId?: string): void {
    const all = this.getMessages(undefined, userId);
    all.push(message);
    this.saveMessages(all, userId);

    // Update conversation updatedAt
    const conversations = this.getConversations(userId);
    const convIndex = conversations.findIndex((c) => c.id === message.conversationId);
    if (convIndex >= 0) {
      conversations[convIndex].updatedAt = message.timestamp;
      // Auto-title if still default
      if (
        (conversations[convIndex].title === 'New AI Infra Session' ||
          conversations[convIndex].title === 'New Conversation') &&
        message.role === 'user'
      ) {
        const cleanTitle = message.content.slice(0, 36).replace(/\n/g, ' ').trim();
        if (cleanTitle) {
          conversations[convIndex].title = cleanTitle;
        }
      }
      this.saveConversations(conversations, userId);
    }
  },

  deleteConversation(conversationId: string, userId?: string): void {
    const conversations = this.getConversations(userId).filter((c) => c.id !== conversationId);
    this.saveConversations(conversations, userId);

    const allMessages = this.getMessages(undefined, userId).filter(
      (m) => m.conversationId !== conversationId
    );
    this.saveMessages(allMessages, userId);
  },

  renameConversation(conversationId: string, newTitle: string, userId?: string): void {
    const conversations = this.getConversations(userId).map((c) => {
      if (c.id === conversationId) {
        return { ...c, title: newTitle.trim(), updatedAt: Date.now() };
      }
      return c;
    });
    this.saveConversations(conversations, userId);
  },

  toggleConversationReadOnly(conversationId: string, isReadOnly?: boolean, userId?: string): void {
    const conversations = this.getConversations(userId).map((c) => {
      if (c.id === conversationId) {
        const nextVal = isReadOnly !== undefined ? isReadOnly : !c.isReadOnly;
        return { ...c, isReadOnly: nextVal, updatedAt: Date.now() };
      }
      return c;
    });
    this.saveConversations(conversations, userId);
  },

  getActiveConversationId(userId?: string): string {
    const key = this.getActiveConversationKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) return stored;

    const convs = this.getConversations(userId);
    return convs.length > 0 ? convs[0].id : INITIAL_CONVERSATION.id;
  },

  setActiveConversationId(id: string, userId?: string): void {
    const key = this.getActiveConversationKey(userId);
    localStorage.setItem(key, id);
  },

  searchConversations(
    query: string,
    userId?: string
  ): { conversation: Conversation; matchedMessagesCount: number; snippet?: string }[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.getConversations(userId).map((conv) => ({
        conversation: conv,
        matchedMessagesCount: 0,
      }));
    }

    const conversations = this.getConversations(userId);
    const messages = this.getMessages(undefined, userId);

    const results: { conversation: Conversation; matchedMessagesCount: number; snippet?: string }[] = [];

    for (const conv of conversations) {
      const titleMatches = conv.title.toLowerCase().includes(q);
      const convMessages = messages.filter((m) => m.conversationId === conv.id);
      const matchedMsgs = convMessages.filter((m) => m.content.toLowerCase().includes(q));

      if (titleMatches || matchedMsgs.length > 0) {
        let snippet: string | undefined;
        if (matchedMsgs.length > 0) {
          const firstMsg = matchedMsgs[0];
          const idx = firstMsg.content.toLowerCase().indexOf(q);
          const start = Math.max(0, idx - 24);
          const end = Math.min(firstMsg.content.length, idx + q.length + 36);
          snippet = (start > 0 ? '...' : '') + firstMsg.content.slice(start, end).replace(/\n/g, ' ') + (end < firstMsg.content.length ? '...' : '');
        }

        results.push({
          conversation: conv,
          matchedMessagesCount: matchedMsgs.length,
          snippet,
        });
      }
    }

    return results;
  },

  getPersistenceInfo(): {
    mode: string;
    isCloudReady: boolean;
    description: string;
    requirements: string[];
  } {
    return {
      mode: 'Client-Side User-Isolated LocalStorage',
      isCloudReady: false,
      description:
        'Chat history and hackathon blueprints are persisted locally in the browser, strictly isolated per user account. When switching between developers or guest evaluator accounts, user data remains partitioned.',
      requirements: [
        'Firebase Firestore: Collection "users/{userId}/conversations/{convId}/messages" for durable cross-device sync.',
        'Firebase Authentication: Google Sign-In or Email/Password for verified user tokens.',
        'Firestore Security Rules: request.auth.uid == userId rule to enforce access control.',
        'Provisioning: Can be provisioned via Google AI Studio set_up_firebase or Cloud Run environment credentials.',
      ],
    };
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  exportData(userId?: string): string {
    const exportPayload = {
      app: 'InfraPilot AI',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      conversations: this.getConversations(userId),
      messages: this.getMessages(undefined, userId),
      settings: this.getSettings(),
    };
    return JSON.stringify(exportPayload, null, 2);
  },

  importData(jsonString: string, userId?: string): boolean {
    try {
      const payload = JSON.parse(jsonString);
      if (Array.isArray(payload.conversations)) {
        this.saveConversations(payload.conversations, userId);
      }
      if (Array.isArray(payload.messages)) {
        this.saveMessages(payload.messages, userId);
      }
      if (payload.settings) {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...payload.settings });
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  clearAllData(userId?: string): void {
    const uid = userId || this.getCurrentUserId();
    localStorage.removeItem(`${STORAGE_KEYS.CONVERSATIONS_PREFIX}${uid}_v1`);
    localStorage.removeItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${uid}_v1`);
    localStorage.removeItem(`${STORAGE_KEYS.ACTIVE_CONVERSATION_PREFIX}${uid}_v1`);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_ACTIVE_CONVERSATION);
  },
};
