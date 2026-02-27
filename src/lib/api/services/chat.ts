import { apiClient } from '../client';
import type { ListData, PageRequest } from '@/types/api';

export interface ChatSession {
  id: number;
  title: string;
  createtime: number;
  updatetime: number;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: string;
  content: string;
  createtime: number;
}

export class ChatService {
  private readonly basePath = '/chat';

  async listSessions(params: PageRequest = {}) {
    const requestParams = { page: 1, size: 50, ...params };
    return apiClient.get<ListData<ChatSession>>(
      `${this.basePath}/sessions`,
      requestParams,
    );
  }

  async createSession(title?: string) {
    return apiClient.post<ChatSession>(`${this.basePath}/sessions`, {
      title: title || '',
    });
  }

  async deleteSession(sessionId: number) {
    return apiClient.delete<void>(`${this.basePath}/sessions/${sessionId}`);
  }

  async listMessages(sessionId: number, params: PageRequest = {}) {
    const requestParams = { page: 1, size: 100, ...params };
    return apiClient.get<ListData<ChatMessage>>(
      `${this.basePath}/sessions/${sessionId}/messages`,
      requestParams,
    );
  }
}

export const chatService = new ChatService();
