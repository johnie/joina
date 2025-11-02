import type * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * A reusable metadata card that mimics a two column facts box.
 * Pass any set of label and value pairs with optional title.
 */
export type MetaItem = {
  label: React.ReactNode;
  value: React.ReactNode;
};

export type JobMetaCardProps = {
  /** Pairs shown in order, left column are labels, right column are values */
  items: MetaItem[];
  /** Extra classes to style the wrapper */
  className?: string;
};

export function JobMetaCard({ items, className }: JobMetaCardProps) {
  return (
    <Card className={cn('bg-muted', className)}>
      <CardContent>
        <dl className="flex flex-wrap justify-center items-center mb-0 mt-0">
          {items.map((item, i) => (
            <div
              className="flex w-full justify-between items-center"
              key={`${String(item.label)}-${i}`}
            >
              <dt className="text-sm font-semibold p-0 mt-0">{item.label}</dt>
              <dd className="text-sm leading-relaxed p-0 mt-0">{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
