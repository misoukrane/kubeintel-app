import { useAIConfigStore } from '@/stores/use-ai-config-store';
import { AIConfigManager } from '@/components/ai/ai-config-manager';

export function AIConfigPage() {
  const {
    aiConfigs,
    selectedConfig,
    addAIConfig,
    removeAIConfig,
    setSelectedConfig,
    getAPIKey,
  } = useAIConfigStore();
  return (
    <div className="container mx-auto py-10">
      <AIConfigManager
        aiConfigs={aiConfigs}
        selectedConfig={selectedConfig}
        addAIConfig={addAIConfig}
        removeAIConfig={removeAIConfig}
        setSelectedConfig={setSelectedConfig}
        getAPIKey={getAPIKey}
      />
    </div>
  );
}
