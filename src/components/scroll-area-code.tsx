import { CopyCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { stringify } from 'yaml';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ScrollAreaCodeProps {
  content: any;
  height: string;
  skipSerialization?: boolean;
  onCopy: (text: string) => void;
}

export const ScrollAreaCode = (props: ScrollAreaCodeProps) => {
  const [formatType, setFormatType] = useState<'json' | 'yaml'>('yaml');

  if (props.content == null || props.content == undefined) {
    return null;
  }

  // Handle content formatting
  let jsonContent = '';
  let yamlContent = '';

  try {
    if (props.skipSerialization) {
      jsonContent = props.content;
      try {
        // Try to parse and then convert to YAML if content is JSON
        const parsed = JSON.parse(props.content);
        yamlContent = stringify(parsed);
      } catch (e) {
        // If not valid JSON, just use the same content
        yamlContent = props.content;
      }
    } else {
      jsonContent = JSON.stringify(props.content, null, 2);
      yamlContent = stringify(props.content);
    }
  } catch (e) {
    console.error('Error formatting content:', e);
    jsonContent = props.skipSerialization
      ? props.content
      : JSON.stringify(props.content, null, 2);
    yamlContent = jsonContent;
  }

  const currentContent = formatType === 'json' ? jsonContent : yamlContent;

  return (
    <div className="group relative">
      <div className="flex justify-end mb-2">
        <Tabs
          value={formatType}
          onValueChange={(value) => setFormatType(value as 'json' | 'yaml')}
          className="w-[160px]"
        >
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
            <TabsTrigger
              value="json"
              className="rounded-sm text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              JSON
            </TabsTrigger>
            <TabsTrigger
              value="yaml"
              className="rounded-sm text-xs data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              YAML
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className={cn('w-full', props.height)}>
        <pre className="bg-muted p-4 rounded-md text-xs">
          <code className="whitespace-pre">{currentContent}</code>
        </pre>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Button
        className="absolute top-14 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-50"
        variant="outline"
        size="icon"
        onClick={() => props.onCopy(currentContent)}
      >
        <CopyCheckIcon />
      </Button>
    </div>
  );
};
