import Header from "@/components/Header";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import { useChatContext } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";

export default function ChatPage() {
  const { user, isAdmin } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    startConversation,
    loadingMore,
    hasMore,
    loadMoreMessages,
  } = useChatContext();

  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  const handleSelectConversation = (conv: any) => {
    setActiveConversation(conv);
    setIsMobileListVisible(false);
  };

  const handleNewChat = async () => {
    const conv = await startConversation();
    if (conv) {
      handleSelectConversation(conv);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <Header />
      <div className="flex-1 pt-16 flex overflow-hidden">
        <div className={`${isMobileListVisible ? 'flex' : 'hidden'} md:flex w-full md:w-auto h-full`}>
          <div className="flex flex-col w-full">
            {!isAdmin() && conversations.length === 0 && (
                <div className="p-4 border-b border-slate-100">
                    <Button
                        onClick={handleNewChat}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white flex gap-2"
                    >
                        <MessageSquarePlus className="w-4 h-4" />
                        Iniciar Novo Chat
                    </Button>
                </div>
            )}
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConversation?.id}
              onSelect={handleSelectConversation}
              isAdmin={isAdmin()}
            />
          </div>
        </div>

        <div className={`${!isMobileListVisible ? 'flex' : 'hidden'} md:flex flex-1 h-full`}>
          {activeConversation ? (
            <ChatWindow
              conversationId={activeConversation.id}
              title={isAdmin() ? activeConversation.user_email : "Suporte Versonora"}
              messages={messages}
              onSendMessage={sendMessage}
              currentUserId={user?.userId || ''}
              onBack={() => setIsMobileListVisible(true)}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMoreMessages}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
              <MessageSquarePlus className="w-12 h-12 mb-4 opacity-20" />
              <p>Selecione uma conversa para começar</p>
              {!isAdmin() && conversations.length === 0 && (
                  <Button
                    onClick={handleNewChat}
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                  >
                      Começar agora
                  </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
