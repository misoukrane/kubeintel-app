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
import { ErrorDialog } from "@/components/ui/error-dialog";

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
    error, // Generic error state from useChat
    streamError, // Ref containing specific error from onError
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
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const processedErrorRef = useRef(false); // Prevent double processing

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
    // Check if there's an error state from useChat OR a specific stream error
    const specificError = streamError.current;
    const genericError = error;

    if ((genericError || specificError) && !processedErrorRef.current) {
      processedErrorRef.current = true; // Mark as processing
      const errorToProcess = specificError || genericError; // Prioritize specific error

      console.error('Handling Chat Error:', errorToProcess);
      console.error('Chat Error Details:', {
        name: errorToProcess?.name,
        message: errorToProcess?.message,
        stack: errorToProcess?.stack,
        cause: (errorToProcess as any)?.cause,
        isSpecific: !!specificError,
        fullError: errorToProcess,
      });

      let errorInfo: {
        message: string;
        type?: string;
        code?: string;
        param?: string;
        rawCause?: any;
      } = {
        message: errorToProcess?.message || 'Unknown error occurred',
        rawCause: (errorToProcess as any)?.cause,
      };

      // Attempt to extract details if the error looks like an AI SDK error structure
      // The specific error from streamErrorRef might already be structured
      const cause = (errorToProcess as any)?.cause;
      let errorData = (errorToProcess as any)?.error || (typeof cause === 'object' && cause !== null ? cause.error : null);

      // Sometimes the error object itself might have the details (common in streamText onError)
      if (!errorData && typeof errorToProcess === 'object' && errorToProcess !== null && (errorToProcess as any).type && (errorToProcess as any).message) {
        errorData = errorToProcess;
      }


      if (errorData && typeof errorData === 'object') {
        errorInfo = {
          message: errorData.message || errorInfo.message,
          type: errorData.type,
          code: errorData.code,
          param: errorData.param,
          rawCause: errorInfo.rawCause, // Keep original cause if needed
        };
      } else if (typeof cause === 'string') {
        // If cause is a string, try parsing or use directly
        try {
          const parsedCause = JSON.parse(cause);
          if (parsedCause.error && parsedCause.error.message) {
            errorInfo.message = parsedCause.error.message;
            errorInfo.type = parsedCause.error.type;
            errorInfo.code = parsedCause.error.code;
          } else if (parsedCause.message) {
            errorInfo.message = parsedCause.message;
          }
        } catch (e) {
          // Use string cause if it provides more info than the main message
          if (errorInfo.message === 'Unknown error occurred' || errorInfo.message === 'An error occurred.') {
            errorInfo.message = cause;
          }
        }
      }


      // Set error details for the dialog
      setErrorDetails(errorInfo);
      console.log('Error details for dialog:', errorInfo);
      console.log('Error details for dialog2:', error);
      setShowErrorDialog(true);

      // Show toast for immediate notification
      toast({
        title: errorInfo.type || 'Error',
        description: errorInfo.code
          ? `${errorInfo.message} (Code: ${errorInfo.code})`
          : errorInfo.message,
        variant: 'destructive',
      });

      // Reset the specific error ref after handling
      streamError.current = null;
    } else if (!genericError && !specificError) {
      // Reset processing flag if errors are cleared
      processedErrorRef.current = false;
    }
  }, [error, streamError]); // Depend on both error and the ref wrapper

  return (
    <div className="bg-neutral-50 dark:bg-muted rounded-md">
      <PodChatMessages
        messages={messages}
        attachments={attachements}
        status={loadingStatus}
        viewportRef={messagesEndRef}
        onCopy={onCopy}
        chatStatus={chatStatus}
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

      {/* Error Dialog */}
      <ErrorDialog
        open={showErrorDialog}
        onClose={() => {
          setShowErrorDialog(false);
          processedErrorRef.current = false; // Allow processing next error
          streamError.current = null; // Ensure ref is clear on close
        }}
        error={errorDetails}
      />
    </div>
  );
}
