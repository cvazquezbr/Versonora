import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (id: string) => void;
}

export default function ChatBubble({ message, isOwn, onDelete }: ChatBubbleProps) {
  const date = new Date(message.created_at);
  const time = format(date, "HH:mm");

  const handleDelete = () => {
    if (window.confirm("Deseja excluir esta mensagem?")) {
        onDelete?.(message.id);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col mb-4 max-w-[80%] group",
        isOwn ? "self-end items-end" : "self-start items-start"
      )}
    >
      <div className="flex items-center gap-2">
        {isOwn && !message.is_read && (
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                onClick={handleDelete}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        )}
        <div
            className={cn(
            "px-4 py-2 rounded-2xl text-sm",
            isOwn
                ? "bg-purple-600 text-white rounded-tr-none"
                : "bg-slate-100 text-slate-900 rounded-tl-none"
            )}
        >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[10px] text-slate-400">{time}</span>
        {isOwn && (
          <span className="text-slate-400">
            {message.is_read ? (
              <CheckCheck className="w-3 h-3 text-purple-600" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
