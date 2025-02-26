import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "../ui/multi-select"
import { Button } from "../ui/button"
import { CircleStop, SendIcon } from "lucide-react"
import { AIConfigCombobox } from "../ai/ai-config-combobox"
import { V1Container } from "@kubernetes/client-node"

interface PodChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  chatStatus: string;
  attachEvents: boolean;
  setAttachEvents: (value: boolean) => void;
  selectedContainers: string[];
  setSelectedContainers: (values: string[]) => void;
  containers: V1Container[];
  aiConfigs: any[];
  selectedConfig: number | undefined;
  setSelectedConfig: (index: number) => void;
  onAddNewAIConfig: () => void;
  onStop: () => void;
}

export function PodChatInput({
  input,
  onInputChange,
  chatStatus,
  attachEvents,
  setAttachEvents,
  selectedContainers,
  setSelectedContainers,
  containers,
  aiConfigs,
  selectedConfig,
  setSelectedConfig,
  onAddNewAIConfig,
  onStop,
}: PodChatInputProps) {
  return (
    <div className="max-w-[80%] flex flex-col gap-2 rounded-3xl border p-4 mx-auto bg-white dark:bg-black">
      <textarea
        name="prompt"
        value={input}
        dir="auto"
        onChange={onInputChange}
        disabled={chatStatus === "submitted"}
        placeholder="Ask anything about this pod..."
        className="w-full bg-transparent focus:outline-none text-primary resize-none"
        style={{ height: "44px" }}
        rows={4}
      />
      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="attach-events"
              checked={attachEvents}
              onCheckedChange={setAttachEvents}
            />
            <Label htmlFor="attach-events" className="text-xs text-muted-foreground">
              Include events
            </Label>
          </div>
          <MultiSelect
            options={containers.map(container => ({
              label: container.name,
              value: container.name
            })) ?? []}
            value={selectedContainers}
            onValueChange={setSelectedContainers}
            placeholder="include logs"
            title="Include container logs in the prompt"
            className="text-xs"
          />
        </div>
        <div className="flex flex-row gap-2">
          <AIConfigCombobox
            aiConfigs={aiConfigs}
            selectedConfig={selectedConfig}
            setSelectedConfig={setSelectedConfig}
            onAddNewAIConfig={onAddNewAIConfig}
          />
          {chatStatus !== "submitted" && chatStatus !== "streaming" && (
            <Button
              variant={input.trim() === '' ? "outline" : "default"}
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="transition-all duration-500 rounded-full hover:scale-110"
            >
              <SendIcon />
            </Button>
          )}
          {(chatStatus === "submitted" || chatStatus === "streaming") && (
            <Button
              variant="default"
              type="button"
              size="icon"
              className="transition-all rounded-full animate-pulse"
              onClick={onStop}
            >
              <CircleStop />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}