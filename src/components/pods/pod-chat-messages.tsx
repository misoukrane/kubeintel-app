import { Message } from 'ai';
import { ScrollArea } from "../ui/scroll-area";
import { MemoizedMarkdown } from '../markdown/memoized-markdown';
import { cn } from "@/lib/utils";

interface PodChatMessagesProps {
  messages: Message[];
  viewportRef: React.RefObject<HTMLDivElement>;
}

export function PodChatMessages({ messages, viewportRef }: PodChatMessagesProps) {
  return (
    <ScrollArea
      viewportRef={viewportRef}
      className="h-[600px] w-full mt-4 border rounded-md bg-white dark:bg-black"
    >
      <div className="flex flex-col gap-4 p-4 w-full">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2",
                message.role === "assistant"
                  ? "bg-muted dark:bg-gray-900 text-primary prose dark:prose-invert min-w-full w-full"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {message.role === "assistant" ? (
                <MemoizedMarkdown
                  content={message.content}
                  className="bg-muted dark:bg-gray-900 text-primary prose dark:prose-invert max-w-none"
                />
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}