import { Attachment, Message } from 'ai';
import { ScrollArea } from '../ui/scroll-area';
import { MemoizedMarkdown } from '../markdown/memoized-markdown';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { FileText } from 'lucide-react';
import { Spinner } from '../spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useEffect, useState } from 'react';
import { ScrollAreaCode } from '../scroll-area-code';
import { ATTACHEMENT_NAMES } from '@/lib/types';

interface PodChatMessagesProps {
  messages: Message[];
  attachments: Map<number, Attachment[]>;
  viewportRef: React.RefObject<HTMLDivElement>;
  onCopy: (text: string) => void;
  status: string;
  chatStatus: string;
}

export function PodChatMessages({
  messages,
  attachments,
  viewportRef,
  status,
  chatStatus,
  onCopy,
}: PodChatMessagesProps) {
  const [openAttachementDialog, setOpenAttachementDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');

  function handleAttachmentClick(title: string, content: string) {
    setDialogTitle(title);
    setDialogContent(content);
    setOpenAttachementDialog(true);
  }
  return (
    <>
      <ScrollArea
        viewportRef={viewportRef}
        className="h-[600px] w-full mt-4 rounded-md bg-white dark:bg-black border-2 border-blue-700 shadow-md shadow-blue-700"
      >
        <div className="flex flex-col gap-4 p-4 w-full">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'rounded-lg px-4 py-2',
                  message.role === 'assistant'
                    ? 'bg-secondary'
                    : 'bg-primary text-secondary'
                )}
              >
                {message.role === 'assistant' ? (
                  <MemoizedMarkdown
                    content={message.content}
                    className="bg-secondary text-primary prose prose-sm dark:prose-invert  max-w-none"
                  />
                ) : (
                  <>
                    <p className="text-sm">{message.content}</p>
                    <PodChatMessageAttachements
                      attachments={attachments.get(index)}
                      onClick={handleAttachmentClick}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
          {status !== '' && (
            <div className="flex justify-end">
              <div className="rounded-lg px-4 py-2 bg-secondary">
                <p className="text-sm">
                  <Spinner />
                  {status}
                </p>
              </div>
            </div>
          )}
          {chatStatus === 'submitted' && (
            <div className="flex justify-center">
              <Spinner />
            </div>
          )}
        </div>
      </ScrollArea>
      <PodChatMessageAttachementDialog
        open={openAttachementDialog}
        onOpenChange={setOpenAttachementDialog}
        title={dialogTitle}
        content={dialogContent}
        onCopy={onCopy}
      />
    </>
  );
}

function PodChatMessageAttachements({
  attachments,
  onClick,
}: {
  attachments?: Attachment[];
  onClick: (title: string, content: string) => void;
}) {
  if (!attachments || attachments.length === 0) return <></>;

  const handleClick = (attachment: Attachment) => {
    let content = attachment.url.startsWith('data:')
      ? atob(decodeURIComponent(attachment.url.split(',')[1]))
      : attachment.url;
    if (
      attachment.name === ATTACHEMENT_NAMES.POD ||
      attachment.name === ATTACHEMENT_NAMES.POD_EVENTS
    ) {
      console.log('parsing content');
      const json = JSON.parse(content);
      console.log(json);
      content = JSON.stringify(json, null, 2);
      console.log(content);
    }

    onClick(attachment.name || '', content);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-xs inline-flex cursor-pointer"
          onClick={() => handleClick(attachment)}
        >
          <FileText size={16} className="mr-1" /> {attachment.name}
        </Badge>
      ))}
    </div>
  );
}

interface PodChatMessageAttachementDialogProps {
  open: boolean;
  title: string;
  content: string;
  onOpenChange: (open: boolean) => void;
  onCopy: (text: string) => void;
}

function PodChatMessageAttachementDialog({
  open,
  onOpenChange,
  title,
  content,
  onCopy,
}: PodChatMessageAttachementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[400px] max-w-[800px] h-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="min-w-[400px] max-w-[800px] h-[450px]">
          <ScrollAreaCode
            height="h-[400px]"
            content={content}
            onCopy={onCopy}
            skipSerialization={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
