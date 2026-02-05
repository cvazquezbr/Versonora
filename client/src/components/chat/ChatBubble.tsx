import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

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
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const date = new Date(message.created_at);
  const time = format(date, "HH:mm");

  return (
    <div
      className={cn(
        "flex flex-col mb-4 max-w-[80%]",
        isOwn ? "self-end items-end" : "self-start items-start"
      )}
    >
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
