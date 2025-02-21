import { cn } from "@/lib/utils";

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const CodeBlock = ({ inline, className, children, ...props }: CodeBlockProps) => {
  const processContent = (content: React.ReactNode): string => {
    if (typeof content === 'string') {
      return content.replace(/^`{1,3}|`{1,3}$/g, '').trim();
    }
    if (Array.isArray(content)) {
      return content.map(item => processContent(item)).join('');
    }
    return '';
  };

  const cleanContent = processContent(children);

  // Don't render anything if the content is empty
  if (!cleanContent) {
    return null;
  }

  // Handle inline code - important to check both the inline prop and the context
  if (inline || (typeof children === 'string' && !children.includes('\n'))) {
    return (
      <code
        className="bg-black/10 dark:bg-white/10 rounded px-1 whitespace-normal"
        {...props}
      >
        {cleanContent}
      </code>
    );
  }

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  return (
    <div className="relative max-w-[80%]">
      <pre className="overflow-x-auto text-primary rounded-lg bg-black/10 dark:bg-white/10 p-2 my-2 w-full">
        <code
          className={cn(
            "block min-w-full whitespace-pre text-sm",
            language && `language-${language}`
          )}
          {...props}
        >
          {cleanContent}
        </code>
      </pre>
    </div>
  );
};