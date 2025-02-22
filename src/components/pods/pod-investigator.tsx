import { V1Pod } from "@kubernetes/client-node";
import { ScrollArea } from "../ui/scroll-area";
import { useKubeChatbot } from "@/hooks/use-kube-chatbot";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CircleStop, SendIcon } from "lucide-react";
import { useAIConfigStore } from "@/stores/use-ai-config-store";
import { AIConfigCombobox } from "../ai/ai-config-combobox";
import { useEffect, useRef, useState } from 'react';
import { MemoizedMarkdown } from '../markdown/memoized-markdown';
import { useThrottledScroll } from '@/hooks/use-throttled-scroll';
import { toast } from "@/hooks/use-toast";
import { MultiSelect } from "../ui/multi-select";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PodInvestigatorProps {
  pod: V1Pod;
  onAddNewAIConfig: () => void;
}


export function PodInvestigator({ pod, onAddNewAIConfig }: PodInvestigatorProps) {
  const { messages, input, handleSubmit, handleInputChange, status: chatStatus, stop, error } = useKubeChatbot();
  const { aiConfigs, setSelectedConfig, selectedConfig } = useAIConfigStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const throttledScroll = useThrottledScroll(100);
  const [attachEvents, setAttachEvents] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);

  useEffect(() => {
    const target = messagesEndRef.current;
    if (target) {
      const observer = new MutationObserver(() => {
        throttledScroll(target);
      });

      observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [throttledScroll]);

  useEffect(() => {
    if (error) {
      console.error('Error:', error.message);
      // use a toast or notification to show the error
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  return (
    <div className="bg-neutral-50 dark:bg-muted rounded-md">
      {/* <div className="flex flex-row items-center justify-between w-full">
        <div>
          <h3 className="bold">Pod Name</h3>
          <p className="text-xs">{metadata?.name || 'N/A'}</p>
        </div>
        <div>
          <h3 className="bold">Pod IP</h3>
          <p className="text-xs">{status?.podIP || 'N/A'}</p>
        </div>
        <div>
          <h3 className="bold">Node</h3>
          <p className="text-xs">
            {spec?.nodeName ? (
              <Link
                className='text-blue-600 hover:underline dark:text-blue-500'
                to={`/nodes/${spec.nodeName}`}>{spec.nodeName} </Link>
            ) : (
              'N/A'
            )}
          </p>
        </div>
        <div>
          <h3 className="bold">Pod IP</h3>
          <p className="text-xs">{status?.podIP || 'N/A'}</p>
        </div>
      </div> */}
      <ScrollArea
        viewportRef={messagesEndRef}
        className="h-[600px] w-full mt-4 border rounded-md bg-white dark:bg-black"
      >
        <div
          className="flex flex-col gap-4 p-4 w-full"
        >
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
      <form onSubmit={handleSubmit} className="mt-2 p-4">
        <div className="max-w-[80%] flex flex-col gap-2 rounded-3xl border p-4 mx-auto bg-white dark:bg-black" >
          <textarea
            name="prompt"
            value={input}
            dir="auto"
            onChange={handleInputChange}
            disabled={chatStatus === "submitted"}
            placeholder="Ask questions about this pod..."
            className="w-full bg-transparent focus:outline-none text-primary resize-none"
            style={{ height: "44px" }}
            rows={4}
          />
          <div className="flex flex-row justify-between gap-2">
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="attach-events"
                  checked={attachEvents}
                  onCheckedChange={setAttachEvents}
                />
                <Label htmlFor="attach-events" className="text-xs text-muted-foreground">
                  Include events
                </Label>
              </div>
              <MultiSelect
                options={pod.spec?.containers.map(container => ({
                  label: container.name,
                  value: container.name
                })) ?? []}
                value={selectedContainers}
                onValueChange={(values) => {
                  setSelectedContainers(values);
                }}
                placeholder="include logs"
                title="Include container logs in the prompt"
                className="text-xs"
              />
            </div>
            <div className="flex flex-row gap-2">
              <AIConfigCombobox
                aiConfigs={aiConfigs}
                selectedConfig={selectedConfig}
                setSelectedConfig={setSelectedConfig}
                onAddNewAIConfig={onAddNewAIConfig}
              />
              {chatStatus !== "submitted" && chatStatus !== "streaming" && (
                <Button
                  variant={input.trim() === '' ? "outline" : "default"}
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="transition-all duration-500 rounded-full hover:scale-110"
                >
                  <SendIcon />
                </Button>
              )}
              {(chatStatus === "submitted" || chatStatus === "streaming") && (
                <Button
                  variant="default"
                  type="button"
                  size="icon"
                  className="transition-all rounded-full animate-pulse"
                  onClick={stop}
                >
                  <CircleStop />
                </Button>)}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}