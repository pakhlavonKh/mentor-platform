import React, { useState, useMemo } from "react";
import type { User } from "@/lib/api";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

type Props = {
  mentors: User[];
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
};

export default function ReviewerPicker({ mentors, value, onChange, placeholder = "Search reviewers..." }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter((m) => {
      const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.toLowerCase();
      return name.includes(q) || (m.email || "").toLowerCase().includes(q);
    });
  }, [mentors, query]);

  const selected = mentors.find((m) => m.id === value);

  return (
    <div className="w-72">
      <div className="mb-1 text-xs text-muted-foreground">{selected ? `Selected: ${selected.firstName} ${selected.lastName}` : "No reviewer selected"}</div>
      <Command>
        <CommandInput
          placeholder={placeholder}
          onValueChange={(v: string) => setQuery(v)}
        />
        <CommandList>
          {filtered.length === 0 && <CommandEmpty>No reviewers found</CommandEmpty>}
          {filtered.map((m) => (
            <CommandItem
              key={m.id}
              onSelect={() => {
                onChange(m.id);
                setQuery("");
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">{m.firstName} {m.lastName}</span>
                <span className="text-xs text-muted-foreground">{m.email}</span>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
