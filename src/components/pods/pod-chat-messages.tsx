import { Message } from 'ai';
import { ScrollArea } from "../ui/scroll-area";
import { MemoizedMarkdown } from '../markdown/memoized-markdown';
import { cn } from "@/lib/utils";
import { PodChatbotAttachment } from '@/lib/types';
import { Badge } from '../ui/badge';
import { FileText } from 'lucide-react';
import { Spinner } from '../spinner';

interface PodChatMessagesProps {
  messages: Message[];
  attachments: Map<number, PodChatbotAttachment[]>;
  viewportRef: React.RefObject<HTMLDivElement>;
  status: string;
}

export function PodChatMessages({ messages, attachments, viewportRef, status }: PodChatMessagesProps) {
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
                <>
                  <p className="text-sm">{message.content}</p>
                  <PodChatMessageAttachements attachments={attachments.get(index)} />
                </>
              )}
            </div>
          </div>
        ))}
        {status !== "" && (
          <div className="flex justify-end">
            <div className="rounded-lg px-4 py-2 bg-primary text-primary-foreground">
              <p className="text-sm"><Spinner className="bg-primary text-primary-foreground" /> {status}</p>
            </div>
          </div>
        )}



      </div>
    </ScrollArea>
  );
}

function PodChatMessageAttachements({ attachments }: { attachments?: PodChatbotAttachment[] }) {
  if (!attachments || attachments.length === 0) return <></>;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment, index) => (
        <Badge key={index} variant="secondary" className='text-xs inline-flex'>
          <FileText size={16} className='mr-1' /> {attachment.name}
        </Badge>
      ))}
    </div>
  );
}