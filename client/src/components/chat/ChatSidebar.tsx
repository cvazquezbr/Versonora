import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Conversation {
  id: string;
  user_email: string;
  title: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (conversation: Conversation) => void;
  isAdmin: boolean;
  onFilterChange?: (filter: string) => void;
}

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelect,
  isAdmin,
  onFilterChange,
}: ChatSidebarProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div className="w-full md:w-80 border-r border-slate-100 h-full flex flex-col bg-white">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Conversas</h2>
        {isAdmin && (
          <Tabs defaultValue="all" value={activeFilter} onValueChange={handleFilterChange} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-8 p-1">
              <TabsTrigger value="all" className="text-[10px] py-1">Todas</TabsTrigger>
              <TabsTrigger value="unread" className="text-[10px] py-1">Não lidas</TabsTrigger>
              <TabsTrigger value="unanswered" className="text-[10px] py-1">Pendente</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Nenhuma conversa encontrada.
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                "w-full p-4 flex flex-col gap-1 border-b border-slate-50 transition-colors text-left",
                activeConversationId === conv.id
                  ? "bg-purple-50"
                  : "hover:bg-slate-50"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className="font-semibold text-slate-900 truncate flex-1">
                  {isAdmin ? conv.user_email : conv.title}
                </span>
                {conv.last_message_at && (
                  <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">
                    {format(new Date(conv.last_message_at), "HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center w-full">
                <p className="text-sm text-slate-500 truncate flex-1 pr-2">
                  {conv.last_message || "Inicie uma conversa..."}
                </p>
                {conv.unread_count > 0 && (
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
