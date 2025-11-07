import { type ComponentPropsWithoutRef, useRef } from 'react';

let imageCount = 0;

export function MDXImage(props: ComponentPropsWithoutRef<'img'>) {
  const isFirstImage = useRef(imageCount === 0);

  if (isFirstImage.current) {
    imageCount += 1;
  }

  return (
    <img
      {...props}
      alt={props.alt ?? ''}
      fetchPriority={isFirstImage.current ? 'high' : undefined}
      loading={isFirstImage.current ? 'eager' : 'lazy'}
    />
  );
}
