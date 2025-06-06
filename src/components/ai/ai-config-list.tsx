import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AIConfig } from '@/stores/use-ai-config-store';
import { Check, Trash2, Link, Key } from 'lucide-react';

interface AIConfigListProps {
  configs: AIConfig[];
  selectedConfig?: number;
  onSelect: (index: number) => void;
  onDelete: (index: number) => Promise<void>;
  getAPIKey: (key: number) => Promise<string>;
}

export function AIConfigList({
  configs,
  selectedConfig,
  onSelect,
  onDelete,
}: AIConfigListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-1">
      {configs.map((config, index) => {
        const isSelected = selectedConfig === index;

        return (
          <Card
            key={config.secretKey}
            className={`group relative transition-all duration-200 ring-1 ring-blue-700 shadow-md shadow-blue-700
               ${isSelected ? 'ring-4 ring-blue-700' : 'hover:ring-4'}`}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 rounded-full bg-primary p-1">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {config.provider}
              </CardTitle>
              <CardDescription className="text-base font-medium">
                {config.model}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {config.url.trim() && (
                  <>
                    <Link className="h-4 w-4" />
                    <span className="truncate">{config.url}</span>
                  </>
                )}
                <Key className="h-4 w-4" /> <span>API Key: ••••••••</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground"></div>

              <div className="flex justify-end gap-2">
                <Button
                  variant={isSelected ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() => onSelect(index)}
                  disabled={isSelected}
                  className="w-24"
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="hover:bg-destructive/10"
                  onClick={() => onDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
