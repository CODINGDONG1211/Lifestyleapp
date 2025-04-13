"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxProps {
  options: { value: string; label: string; category?: string }[]
  value?: string
  onSelect: (value: string) => void
  placeholder?: string
}

export function Combobox({
  options,
  value,
  onSelect,
  placeholder = "Select option..."
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Group options by category if available
  const groupedOptions = options.reduce((acc, option) => {
    if (option.category) {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
    } else {
      if (!acc['Other']) {
        acc['Other'] = [];
      }
      acc['Other'].push(option);
    }
    return acc;
  }, {} as Record<string, typeof options>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search exercises..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No exercise found.</CommandEmpty>
          {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
            <CommandGroup key={category} heading={category}>
              {categoryOptions
                .filter(option => 
                  option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  option.category?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onSelect(option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </Command>
      </PopoverContent>
    </Popover>
  )
} 