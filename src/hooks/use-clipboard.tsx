import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useToast } from '@/hooks/use-toast';

export const useClipboard = () => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await writeText(text);
      toast({
        variant: 'default',
        title: 'Copied to clipboard',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error copying to clipboard',
        description: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  };

  return { copyToClipboard };
};
