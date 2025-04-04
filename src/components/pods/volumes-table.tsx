import { V1Volume } from '@kubernetes/client-node';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollAreaCode } from '@/components/scroll-area-code';

interface VolumesTableProps {
  volumes: V1Volume[];
  onCopy: (text: string) => void;
}

export const VolumesTable = ({ volumes, onCopy }: VolumesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {volumes.map((volume) => {
          // Get volume type (first key that's not 'name')
          const volumeType = Object.keys(volume).find((key) => key !== 'name');
          const details = volumeType
            ? volume[volumeType as keyof V1Volume]
            : {};

          return (
            <TableRow key={volume.name}>
              <TableCell className="font-medium">{volume.name}</TableCell>
              <TableCell>{volumeType}</TableCell>
              <TableCell className="max-w-xl">
                <ScrollAreaCode
                  height="h-48"
                  content={details}
                  onCopy={onCopy}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
