import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  OUTRAS_MEDICINA_INSTITUTIONS,
  PRINCIPAIS_FACULDADES,
  isListedMedicineInstitution,
} from "@/lib/medicineInstitutions";

type FacultySelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  /** Override default label styles (e.g. account settings). */
  labelClassName?: string;
};

export function FacultySelect({
  label,
  value,
  onChange,
  placeholder,
  error,
  labelClassName,
}: FacultySelectProps) {
  const [open, setOpen] = useState(false);
  const [otherMode, setOtherMode] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number>();

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  useEffect(() => {
    const v = value.trim();
    if (!v) return;
    if (!isListedMedicineInstitution(v)) {
      setOtherMode(true);
    } else {
      setOtherMode(false);
    }
  }, [value]);

  const showOtherInput = otherMode;
  const triggerLabel = showOtherInput
    ? value.trim()
      ? value
      : "Outra — digite o nome abaixo"
    : value || placeholder;

  function selectInstitution(name: string) {
    setOtherMode(false);
    onChange(name);
    setOpen(false);
  }

  function selectOther() {
    setOtherMode(true);
    onChange("");
    setOpen(false);
  }

  return (
    <div>
      <label
        className={cn(
          "mb-1.5 block text-sm font-medium text-foreground",
          labelClassName,
        )}
      >
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-lg border bg-secondary/50 px-4 pr-3 text-left text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20",
              error ? "border-destructive" : "border-border",
              !value && !showOtherInput && "text-muted-foreground"
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-50 p-0"
          align="start"
          sideOffset={4}
          style={popoverWidth ? { width: popoverWidth } : undefined}
        >
          <Command>
            <CommandInput placeholder="Buscar faculdade…" />
            <CommandList>
              <CommandEmpty>Nenhuma instituição encontrada.</CommandEmpty>
              <CommandGroup heading="Principais">
                {PRINCIPAIS_FACULDADES.map((name) => (
                  <CommandItem key={name} value={name} onSelect={() => selectInstitution(name)}>
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", value === name ? "opacity-100" : "opacity-0")} />
                    <span className="break-words">{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Instituições com Medicina">
                {OUTRAS_MEDICINA_INSTITUTIONS.map((name) => (
                  <CommandItem key={name} value={name} onSelect={() => selectInstitution(name)}>
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", value === name ? "opacity-100" : "opacity-0")} />
                    <span className="break-words">{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  value="outra-instituicao-personalizada"
                  keywords={["outra", "faculdade", "instituição", "escrever"]}
                  onSelect={selectOther}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4 shrink-0", showOtherInput ? "opacity-100" : "opacity-0")}
                  />
                  Outra
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showOtherInput && (
        <Input
          className={cn(
            "mt-2 h-11 rounded-lg border bg-secondary/50 text-sm focus-visible:ring-gold/20",
            error && !value.trim() ? "border-destructive" : "border-border"
          )}
          placeholder="Digite o nome da sua instituição"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
