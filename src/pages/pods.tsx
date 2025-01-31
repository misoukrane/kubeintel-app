import { Button } from '@/components/ui/button';
import { useConfigStore } from '@/stores/use-config-store';
import { useNavigate } from 'react-router';
import { Spinner } from '@/components/spinner';
import { PodsTable } from '@/components/pods-table';
import { ErrorAlert } from '@/components/error-alert';
import { useListPods } from '@/hooks/use-list-pods';


export const Pods = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } = useConfigStore();
  const navigate = useNavigate();

  const { pods, loading, error } = useListPods({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to config
        </Button>
      </div>
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && <PodsTable pods={pods} />}
    </div>
  );
};