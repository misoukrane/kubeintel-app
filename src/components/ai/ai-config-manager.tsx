import { useState } from 'react';
import { AIConfig } from '@/stores/use-ai-config-store';
import { AIConfigForm } from './ai-config-form';
import { AIConfigList } from './ai-config-list';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

interface AIConfigManagerProps {
  aiConfigs: AIConfig[];
  selectedConfig?: number;
  addAIConfig: (config: AIConfig & { apiKey: string }) => Promise<void>;
  removeAIConfig: (index: number) => Promise<void>;
  setSelectedConfig: (index: number) => void;
  getAPIKey: (index: number) => Promise<string>;
  addingView: boolean;
}

export function AIConfigManager({
  aiConfigs,
  selectedConfig,
  addAIConfig,
  removeAIConfig,
  setSelectedConfig,
  getAPIKey,
  addingView,
}: AIConfigManagerProps) {
  const [isAdding, setIsAdding] = useState(addingView);

  const handleSubmit = async (values: {
    provider: 'openai' | 'google' | 'anthropic';
    url: string;
    model: string;
    apiKey: string;
  }) => {
    try {
      await addAIConfig({ ...values, secretKey: values.apiKey });
      setIsAdding(false); // Return to list view on success
    } catch (error) {
      console.error('Failed to add AI config:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">AI Configurations</h2>
        {!isAdding && (
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-700"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Configuration
          </Button>
        )}
      </div>

      {isAdding ? (
        <div className="space-y-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </div>
          <h3 className="text-lg font-medium text-center">
            Add New Configuration
          </h3>
          <div className="border rounded-lg p-6 max-w-2xl mx-auto">
            <AIConfigForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsAdding(false);
              }}
            />
          </div>
        </div>
      ) : aiConfigs.length > 0 ? (
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
  );
}
