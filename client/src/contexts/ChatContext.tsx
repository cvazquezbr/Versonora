import React, { createContext, useContext, ReactNode } from 'react';
import { useChat } from '@/hooks/useChat';

interface ChatContextType {
  conversations: any[];
  activeConversation: any;
  setActiveConversation: (conv: any) => void;
  messages: any[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMoreMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
  startConversation: (title?: string) => Promise<any>;
  unreadTotal: number;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat();
  return <ChatContext.Provider value={chat as ChatContextType}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
