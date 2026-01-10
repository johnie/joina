import type * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * A reusable metadata card that mimics a two column facts box.
 * Pass any set of label and value pairs with optional title.
 */
export interface MetaItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface JobMetaCardProps {
  /** Pairs shown in order, left column are labels, right column are values */
  items: MetaItem[];
  /** Extra classes to style the wrapper */
  className?: string;
}

export function JobMetaCard({ items, className }: JobMetaCardProps) {
  return (
    <Card className={cn('bg-muted', className)}>
      <CardContent>
        <dl className="mt-0 mb-0 flex flex-wrap items-center justify-center">
          {items.map((item, i) => (
            <div
              className="flex w-full items-center justify-between"
              key={`${String(item.label)}-${i}`}
            >
              <dt className="mt-0 p-0 font-semibold text-sm">{item.label}</dt>
              <dd className="mt-0 p-0 text-sm leading-relaxed">{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
