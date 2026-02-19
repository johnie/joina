import {
  Calendar03Icon,
  Clock01Icon,
  Location01Icon,
  WorkIcon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

const iconMap: Record<string, IconSvgElement> = {
  work: WorkIcon,
  calendar: Calendar03Icon,
  clock: Clock01Icon,
  location: Location01Icon,
};

export function getIcon(key: string): IconSvgElement {
  return iconMap[key] ?? WorkIcon;
}
