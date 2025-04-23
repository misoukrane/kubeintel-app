import { ResourceTypes } from '@/lib/strings';
import { CoreV1Event } from '@kubernetes/client-node';

export interface Kubeconfig {
  contexts: { name: string; context: { namespace?: string } }[]; // Ensure namespace is optional
  'current-context'?: string;
}

export interface ExecEnvVar {
  name: string;
  value: string;
}

export type ExecInteractiveMode = 'Never' | 'IfAvailable' | 'Always';

export interface ExecConfig {
  /** Preferred input version of the ExecInfo. */
  apiVersion?: string;
  /** Command to execute. */
  command?: string;
  /** Arguments to pass to the command when executing it. */
  args?: string[];
  /** Additional environment variables to expose to the process. */
  env?: ExecEnvVar[];
  /** Interative mode of the auth plugins. */
  interactiveMode?: ExecInteractiveMode;
  /** Provide cluster info to the exec plugin. */
  provideClusterInfo?: boolean;
}

export interface AuthInfo {
  /** The username for basic authentication to the kubernetes cluster. */
  username?: string;
  /** The password for basic authentication to the kubernetes cluster. */
  password?: string;
  /** The bearer token for authentication to the kubernetes cluster. */
  token?: string;
  /** Pointer to a file that contains a bearer token. If both `token` and `tokenFile` are present, `token` takes precedence. */
  tokenFile?: string;
  /** Path to a client cert file for TLS. */
  'client-certificate'?: string;
  /** PEM-encoded data from a client cert file for TLS. Overrides `client-certificate`. Should be base64 encoded. */
  'client-certificate-data'?: string;
  /** Path to a client key file for TLS. */
  'client-key'?: string;
  /** PEM-encoded data from a client key file for TLS. Overrides `client-key`. Should be base64 encoded. */
  'client-key-data'?: string;
  /** The username to act-as. */
  as?: string;
  /** The groups to impersonate. */
  'as-groups'?: string[];
  /** Specifies a custom exec-based authentication plugin for the kubernetes cluster. */
  exec?: ExecConfig;
}

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

export const ATTACHEMENT_NAMES = {
  POD: 'pod.json',
  POD_EVENTS: 'pod-events.json',
  POD_LOGS: 'logs.json',
} as const;
