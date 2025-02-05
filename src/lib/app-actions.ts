import { exit, relaunch } from '@tauri-apps/plugin-process';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useToast } from '@/hooks/use-toast';

export const quitApp = async () => await exit(0);
export const relaunchApp = async () => await relaunch();

export const copyToClipboard = async (text: string) => {
  // use toast to notify the user
  const { toast } = useToast();
  try {
    await writeText(text);
    toast({
      variant: 'default',
      title: 'Copied to clipboard',
      description: text,
    });
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error copying to clipboard',
      description:
        error instanceof Error ? error.message : JSON.stringify(error),
    });
  }
};
