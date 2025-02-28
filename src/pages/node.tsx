import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { NodeView } from '@/components/nodes/node-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Node } from '@kubernetes/client-node';
import { useNavigate, useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { useNodeActions } from '@/hooks/nodes/use-node-actions';
import { ROUTES } from '@/lib/routes';
import { ResourceTypes } from '@/lib/strings';

export const Node = () => {
  const { nodeName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext } = useConfigStore();

  const {
    resource: node,
    isLoading,
    error,
    deleteResource,
    openEvents,
  } = useKubeResource<V1Node>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: '', // Nodes are cluster-scoped
    resourceType: ResourceTypes.Node,
    name: nodeName,
    onDeleteSuccess: () => navigate(ROUTES.NODES),
  });

  const { actions } = useNodeActions({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    nodeName,
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <NodeView
          node={node}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
          onCordon={actions.cordonNode}
          onUncordon={actions.uncordonNode}
          onDrain={actions.drainNode}
          onDebug={actions.debugNode}
        />
      )}
    </div>
  );
};
