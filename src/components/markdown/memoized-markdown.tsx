
import React from 'react';
import { cn } from '@/lib/utils';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

interface MemoizedMarkdownProps {
  content: string;
  className?: string;
}

export const MemoizedMarkdown = memo(({ content, className }: MemoizedMarkdownProps) => {
  // Clean up consecutive empty code blocks in the content
  const cleanContent = content.replace(/```\s*```/g, '');

  return (
    <div className={cn("max-w-[80%]", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          // Only render pre tags for actual code blocks
          pre: ({ children, ...props }) => {
            // Check if this is meant to be a code block
            const isCodeBlock = React.Children.toArray(children).some(
              child => React.isValidElement(child) && child.type === 'code' && child.props.children?.includes('\n')
            );

            if (!isCodeBlock) {
              return children;
            }

            return <pre {...props}>{children}</pre>;
          }
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
});

MemoizedMarkdown.displayName = 'MemoizedMarkdown';