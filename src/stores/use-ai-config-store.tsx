import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import superjson from 'superjson';
import { credentials } from '@/lib/credentials';

const Providers = ['openai', 'google', 'anthropic'] as const;

export interface AIConfig {
  url: string;
  provider: (typeof Providers)[number];
  model: string;
  secretKey: string;
}

interface AIConfigState {
  aiConfigs: AIConfig[];
  selectedConfig?: number;
  error: Error | null;
  addAIConfig: (config: AIConfig & { apiKey: string }) => Promise<void>;
  removeAIConfig: (index: number) => Promise<void>;
  updateAIConfig: (
    index: number,
    config: Partial<AIConfig & { apiKey?: string }>
  ) => Promise<void>;
  setSelectedConfig: (index: number) => void;
  getAPIKey: (index: number) => Promise<string>;
}

const storage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const parsed = superjson.parse(str) as any;
    return parsed;
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      aiConfigs: [],
      selectedConfig: undefined,
      error: null,

      addAIConfig: async (config) => {
        try {
          const secretKey = `ai-config-${Date.now()}`;
          await credentials.setSecret({ key: secretKey, value: config.apiKey });

          const configToStore = {
            url: config.url,
            provider: config.provider,
            model: config.model,
            secretKey,
          };

          set((state) => ({
            aiConfigs: [...state.aiConfigs, configToStore],
            selectedConfig:
              state.selectedConfig === undefined ? 0 : state.selectedConfig,
            error: null,
          }));
        } catch (error) {
          set({ error: error as Error });
        }
      },

      removeAIConfig: async (index) => {
        try {
          const config = get().aiConfigs[index];
          await credentials.removeSecret(config.secretKey);

          set((state) => {
            const newConfigs = state.aiConfigs.filter((_, i) => i !== index);
            return {
              aiConfigs: newConfigs,
              selectedConfig:
                state.selectedConfig === index
                  ? newConfigs.length > 0
                    ? 0
                    : undefined
                  : state.selectedConfig !== undefined &&
                    state.selectedConfig > index
                    ? state.selectedConfig - 1
                    : state.selectedConfig,
              error: null,
            };
          });
        } catch (error) {
          set({ error: error as Error });
        }
      },

      updateAIConfig: async (index, config) => {
        try {
          if (config.apiKey) {
            const currentConfig = get().aiConfigs[index];
            await credentials.setSecret({
              key: currentConfig.secretKey,
              value: config.apiKey,
            });
            delete config.apiKey;
          }

          set((state) => ({
            aiConfigs: state.aiConfigs.map((c, i) =>
              i === index ? { ...c, ...config } : c
            ),
            error: null,
          }));
        } catch (error) {
          set({ error: error as Error });
        }
      },

      getAPIKey: async (index) => {
        const config = get().aiConfigs[index];
        return credentials.getSecret(config.secretKey);
      },

      setSelectedConfig: (index) => {
        set((state) => ({
          selectedConfig:
            index >= 0 && index < state.aiConfigs.length ? index : undefined,
          error: null,
        }));
      },
    }),
    {
      name: 'ai-config-storage',
      storage,
    }
  )
);

// Helper to get available models based on provider
export const getProviderModels = (
  provider: (typeof Providers)[number]
): string[] => {
  switch (provider) {
    case 'openai':
      return [
        'gpt-4o',
        'gpt-4o-mini',
        'o1',
        'o1-mini',
        '03-mini',
        'o1-preview',
      ];
    case 'google':
      return [
        'gemini-2.0-flash',
        'gemini-2.0-pro-exp-02-05',
        'gemini-2.0-flash-lite-preview-02-05',
        'gemini-2.0-flash-thinking-exp-01-21',
      ];
    case 'anthropic':
      return [
        'claude-3-5-sonnet-latest',
        'claude-3-5-haiku-latest',
        'claude-3-opus-latest',
      ];
    default:
      return [];
  }
};
