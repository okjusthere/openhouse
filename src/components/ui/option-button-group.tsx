"use client";

import { cn } from "@/lib/utils";

interface OptionButton {
    value: string;
    label: string;
}

interface OptionButtonGroupProps {
    value: string;
    onChange: (nextValue: string) => void;
    options: OptionButton[];
    className?: string;
    buttonClassName?: string;
    accentColor?: string;
}

export function OptionButtonGroup({
    value,
    onChange,
    options,
    className,
    buttonClassName,
    accentColor,
}: OptionButtonGroupProps) {
    return (
        <div role="radiogroup" className={cn("flex flex-wrap gap-2", className)}>
            {options.map((option) => {
                const selected = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
                            selected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs"
                                : "border-border/70 bg-white text-foreground/85 hover:bg-muted",
                            buttonClassName
                        )}
                        style={
                            selected && accentColor
                                ? {
                                      borderColor: accentColor,
                                      backgroundColor: `${accentColor}1A`,
                                      color: accentColor,
                                  }
                                : undefined
                        }
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
