import { Colors, DiffColors } from 'flowmap.gl';

export enum ColorScheme {
  primary = '#137CBD',
}

export const colors: Colors = {
  flows: {
    max: ColorScheme.primary,
  },
  locationAreas: {
    outline: 'rgba(92,112,128,0.5)',
    normal: 'rgba(187,187,187,0.5)',
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
  borderColor: 'rgb(230,233,237)',
};
