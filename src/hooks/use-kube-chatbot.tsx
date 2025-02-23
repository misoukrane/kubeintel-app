import { useChat } from '@ai-sdk/react';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { useAIConfigStore } from '@/stores/use-ai-config-store';
import { useCallback } from 'react';

export function useKubeChatbot() {
  const { getAPIKey, selectedConfig, aiConfigs } = useAIConfigStore();

  const fetchAIResponse = useCallback(
    async (messages: any[]) => {
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
        });

        return result.toDataStreamResponse();
      } catch (error) {
        console.error('Failed to stream response:', error);
        throw new Error('Failed to get AI response');
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
        return await fetchAIResponse(messages);
      } catch (error) {
        console.error('Chat error:', error);
        throw error;
      }
    },
  });

  return {
    ...chat,
    isConfigured: selectedConfig !== undefined && aiConfigs.length > 0,
  };
}
