import { Message, ChatMode } from '../types';

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onError: (err: string) => void;
  onDone: () => void;
}

export const ApiService = {
  async streamChat(
    messages: Message[],
    mode: ChatMode,
    model: string,
    customPrompt: string,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode,
          model,
          systemInstructionCustom: customPrompt,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        callbacks.onError(`API error (${response.status}): ${errorText}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError('Response stream body unavailable');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              if (data.error) {
                callbacks.onError(data.error);
              } else if (data.text) {
                callbacks.onChunk(data.text);
              }
              if (data.done) {
                callbacks.onDone();
                return;
              }
            } catch (e) {
              console.warn('Failed parsing stream chunk:', jsonStr, e);
            }
          }
        }
      }

      callbacks.onDone();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callbacks.onDone();
        return;
      }
      callbacks.onError(err?.message || 'Network request failed');
    }
  },

  async runTool(tool: string, params: Record<string, string>): Promise<{ tool: string; content: string; isSimulated: boolean }> {
    const response = await fetch('/api/tools/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, params }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Tool execution failed' }));
      throw new Error(err.error || 'Failed to run tool');
    }

    return response.json();
  },

  async runHackathonAction(action: string, params: Record<string, string>): Promise<{ action: string; content: string; isSimulated: boolean }> {
    const response = await fetch('/api/hackathon/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, params }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Hackathon generation failed' }));
      throw new Error(err.error || 'Failed to generate hackathon asset');
    }

    return response.json();
  },

  async buildHackathonProject(
    inputs: {
      projectIdea: string;
      problemStatement: string;
      targetUsers: string;
      preferredTechnologies: string[];
      experienceLevel: string;
    },
    callbacks: {
      onChunk: (chunk: string) => void;
      onError: (err: string) => void;
      onDone: () => void;
    },
    signal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetch('/api/hackathon/build-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, stream: true }),
        signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error generating project' }));
        callbacks.onError(err.error || 'Failed to generate hackathon project');
        return;
      }

      if (!response.body) {
        callbacks.onError('ReadableStream not supported by browser');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.error) {
                callbacks.onError(data.error);
                return;
              }
              if (data.text) {
                callbacks.onChunk(data.text);
              }
              if (data.done) {
                callbacks.onDone();
                return;
              }
            } catch (e) {
              console.error('Failed to parse SSE data', e);
            }
          }
        }
      }

      callbacks.onDone();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callbacks.onDone();
      } else {
        callbacks.onError(err.message || 'Network error');
      }
    }
  },

  async checkHealth(): Promise<{ hasApiKey: boolean; service: string; defaultModel: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return { hasApiKey: false, service: 'Offline', defaultModel: 'gemini-3.8-flash' };
      return res.json();
    } catch {
      return { hasApiKey: false, service: 'Unreachable', defaultModel: 'gemini-3.8-flash' };
    }
  },
};
