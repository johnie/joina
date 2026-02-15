type Child = SatoriElement | string | number | boolean | null | undefined;

interface SatoriElement {
  type: string | typeof Fragment;
  props: Record<string, unknown> & { children?: Child | Child[] };
}

export function jsx(
  type: string | typeof Fragment,
  props: Record<string, unknown>
): SatoriElement {
  return { type, props };
}

export { jsx as jsxs };

export function Fragment(props: { children?: Child | Child[] }) {
  return props.children;
}

declare global {
  // biome-ignore lint/style/noNamespace: JSX global namespace is the standard way to type custom JSX runtimes
  namespace JSX {
    type Element = SatoriElement;
    interface IntrinsicElements {
      [tag: string]: Record<string, unknown>;
    }
  }
}
