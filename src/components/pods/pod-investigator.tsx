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
import { ListEventsResult } from "@/lib/types";
import { ChatRequestOptions } from "ai";
import { PodLogsResult } from "@/lib/pods";

interface PodInvestigatorProps {
  pod: V1Pod;
  onAddNewAIConfig: () => void;
  listResourceEvents: () => Promise<ListEventsResult>;
  getContainerLogs: (containerName: string, tailLines?: number, limitBytes?: number) => Promise<PodLogsResult>;
}


export function PodInvestigator({ pod, onAddNewAIConfig, listResourceEvents, getContainerLogs }: PodInvestigatorProps) {
  const { messages, input, handleSubmit, handleInputChange, status: chatStatus, stop, error } = useKubeChatbot();
  const { aiConfigs, setSelectedConfig, selectedConfig } = useAIConfigStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const throttledScroll = useThrottledScroll(100);
  const [attachEvents, setAttachEvents] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const attachments = []
    attachments.push({
      name: 'pod.json',
      contentType: 'text/plain',
      url: `data:text/plain;base64,${btoa(JSON.stringify(pod))}`
    });

    // Check events
    if (attachEvents) {
      try {
        const events = await listResourceEvents();
        if (events.error) {
          throw new Error(events.error);
        }

        const eventsJson = JSON.stringify(events);
        const eventsDataUrl = `data:text/plain;base64,${btoa(eventsJson)}`;

        attachments.push({
          name: 'pod-events.json',
          contentType: 'text/plain',
          url: eventsDataUrl
        });
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch pod events',
          variant: 'destructive',
        });
        return; // Stop here if events fetch fails
      }
    }

    // Check logs
    if (selectedContainers.length > 0) {
      try {
        const logs = await Promise.all(
          selectedContainers.map(async (containerName) => {
            const logs = await getContainerLogs(containerName, 1000);
            if (logs.error) {
              throw new Error(logs.error);
            }
            return { containerName, logs: logs.data || '' };
          })
        );

        console.log(logs);

        logs.forEach(({ containerName, logs }) => {
          const logsDataUrl = `data:text/plain;base64,${btoa(logs)}`;

          attachments.push({
            name: `${containerName}-logs.json`,
            contentType: 'text/plain',
            url: logsDataUrl
          });
        });
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch pod logs',
          variant: 'destructive',
        });
        return; // Stop here if logs fetch fails
      }
    }

    const options: ChatRequestOptions = {
      experimental_attachments: attachments
    }

    try {
      await handleSubmit(e, options);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message with attachments',
        variant: 'destructive',
      });
    }
  }

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
      console.error('Chat Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
        fullError: error
      });
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
      <form onSubmit={onSubmit} className="mt-2 p-4">
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