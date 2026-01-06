import type { ComponentPropsWithoutRef } from 'react';

type MDXLinkProps = ComponentPropsWithoutRef<'a'>;

function isExternalUrl(href: string | undefined): boolean {
  if (!href) {
    return false;
  }
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//')
  );
}

export function MDXLink({ href, children, ...props }: MDXLinkProps) {
  const isExternal = isExternalUrl(href);

  if (isExternal) {
    return (
      <a href={href} rel="noopener noreferrer" target="_blank" {...props}>
        {children}
        <span className="sr-only"> (öppnas i nytt fönster)</span>
      </a>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
