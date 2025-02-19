import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import React from 'react'
import { AIConfig } from "@/stores/use-ai-config-store"
import { Check, Trash2 } from "lucide-react"

interface AIConfigListProps {
  configs: AIConfig[]
  selectedConfig?: number
  onSelect: (index: number) => void
  onDelete: (index: number) => Promise<void>
  getAPIKey: (key: number) => Promise<string>
}

export function AIConfigList({
  configs,
  selectedConfig,
  onSelect,
  onDelete,
  getAPIKey
}: AIConfigListProps) {
  const [apiKeys, setApiKeys] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    configs.forEach(async (config, index) => {
      const key = await getAPIKey(index);
      //setApiKeys(prev => ({ ...prev, [config.secretKey]: key }));
    });
  }, [configs, getAPIKey]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {configs.map((config, index) => (
        <Card
          key={config.secretKey}
          className={selectedConfig === index ? "border-primary" : ""}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{config.provider}</span>
              {selectedConfig === index && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </CardTitle>
            <CardDescription>{config.model}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{config.url}</p>
            <p className="text-sm text-muted-foreground mt-2">
              API Key: {apiKeys[config.secretKey] ? '••••••••' : 'Loading...'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => onSelect(index)}
              disabled={selectedConfig === index}
            >
              {selectedConfig === index ? 'Selected' : 'Select'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => onDelete(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}