import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    // Append T00:00:00 if standard YYYY-MM-DD to avoid timezone shifting
    const dateStr = value.includes("T") ? value : `${value}T00:00:00`;
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      onChange?.(format(date, "yyyy-MM-dd"));
    } else {
      onChange?.("");
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(format(new Date(), "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between px-3 font-normal text-sm border-input bg-background hover:bg-muted/40 transition-colors shadow-sm",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">
              {selectedDate ? format(selectedDate, "PPP") : placeholder}
            </span>
          </span>
          {selectedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClear(e as any);
              }}
              className="ml-1 rounded-sm p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border shadow-lg rounded-xl z-50" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          className="p-3"
        />
        <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 bg-muted/20">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="h-7 text-xs font-medium text-primary hover:text-primary/90"
          >
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
