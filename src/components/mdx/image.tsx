import type { ComponentPropsWithoutRef } from 'react';

export function MDXImage(props: ComponentPropsWithoutRef<'img'>) {
  return <img {...props} alt={props.alt ?? ''} loading="lazy" />;
}
