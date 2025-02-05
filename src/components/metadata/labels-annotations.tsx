import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LabelsAnnotationsProps {
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
}

export const LabelsAnnotations = ({ labels, annotations }: LabelsAnnotationsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Labels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(labels || {}).map(([key, value]) => (
              <Badge key={key} variant="secondary">
                {key}: {value}
              </Badge>
            ))}
            {!labels || Object.keys(labels).length === 0 && (
              <span className="text-muted-foreground">No labels found</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(annotations || {}).map(([key, value]) => (
              <Badge key={key} variant="outline">
                {key}: {value + value + value}
              </Badge>
            ))}
            {!annotations || Object.keys(annotations).length === 0 && (
              <span className="text-muted-foreground">No annotations found</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};