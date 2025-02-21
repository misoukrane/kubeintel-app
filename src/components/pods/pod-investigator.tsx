import { V1Pod } from "@kubernetes/client-node";
import { Link } from "react-router";
import { ScrollArea } from "../ui/scroll-area";
import { useKubeChatbot } from "@/hooks/use-kube-chatbot";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown, CircleStop, Plus, SendIcon } from "lucide-react";
import { AIConfig, useAIConfigStore } from "@/stores/use-ai-config-store";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PodInvestigatorProps {
  pod: V1Pod;
  onAddNewAIConfig: () => void;
}


export function PodInvestigator({ pod, onAddNewAIConfig }: PodInvestigatorProps) {
  const { status, metadata, spec } = pod;
  const { messages, input, handleSubmit, handleInputChange, status: chatStatus, stop, error } = useKubeChatbot();
  const { aiConfigs, setSelectedConfig, selectedConfig } = useAIConfigStore();

  return (
    <div className="bg-neutral-50 dark:bg-muted p-4 rounded-md">
      <div className="flex flex-row items-center justify-between w-full">
        <div>
          <h3 className="bold">Pod Name</h3>
          <p className="text-xs">{metadata?.name || 'N/A'}</p>
        </div>
        <div>
          <h3 className="bold">Pod IP</h3>
          <p className="text-xs">{status?.podIP || 'N/A'}</p>
        </div>
        <div>
          <h3 className="bold">Node</h3>
          <p className="text-xs">
            {spec?.nodeName ? (
              <Link
                className='text-blue-600 hover:underline dark:text-blue-500'
                to={`/nodes/${spec.nodeName}`}>{spec.nodeName} </Link>
            ) : (
              'N/A'
            )}
          </p>
        </div>
        <div>
          <h3 className="bold">Pod IP</h3>
          <p className="text-xs">{status?.podIP || 'N/A'}</p>
        </div>
      </div>
      <ScrollArea className="h-[600px] w-full mt-4 border rounded-md bg-white dark:bg-black">
        <div className="flex flex-col gap-4 p-4 w-full ">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start max-w-[90%]"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2",
                  message.role === "assistant"
                    ? "bg-muted dark:bg-gray-900 text-primary prose dark:prose-invert prose-sm max-w-none"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre: ({ node, ...props }) => (
                        <div className="overflow-auto rounded-lg bg-black/10 dark:bg-white/10 p-2 my-2">
                          <pre {...props} />
                        </div>
                      ),
                      code: ({ node, inline, className, children, ...props }: {
                        node?: any;
                        inline?: boolean;
                        className?: string;
                        children?: React.ReactNode;
                      }) => (
                        inline
                          ? <code className="bg-black/10 dark:bg-white/10 rounded px-1" {...props}>
                            {children}
                          </code>
                          : <code className={className} {...props}>
                            {children}
                          </code>
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="mt-2 p-4">
        <div className="max-w-[80%] flex flex-col gap-2 rounded-3xl border p-4 mx-auto bg-white dark:bg-black" >
          <textarea
            name="prompt"
            value={input}
            dir="auto"
            onChange={handleInputChange}
            disabled={chatStatus === "submitted"}
            placeholder="Ask questions about this pod..."
            className="w-full bg-transparent focus:outline-none text-primary resize-none"
            style={{ height: "44px" }}
            rows={4}
          />
          <div className="flex flex-row justify-end gap-2">
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
                className="transition-all duration-500 rounded-full"
              >
                <SendIcon />
              </Button>
            )}
            {(chatStatus === "submitted" || chatStatus === "streaming") && (
              <Button variant="default" type="button" size="icon" onClick={stop}>
                <CircleStop />
              </Button>)}
          </div>
        </div>
      </form>
      {error && <p className="text-red-500">{JSON.stringify(error)}</p>}
    </div>
  );
}

interface AIConfigComboboxProps {
  aiConfigs: AIConfig[];
  selectedConfig: number | undefined;
  setSelectedConfig: (index: number) => void;
  onAddNewAIConfig: () => void;
}

function AIConfigCombobox({
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
            className="w-[200px] justify-between truncate"
          >
            {selectedConfig !== undefined ? `${aiConfigs[selectedConfig].provider}:${aiConfigs[selectedConfig].model}` : "Select AI Config..."}
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