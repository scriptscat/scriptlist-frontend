import useSWR from 'swr';
import type { ListData } from '@/types/api';
import type { APIError } from '@/types/api';
import type { ChatSession, ChatMessage } from '../services/chat';
import { chatService } from '../services/chat';

export function useChatSessionList(shouldFetch: boolean = true) {
  const key = shouldFetch ? ['chat-sessions'] : null;

  return useSWR<ListData<ChatSession>, APIError>(
    key,
    () => chatService.listSessions(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

export function useChatMessages(
  sessionId: number | undefined,
  shouldFetch: boolean = true,
) {
  const key = sessionId && shouldFetch ? ['chat-messages', sessionId] : null;

  return useSWR<ListData<ChatMessage>, APIError>(
    key,
    () => chatService.listMessages(sessionId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}
