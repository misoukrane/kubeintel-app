import { useChat } from '@ai-sdk/react';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { useAIConfigStore } from '@/stores/use-ai-config-store';
import { useCallback, useRef } from 'react'; // Import useRef

export function useKubeChatbot() {
  const { getAPIKey, selectedConfig, aiConfigs } = useAIConfigStore();
  // Ref to store the specific error from the stream's onError
  const streamErrorRef = useRef<Error | null>(null);

  const fetchAIResponse = useCallback(
    async (messages: any[]) => {
      // Clear previous stream error at the start of a new request
      streamErrorRef.current = null;

      if (selectedConfig === undefined || !aiConfigs[selectedConfig]) {
        throw new Error('No AI configuration selected');
      }

      const config = aiConfigs[selectedConfig];
      let apiKey: string;

      try {
        apiKey = await getAPIKey(selectedConfig);
      } catch (error) {
        console.error('Failed to get API key:', error);
        throw new Error('Failed to retrieve API key');
      }

      let model;
      switch (config.provider) {
        case 'openai':
          const openai = createOpenAI({
            apiKey,
            baseURL: config.url || undefined,
            compatibility: 'strict',
          });
          model = openai(config.model);
          break;
        case 'google':
          const google = createGoogleGenerativeAI({
            apiKey,
            baseURL: config.url || undefined,
          });
          model = google(config.model);
          break;
        case 'anthropic':
          const anthropic = createAnthropic({
            apiKey,
            baseURL: config.url || undefined,
            headers: {
              'anthropic-dangerous-direct-browser-access': 'true',
            },
          });
          model = anthropic(config.model);
          break;
        default:
          throw new Error('Unsupported AI provider');
      }

      try {
        const result = streamText({
          model: model,
          system:
            'You are a helpful kubernetes assistant. Always answer in valid markdown. do no start you response with "markdown" or "```markdown".',
          messages,
          onError: (errorObj) => {
            // Store the specific error in the ref
            console.error(
              'Error captured in streaming response onError:',
              errorObj
            );
            // Extract the error from the object or create a new Error if it's not available
            const actualError =
              errorObj.error instanceof Error
                ? errorObj.error
                : new Error(
                    String(errorObj.error || 'Unknown streaming error')
                  );
            streamErrorRef.current = actualError;
          },
        });

        return result.toDataStreamResponse();
      } catch (error: any) {
        console.error('Failed to initiate stream response:', error);
        // Clear ref if setup fails
        streamErrorRef.current = null;
        throw error;
      }
    },
    [selectedConfig, aiConfigs, getAPIKey]
  );

  const chat = useChat({
    fetch: async (_: RequestInfo | URL, init?: RequestInit) => {
      if (!init?.body) {
        throw new Error('No message body provided');
      }

      try {
        const { messages } = JSON.parse(init.body as string);
        const resp = await fetchAIResponse(messages);
        console.log('Initial Response Status:', resp.status, resp.statusText);

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('Error response from AI service:', errorText);
          const error = new Error(
            `AI API Error: ${resp.status} ${resp.statusText}`
          );
          // Try to parse the error text as JSON for more details
          try {
            error.cause = JSON.parse(errorText);
          } catch {
            error.cause = errorText; // Assign raw text if not JSON
          }
          streamErrorRef.current = null; // Clear ref on non-ok response
          throw error;
        }
        return resp;
      } catch (error) {
        console.error('Error in useChat fetch:', error);
        // If a stream error was captured just before this, prioritize it
        if (streamErrorRef.current) {
          throw streamErrorRef.current;
        }
        throw error; // Re-throw so useChat sets its error state
      }
    },
  });

  return {
    ...chat,
    streamError: streamErrorRef,
    isConfigured: selectedConfig !== undefined && aiConfigs.length > 0,
  };
}
