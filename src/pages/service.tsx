import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ServiceView } from '@/components/services/service-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Service } from '@kubernetes/client-node';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';
import { useState, useRef } from 'react';

export const Service = () => {
  const { serviceName } = useParams();
  const [searchParams] = useSearchParams();
  const serviceNamespace = searchParams.get('namespace');

  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  // Store the namespace from when the component first mounted
  // But prioritize the namespace from URL if it exists
  const initialNamespaceRef = useRef(
    serviceNamespace ||
      (currentNamespace && currentNamespace !== 'all' ? currentNamespace : '')
  );

  // Local namespace state used for API calls
  const [resourceNamespace] = useState<string>(initialNamespaceRef.current);

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1Service>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: resourceNamespace,
      resourceType: ResourceTypes.Service,
      name: serviceName,
      onDeleteSuccess: () => navigate(ROUTES.SERVICES),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <ServiceView
          service={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
