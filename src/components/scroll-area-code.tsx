import { CopyCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScrollAreaCodeProps {
  content: any;
  height: string;
  onCopy: (text: string) => void;
}

export const ScrollAreaCode = (props: ScrollAreaCodeProps) => {
  if (props.content == null || props.content == undefined) {
    return null;
  }

  return (
    <ScrollArea className={`group relative ${props.height}`}>
      <pre className="bg-muted p-2 rounded text-xs overflow-auto">
        <Button
          className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          variant="outline"
          size="icon"
          onClick={() => props.onCopy(JSON.stringify(props.content, null, 2))}
        >
          <CopyCheckIcon />
        </Button>
        {JSON.stringify(props.content, null, 2)}
      </pre>
    </ScrollArea>
  );
};
