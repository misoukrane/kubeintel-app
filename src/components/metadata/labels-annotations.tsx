import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface LabelsAnnotationsProps {
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
  onCopy: (text: string) => void;
}

const truncate = (str: string, length: number = 56) =>
  str.length > length ? `${str.substring(0, length)}...` : str;

const KeyValueBadge = ({
  keyName,
  value,
  variant = "secondary",
  onCopy
}: {
  keyName: string;
  value: string;
  variant?: "secondary" | "outline";
  onCopy: (text: string) => void;
}) => (
  <div className="group relative flex items-center gap-1">
    <Badge variant={variant}>
      {truncate(`${keyName}: ${value}`)}
    </Badge>
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => onCopy(`${keyName}: ${value}`)}
    >
      <Copy className="h-3 w-3" />
    </Button>
  </div>
);

export const LabelsAnnotations = ({
  labels,
  annotations,
  onCopy
}: LabelsAnnotationsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Labels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(labels || {}).map(([key, value]) => (
              <KeyValueBadge
                key={key}
                keyName={key}
                value={value}
                variant="secondary"
                onCopy={onCopy}
              />
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
              <KeyValueBadge
                key={key}
                keyName={key}
                value={value}
                variant="outline"
                onCopy={onCopy}
              />
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