import { V1Pod } from '@kubernetes/client-node';
import { useKubeChatbot } from '@/hooks/use-kube-chatbot';
import { useAIConfigStore } from '@/stores/use-ai-config-store';
import { useEffect, useRef, useState } from 'react';
import { useThrottledScroll } from '@/hooks/use-throttled-scroll';
import { toast } from '@/hooks/use-toast';
import { ATTACHEMENT_NAMES, ListEventsResult } from '@/lib/types';
import { Attachment, ChatRequestOptions } from 'ai';
import { PodLogsResult } from '@/lib/pods';
import { PodChatMessages } from './pod-chat-messages';
import { PodChatInput } from './pod-chat-input';
import { getAttachemntLogName } from '@/lib/strings';

interface PodChatbotProps {
  pod: V1Pod;
  onAddNewAIConfig: () => void;
  listResourceEvents: () => Promise<ListEventsResult>;
  getContainerLogs: (
    containerName: string,
    tailLines?: number,
    limitBytes?: number
  ) => Promise<PodLogsResult>;
  onCopy: (text: string) => void;
}

export function PodChatbot({
  pod,
  onAddNewAIConfig,
  listResourceEvents,
  getContainerLogs,
  onCopy,
}: PodChatbotProps) {
  const {
    messages,
    input,
    handleSubmit,
    handleInputChange,
    status: chatStatus,
    stop,
    error,
  } = useKubeChatbot();
  const { aiConfigs, setSelectedConfig, selectedConfig } = useAIConfigStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const throttledScroll = useThrottledScroll(100);
  const [attachEvents, setAttachEvents] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [attachements, setAttachements] = useState<Map<number, Attachment[]>>(
    new Map()
  );
  const [loadingStatus, setLoadingStatus] = useState<string>('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const experimentalAttachments = [];
    experimentalAttachments.push({
      name: ATTACHEMENT_NAMES.POD,
      contentType: 'text/plain',
      url: `data:text/plain;base64,${btoa(JSON.stringify(pod))}`,
    });

    // Check events
    if (attachEvents) {
      try {
        setLoadingStatus('Fetching events...');
        const events = await listResourceEvents();
        if (events.error) {
          throw new Error(events.error);
        }

        const eventsJson = JSON.stringify(events);
        const eventsDataUrl = `data:text/plain;base64,${btoa(eventsJson)}`;

        experimentalAttachments.push({
          name: ATTACHEMENT_NAMES.POD_EVENTS,
          contentType: 'text/plain',
          url: eventsDataUrl,
        });
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch pod events',
          variant: 'destructive',
        });
        return; // Stop here if events fetch fails
      } finally {
        setLoadingStatus('');
      }
    }

    // Check logs
    if (selectedContainers.length > 0) {
      try {
        setLoadingStatus('Fetching logs...');
        const logs = await Promise.all(
          selectedContainers.map(async (containerName) => {
            const logs = await getContainerLogs(containerName);
            if (logs.error) {
              throw new Error(logs.error);
            }
            return { containerName, logs: logs.data || '' };
          })
        );

        console.log(logs);

        logs.forEach(({ containerName, logs }) => {
          const logsDataUrl = `data:text/plain;base64,${btoa(logs)}`;

          experimentalAttachments.push({
            name: getAttachemntLogName(containerName),
            contentType: 'text/plain',
            url: logsDataUrl,
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
      } finally {
        setLoadingStatus('');
      }
    }

    const options: ChatRequestOptions = {
      experimental_attachments: experimentalAttachments,
    };

    // use setAttachements to update the attachments state

    attachements.set(messages.length, experimentalAttachments);
    setAttachements(attachements);

    try {
      setLoadingStatus('Sending message with attachments...');
      await handleSubmit(e, options);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message with attachments',
        variant: 'destructive',
      });
    } finally {
      setLoadingStatus('');
    }
  };

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
        fullError: error,
      });
      // use a toast or notification to show the error
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <div className="bg-neutral-50 dark:bg-muted rounded-md">
      <PodChatMessages
        messages={messages}
        attachments={attachements}
        status={loadingStatus}
        viewportRef={messagesEndRef}
        onCopy={onCopy}
      />
      <form onSubmit={onSubmit} className="mt-2 p-4">
        <PodChatInput
          input={input}
          onInputChange={handleInputChange}
          chatStatus={chatStatus}
          attachEvents={attachEvents}
          setAttachEvents={setAttachEvents}
          selectedContainers={selectedContainers}
          setSelectedContainers={setSelectedContainers}
          containers={pod.spec?.containers || []}
          aiConfigs={aiConfigs}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          onAddNewAIConfig={onAddNewAIConfig}
          onStop={stop}
        />
      </form>
    </div>
  );
}
