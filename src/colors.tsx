import { Colors, DiffColors } from '@flowmap.gl/core'
import { hcl } from 'd3-color'

export enum ColorScheme {
  primary = '#137CBD',
}

export const colors: Colors = {
  flows: {
    max: ColorScheme.primary,
  },
  locationCircles: {
    outgoing: hcl(ColorScheme.primary).brighter(2).toString(),
  },
};

export const animatedColors: Colors = {
  ...colors,
  flows: {
    ...colors.flows,
    min: '#fff',
  },
};

const complementary = '#f52020'
const baseDiffColor = '#17a5be'

export const diffColors: DiffColors = {
  negative: {
    flows: {
      max: baseDiffColor,
    },
  },
  positive: {
    flows: {
      max: complementary,
    },
  },
  locationAreas: {
    outline: 'rgba(92,112,128,0.5)',
    normal: 'rgba(220,220,220,0.5)',
  },
  outlineColor: 'rgb(230,233,237)',
};
