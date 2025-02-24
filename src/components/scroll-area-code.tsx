import { CopyCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ScrollAreaCodeProps {
  content: any;
  height: string;
  skipSerialization?: boolean;
  onCopy: (text: string) => void;
}

export const ScrollAreaCode = (props: ScrollAreaCodeProps) => {
  if (props.content == null || props.content == undefined) {
    return null;
  }
  const content = props.skipSerialization
    ? props.content
    : JSON.stringify(props.content, null, 2);

  return (
    <div className="group relative">
      <ScrollArea className={cn('w-full', props.height)}>
        <pre className="bg-muted p-4 rounded-md text-xs">
          <code className="whitespace-pre">{content}</code>
        </pre>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button
        className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-50"
        variant="outline"
        size="icon"
        onClick={() => props.onCopy(content)}
      >
        <CopyCheckIcon />
      </Button>
    </div>
  );
};
