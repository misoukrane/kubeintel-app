import { useCordonNode } from './use-cordon-node';
import { useUncordonNode } from './use-uncordon-node';
import { useDrainNode } from './use-drain-node';
import { useDebugNode } from './use-debug-node';

interface UseNodeActionsProps {
  kubeconfigPath?: string;
  context?: string;
  nodeName?: string;
}

export const useNodeActions = ({
  kubeconfigPath,
  context,
  nodeName,
}: UseNodeActionsProps) => {
  const { mutate: cordonNode } = useCordonNode({
    kubeconfigPath,
    context,
    nodeName,
  });

  const { mutate: uncordonNode } = useUncordonNode({
    kubeconfigPath,
    context,
    nodeName,
  });

  const { mutate: drainNode } = useDrainNode({
    kubeconfigPath,
    context,
    nodeName,
  });

  const { mutate: debugNode } = useDebugNode({
    kubeconfigPath,
    context,
    nodeName,
  });

  return {
    actions: {
      cordonNode,
      uncordonNode,
      drainNode,
      debugNode,
    }
  };
};