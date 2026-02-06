import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { API_URL } from '@/lib/api-config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useChat() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const activeConversationRef = useRef<any>(null);
  const [currentFilter, setCurrentFilter] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<any[]>([]);

  // Keep ref in sync
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const { user } = useAuth();
  const offsetRef = useRef(0);
  const LIMIT = 20;

  const fetchConversations = useCallback(async (filter?: string) => {
    try {
      const actualFilter = filter !== undefined ? filter : currentFilter;
      const { data } = await axios.get(`${API_URL}/api/chat/conversations`, {
        params: { filter: actualFilter }
      });
      setConversations(data);
      if (filter !== undefined) setCurrentFilter(filter);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    }
  }, [currentFilter]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/chat/unread-count`);
      setUnreadTotal(data.count);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        offsetRef.current = 0;
        setHasMore(true);
      }

      const { data } = await axios.get(`${API_URL}/api/chat/conversations/${conversationId}/messages`, {
        params: {
          limit: LIMIT,
          offset: offsetRef.current,
        }
      });

      if (isLoadMore) {
        setMessages(prev => [...data, ...prev]);
      } else {
        setMessages(data);
        // Refresh conversations to update unread count for this conversation in the sidebar
        fetchConversations();
        fetchUnreadCount();
      }

      if (data.length < LIMIT) {
        setHasMore(false);
      }

      offsetRef.current += data.length;
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchConversations, fetchUnreadCount]);

  const loadMoreMessages = useCallback(() => {
    if (!activeConversation || loadingMore || !hasMore) return;
    fetchMessages(activeConversation.id, true);
  }, [activeConversation, loadingMore, hasMore, fetchMessages]);

  const sendMessage = async (content: string) => {
    if (!activeConversation) return;
    try {
      const { data } = await axios.post(`${API_URL}/api/chat/conversations/${activeConversation.id}/messages`, {
        content,
      });
      setMessages(prev => [...prev, data]);
      offsetRef.current += 1; // Increment offset as we added a new message manually
      fetchConversations();
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
      console.error('Failed to send message', error);
    }
  };

  const startConversation = async (title?: string, targetUserId?: string) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/chat/conversations`, {
        title,
        target_user_id: targetUserId
      });
      setActiveConversation(data);
      fetchConversations();
      return data;
    } catch (error) {
      console.error('Failed to start conversation', error);
    }
  };

  const renameConversation = async (id: string, title: string) => {
    try {
      const { data } = await axios.put(`${API_URL}/api/chat/conversations/${id}`, { title });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: data.title } : c));
      if (activeConversation?.id === id) {
        setActiveConversation(prev => ({ ...prev, title: data.title }));
      }
      toast.success('Conversa renomeada');
    } catch (error) {
      toast.error('Erro ao renomear conversa');
      console.error('Failed to rename conversation', error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/chat/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversation?.id === id) {
        setActiveConversation(null);
      }
      toast.success('Conversa excluída');
    } catch (error) {
      toast.error('Erro ao excluir conversa');
      console.error('Failed to delete conversation', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`${API_URL}/api/chat/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      fetchConversations();
      toast.success('Mensagem excluída');
    } catch (error) {
      toast.error('Erro ao excluir mensagem');
      console.error('Failed to delete message', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [user, fetchConversations, fetchUnreadCount]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    } else {
      setMessages([]);
      offsetRef.current = 0;
      setHasMore(true);
    }
  }, [activeConversation, fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !supabase) return;

    console.log('[Chat] Subscribing to messages realtime...');

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('[Chat] Realtime event received:', payload.eventType, payload);

          const currentActiveConv = activeConversationRef.current;

          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;

            if (currentActiveConv && newMessage.conversation_id === currentActiveConv.id) {
              setMessages(prev => {
                if (prev.find(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
              });
              offsetRef.current += 1;

              if (newMessage.sender_id !== user.userId) {
                fetchUnreadCount();
                fetchConversations();
              }
            } else {
              fetchConversations();
              fetchUnreadCount();

              if (newMessage.sender_id !== user.userId) {
                  toast.info('Nova mensagem recebida');
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedMessageId = payload.old.id;
            setMessages(prev => prev.filter(m => m.id !== deletedMessageId));
            fetchConversations();
            fetchUnreadCount();
          }
        }
      )
      .subscribe((status, err) => {
        console.log('[Chat] Realtime subscription status:', status);
        if (err) console.error('[Chat] Realtime subscription error:', err);
      });

    return () => {
      console.log('[Chat] Unsubscribing from messages realtime');
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, fetchConversations, fetchUnreadCount]);

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMoreMessages,
    sendMessage,
    startConversation,
    renameConversation,
    deleteConversation,
    deleteMessage,
    unreadTotal,
    refreshConversations: fetchConversations,
  };
}
