import { Badge } from '@/components/ui/badge';

export const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    running: 'bg-green-400 dark:bg-green-700 dark:text-green-100',
    ready: 'bg-green-400 dark:bg-green-700 dark:text-green-100',
    pending:
      'bg-yellow-200 text-black-100 dark:bg-yellow-700 dark:text-yellow-100',
    terminated: 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100',
    waiting:
      'bg-yellow-200 text-black-100 dark:bg-yellow-700 dark:text-yellow-100',
    failed: 'bg-red-200 dark:bg-red-700 dark:text-red-100',
    notready: 'bg-red-200 dark:bg-red-700 dark:text-red-100',
    succeeded: 'bg-green-400 dark:bg-green-700 dark:text-green-100',
    enabled: 'bg-blue-500 dark:bg-blue-700 dark:text-blue-100',
    disabled: 'bg-red-200 dark:bg-red-700 dark:text-red-100',
    unknown: 'bg-gray-200 text-black-100 dark:bg-gray-700 dark:text-gray-100',
    available: 'bg-green-400 dark:bg-green-700 dark:text-green-100',
    active: 'bg-green-400 dark:bg-green-700 dark:text-green-100',
    progressing:
      'bg-yellow-200 text-black-100 dark:bg-yellow-700 dark:text-yellow-100',
  };

  return (
    <Badge className={`${colors[status.toLowerCase()] || colors.unknown}`}>
      {status}
    </Badge>
  );
};
