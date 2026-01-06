import type { ComponentPropsWithoutRef } from 'react';

type MDXImageProps = ComponentPropsWithoutRef<'img'> & {
  fetchpriority?: 'high' | 'low' | 'auto';
};

export function MDXImage(props: MDXImageProps) {
  const {
    width = 'auto',
    height = 'auto',
    fetchpriority,
    ...restProps
  } = props;

  // Dev warning for missing alt text
  if (import.meta.env.DEV && !props.alt) {
    console.warn('[MDXImage] Missing alt text for image:', props.src);
  }

  return (
    <img
      {...restProps}
      alt={props.alt ?? ''}
      decoding="async"
      fetchPriority={fetchpriority}
      height={height}
      loading="lazy"
      width={width}
    />
  );
}
