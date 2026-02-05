import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { API_URL } from '@/lib/api-config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useChat() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const { user } = useAuth();
  const offsetRef = useRef(0);
  const LIMIT = 20;

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/chat/conversations`);
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    }
  }, []);

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

  const startConversation = async (title?: string) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/chat/conversations`, { title });
      setActiveConversation(data);
      fetchConversations();
      return data;
    } catch (error) {
      console.error('Failed to start conversation', error);
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

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new;

          // If message belongs to active conversation, add it
          if (activeConversation && newMessage.conversation_id === activeConversation.id) {
            setMessages(prev => {
              if (prev.find(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
            offsetRef.current += 1;

            // Mark as read if we are looking at it
            if (newMessage.sender_id !== user.userId) {
              // Instead of full fetch, we could have a dedicated "mark-as-read" endpoint
              // but for now we keep it simple or just rely on the next fetch.
              // To avoid inefficient GET, we can do a PATCH if we had it.
              // For now, let's just update the unread count locally if possible.
              fetchUnreadCount();
            }
          } else {
            fetchConversations();
            fetchUnreadCount();

            if (newMessage.sender_id !== user.userId) {
                toast.info('Nova mensagem recebida');
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, activeConversation, fetchConversations, fetchUnreadCount]);

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
    unreadTotal,
    refreshConversations: fetchConversations,
  };
}
