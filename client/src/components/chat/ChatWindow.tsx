import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  title: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  currentUserId: string;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function ChatWindow({
  conversationId,
  title,
  messages,
  onSendMessage,
  onBack,
  currentUserId,
  loadingMore,
  hasMore,
  onLoadMore,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        if (loadingMore) {
          prevScrollHeightRef.current = viewport.scrollHeight;
        } else if (shouldAutoScroll) {
          viewport.scrollTop = viewport.scrollHeight;
        } else if (prevScrollHeightRef.current > 0) {
          // Keep scroll position after loading more
          viewport.scrollTop = viewport.scrollHeight - prevScrollHeightRef.current;
          prevScrollHeightRef.current = 0;
        }
      }
    }
  }, [messages, loadingMore, shouldAutoScroll]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newMessage.trim()) {
      setShouldAutoScroll(true);
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const viewport = e.currentTarget;
    const isAtTop = viewport.scrollTop === 0;
    const isAtBottom = Math.abs(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop) < 10;

    setShouldAutoScroll(isAtBottom);

    if (isAtTop && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Sticky Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-white sticky top-0 z-10">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4" onScroll={handleScroll}>
        <div className="flex flex-col">
          {hasMore && (
            <div className="flex justify-center py-2">
              {loadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              ) : (
                <span className="text-[10px] text-slate-400">Arraste para cima para carregar mais</span>
              )}
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-12">
              Nenhuma mensagem ainda. Comece a conversa!
            </div>
          ) : (
            messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === currentUserId}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-h-[40px] max-h-[120px] p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-purple-600 hover:bg-purple-700 h-auto px-4"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
