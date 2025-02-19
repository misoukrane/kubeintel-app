import { invoke } from '@tauri-apps/api/core';

export const credentials = {
  setSecret: async ({
    key,
    value,
  }: {
    key: string;
    value: string;
  }): Promise<void> => {
    await invoke('set_secret', { key, value });
  },

  getSecret: async (key: string): Promise<string> => {
    return invoke<string>('get_secret', { key });
  },

  removeSecret: async (key: string): Promise<void> => {
    await invoke('remove_secret', { key });
  },
};
