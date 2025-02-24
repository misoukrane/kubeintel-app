import { ResourceTypes } from '@/lib/strings';
import { CoreV1Event } from '@kubernetes/client-node';

// Create a type from ResourceTypes values
export type ResourceType = (typeof ResourceTypes)[keyof typeof ResourceTypes];

export interface BaseKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: ResourceType;
  name?: string;
}

export interface ListKubeResourceProps
  extends Omit<BaseKubeResourceProps, 'name'> {
  // List doesn't need the 'name' property
}

export interface DeleteKubeResourceProps extends BaseKubeResourceProps {
  onSuccess?: () => void;
}

export interface ScaleKubeResourceProps extends BaseKubeResourceProps {}

export interface ListEventsResult {
  data?: CoreV1Event[];
  error?: string;
}

export interface PodChatbotAttachment {
  name: string;
}
