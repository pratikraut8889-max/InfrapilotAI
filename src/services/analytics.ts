/**
 * InfraPilot AI Client-Side Analytics & Interaction Tracking Service
 * Tracks user interactions (new chat, tool usage, mode switches, prompt submission, etc.)
 * to monitor and improve the infrastructure assistant's UX without external tracking pixels.
 */

export type AnalyticsEventType =
  | 'new_chat'
  | 'send_message'
  | 'use_tool'
  | 'open_tools_modal'
  | 'switch_mode'
  | 'toggle_mode'
  | 'export_conversation'
  | 'toggle_read_only'
  | 'search_conversations'
  | 'search_in_chat'
  | 'open_hackathon_builder'
  | 'clear_conversation'
  | 'delete_conversation'
  | 'retry_message'
  | 'view_shortcuts'
  | 'run_tool'
  | 'tool_success'
  | 'tool_error'
  | 'copy_tool_output'
  | 'insert_tool_to_chat'
  | 'tool_inserted_to_chat';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: number;
  properties?: Record<string, string | number | boolean | undefined>;
}

const STORAGE_KEY = 'infrapilot_analytics_events_v1';
const MAX_STORED_EVENTS = 300;

// Persistent or session-based visitor ID
const getSessionId = (): string => {
  try {
    let sid = sessionStorage.getItem('infrapilot_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem('infrapilot_session_id', sid);
    }
    return sid;
  } catch {
    return 'session_local';
  }
};

export const AnalyticsService = {
  /**
   * Track an interaction event
   */
  track(type: AnalyticsEventType, properties?: Record<string, string | number | boolean | undefined>): void {
    try {
      const event: AnalyticsEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type,
        timestamp: Date.now(),
        properties: {
          sessionId: getSessionId(),
          ...properties,
        },
      };

      const existing = this.getEvents();
      existing.unshift(event);
      if (existing.length > MAX_STORED_EVENTS) {
        existing.length = MAX_STORED_EVENTS;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

      // Console logging in dev mode for transparent visibility
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[InfraPilot Analytics] 📊 ${type}`, properties);
      }

      // Notify any active UI listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('infrapilot:analytics_event', { detail: event })
        );
      }
    } catch (err) {
      console.warn('Failed to record analytics event:', err);
    }
  },

  /**
   * Retrieve all recorded events
   */
  getEvents(): AnalyticsEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Get recent events with a friendly display name
   */
  getRecentEvents(limit = 20): Array<{ id: string; name: string; timestamp: number; properties?: any }> {
    return this.getEvents()
      .slice(0, limit)
      .map((e) => ({
        id: e.id,
        name: e.type,
        timestamp: e.timestamp,
        properties: e.properties,
      }));
  },

  /**
   * Get metrics summary for UI dashboards
   */
  getMetricsSummary(): {
    totalEvents: number;
    chatsStarted: number;
    messagesSent: number;
    toolsUsed: number;
    searchesPerformed: number;
  } {
    const events = this.getEvents();
    return {
      totalEvents: events.length,
      chatsStarted: events.filter((e) => e.type === 'new_chat').length,
      messagesSent: events.filter((e) => e.type === 'send_message').length,
      toolsUsed: events.filter(
        (e) =>
          e.type === 'use_tool' ||
          e.type === 'run_tool' ||
          e.type === 'open_tools_modal' ||
          e.type === 'insert_tool_to_chat' ||
          e.type === 'tool_inserted_to_chat'
      ).length,
      searchesPerformed: events.filter(
        (e) => e.type === 'search_in_chat' || e.type === 'search_conversations'
      ).length,
    };
  },

  /**
   * Get interaction aggregate metrics
   */
  getStats(): {
    totalEvents: number;
    newChatsCount: number;
    messagesCount: number;
    toolsUsedCount: number;
    modeSwitchesCount: number;
    exportsCount: number;
  } {
    const events = this.getEvents();
    return {
      totalEvents: events.length,
      newChatsCount: events.filter((e) => e.type === 'new_chat').length,
      messagesCount: events.filter((e) => e.type === 'send_message').length,
      toolsUsedCount: events.filter(
        (e) =>
          e.type === 'use_tool' ||
          e.type === 'run_tool' ||
          e.type === 'open_tools_modal' ||
          e.type === 'insert_tool_to_chat' ||
          e.type === 'tool_inserted_to_chat'
      ).length,
      modeSwitchesCount: events.filter((e) => e.type === 'switch_mode' || e.type === 'toggle_mode').length,
      exportsCount: events.filter((e) => e.type === 'export_conversation').length,
    };
  },

  /**
   * Clear all analytics events
   */
  clearEvents(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
