import { useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { EventsTable } from '@/components/events/events-table';
import { ErrorAlert } from '@/components/error-alert';
import { CoreV1Event } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const EventsPage = () => {
  const [searchParams] = useSearchParams();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const namespaceForQuery =
    currentNamespace && currentNamespace !== '' ? currentNamespace : 'all';

  const {
    data: events,
    isLoading,
    error,
  } = useListKubeResource<CoreV1Event>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: namespaceForQuery,
    resourceType: ResourceTypes.Event,
  });

  const initialFilters = {
    name: searchParams.get('name') || '',
    type: searchParams.get('type') || '',
    reason: searchParams.get('reason') || '',
    message: searchParams.get('message') || '',
  };

  const showNamespaceColumn = namespaceForQuery === 'all';

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <EventsTable
          events={events ?? []}
          initialFilters={initialFilters}
          columnVisibility={{ namespace: showNamespaceColumn }}
        />
      )}
    </div>
  );
};
