import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { AIConfig } from "@/stores/use-ai-config-store";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Button } from "../ui/button";
import { truncate } from "@/lib/strings";
interface AIConfigComboboxProps {
  aiConfigs: AIConfig[];
  selectedConfig: number | undefined;
  setSelectedConfig: (index: number) => void;
  onAddNewAIConfig: () => void;
}

export function AIConfigCombobox({
  aiConfigs,
  selectedConfig,
  setSelectedConfig,
  onAddNewAIConfig
}: AIConfigComboboxProps) {

  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between truncate text-xs"
          >
            {selectedConfig !== undefined ? truncate(`${aiConfigs[selectedConfig].provider}:${aiConfigs[selectedConfig].model}`, 20) : "Select AI Config..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search AI config..." />
            <CommandList>
              <CommandEmpty>No AI config found.</CommandEmpty>
              <CommandGroup>
                {aiConfigs.map((config, index) => (
                  <CommandItem
                    key={`${config.provider}-${config.model}-${index}`}
                    value={index.toString()}
                    onSelect={() => {
                      setSelectedConfig(index);
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedConfig === index ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {`${config.provider}:${config.model}`}
                  </CommandItem>
                ))}
                <CommandItem
                  className="text-xs"
                  onSelect={() => {
                    setOpen(false);
                    onAddNewAIConfig();
                  }}
                >
                  <Plus /> New AI Config
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )

}