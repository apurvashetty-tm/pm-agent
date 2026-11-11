import React from 'react';
import { SvgXml } from 'react-native-svg';
import { icons, tokens } from '../theme';
import type { IconName } from '../theme';

type Props = {
  name: IconName;
  /** tokens.iconSize.* (components/icon.json: 16 / default 20 / 24) */
  size?: number;
  color: string;
};

/** components/icon.json — stroke colour from `color`, size from tokens.iconSize. */
export function Icon({ name, size = tokens.iconSize.md, color }: Props) {
  return (
    <SvgXml
      xml={icons[name]}
      width={size}
      height={size}
      color={color}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
