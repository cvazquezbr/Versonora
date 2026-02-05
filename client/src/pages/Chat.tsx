import Header from "@/components/Header";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import { useChatContext } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
    refreshConversations,
  } = useChatContext();

  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");

  const handleSelectConversation = (conv: any) => {
    setActiveConversation(conv);
    setIsMobileListVisible(false);
  };

  const handleNewChat = async () => {
    if (isAdmin()) {
        fetchUsers();
        setIsUserModalOpen(true);
    } else {
        const title = `Conversa #${conversations.length + 1}`;
        const conv = await startConversation(title);
        if (conv) {
          handleSelectConversation(conv);
        }
    }
  };

  const fetchUsers = async () => {
    try {
        const { data } = await axios.get(`${API_URL}/api/admin`);
        setUsers(data);
    } catch (error) {
        console.error("Failed to fetch users", error);
    }
  };

  const handleStartConversationWithUser = async (targetUser: any) => {
    const title = `Conversa com ${targetUser.email}`;
    const conv = await startConversation(title, targetUser.id);
    if (conv) {
        handleSelectConversation(conv);
        setIsUserModalOpen(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchUser.toLowerCase()) && u.id !== user?.userId
  );

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <Header />
      <div className="flex-1 pt-16 flex overflow-hidden">
        <div className={`${isMobileListVisible ? 'flex' : 'hidden'} md:flex w-full md:w-auto h-full`}>
          <div className="flex flex-col w-full">
            <div className="p-4 border-b border-slate-100">
                <Button
                    onClick={handleNewChat}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white flex gap-2"
                >
                    <MessageSquarePlus className="w-4 h-4" />
                    Nova Conversa
                </Button>
            </div>
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConversation?.id}
              onSelect={handleSelectConversation}
              isAdmin={isAdmin()}
              onFilterChange={(filter) => refreshConversations(filter)}
            />
          </div>
        </div>

        <div className={`${!isMobileListVisible ? 'flex' : 'hidden'} md:flex flex-1 h-full`}>
          {activeConversation ? (
            <ChatWindow
              conversationId={activeConversation.id}
              title={isAdmin() ? activeConversation.user_email : activeConversation.title}
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
              <Button
                onClick={handleNewChat}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                  Nova Conversa
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Iniciar conversa com usuário</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar usuário..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-4">Nenhum usuário encontrado</p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversationWithUser(u)}
                    className="w-full p-3 text-left hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors"
                  >
                    <p className="font-medium text-slate-900">{u.email}</p>
                    <p className="text-xs text-slate-500">{u.roles?.includes('admin') ? 'Administrador' : 'Usuário'}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
