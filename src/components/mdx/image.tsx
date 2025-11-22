import type { ComponentPropsWithoutRef } from 'react';

export function MDXImage(props: ComponentPropsWithoutRef<'img'>) {
  const { width = 'auto', height = 'auto', ...restProps } = props;
  return (
    <img
      {...restProps}
      alt={props.alt ?? ''}
      height={height}
      loading="lazy"
      width={width}
    />
  );
}
