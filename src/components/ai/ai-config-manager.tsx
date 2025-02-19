import { useState } from 'react';
import { AIConfig } from '@/stores/use-ai-config-store';
import { AIConfigForm } from "./ai-config-form";
import { AIConfigList } from "./ai-config-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface AIConfigManagerProps {
  aiConfigs: AIConfig[];
  selectedConfig?: number;
  addAIConfig: (config: AIConfig & { apiKey: string }) => Promise<void>;
  removeAIConfig: (index: number) => Promise<void>;
  setSelectedConfig: (index: number) => void;
  getAPIKey: (index: number) => Promise<string>;
}

export function AIConfigManager({
  aiConfigs,
  selectedConfig,
  addAIConfig,
  removeAIConfig,
  setSelectedConfig,
  getAPIKey,
}: AIConfigManagerProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: { provider: "openai" | "google" | "anthropic"; url: string; model: string; apiKey: string }) => {
    try {
      await addAIConfig({ ...values, secretKey: values.apiKey });
      setOpen(false); // Close dialog on success
    } catch (error) {
      console.error('Failed to add AI config:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">AI Configurations</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add AI Configuration</DialogTitle>
              <DialogDescription>
                Add a new AI provider configuration. The API key will be stored securely.
              </DialogDescription>
            </DialogHeader>
            <AIConfigForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {aiConfigs.length > 0 ? (
        <AIConfigList
          configs={aiConfigs}
          selectedConfig={selectedConfig}
          onSelect={(index: number) => setSelectedConfig?.(index) ?? void 0}
          onDelete={removeAIConfig}
          getAPIKey={getAPIKey}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No configurations added yet.</p>
        </div>
      )}
    </div>
  )
}