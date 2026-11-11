import React from 'react';
import { SvgXml } from 'react-native-svg';
import { icons, IconName } from '../kit';

/** components/icon.json — Tabler outline SVG, stroke = `color`. */
export function Icon({ name, size, color }: { name: IconName; size: number; color: string }) {
  return <SvgXml xml={icons[name]} width={size} height={size} color={color} />;
}
