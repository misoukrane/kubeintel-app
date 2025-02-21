import { useAIConfigStore } from '@/stores/use-ai-config-store';
import { AIConfigManager } from '@/components/ai/ai-config-manager';
import { useSearchParams } from 'react-router';

export function AIConfigPage() {
  const {
    aiConfigs,
    selectedConfig,
    addAIConfig,
    removeAIConfig,
    setSelectedConfig,
    getAPIKey,
  } = useAIConfigStore();

  const [searchParams] = useSearchParams();
  return (
    <div className="container mx-auto py-10">
      <AIConfigManager
        aiConfigs={aiConfigs}
        selectedConfig={selectedConfig}
        addAIConfig={addAIConfig}
        removeAIConfig={removeAIConfig}
        setSelectedConfig={setSelectedConfig}
        getAPIKey={getAPIKey}
        addingView={searchParams.get('addnew') === 'true'}
      />
    </div>
  );
}
