import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { cn } from '@/lib/utils';

export interface HighlightItem {
  icon: IconSvgElement;
  label: string;
  value: string;
}

export interface JobHighlightsProps {
  items: HighlightItem[];
  className?: string;
}

export function JobHighlights({ items, className }: JobHighlightsProps) {
  return (
    <div
      className={cn(
        'not-prose my-6 grid grid-cols-2 gap-4 md:flex md:flex-row md:items-center md:justify-center md:gap-8',
        className
      )}
    >
      {items.map((item) => (
        <div
          className="flex items-center justify-center gap-2"
          key={item.label}
        >
          <HugeiconsIcon
            aria-hidden="true"
            className="text-amber-600"
            icon={item.icon}
            size={16}
          />
          <span className="font-semibold text-sm">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
