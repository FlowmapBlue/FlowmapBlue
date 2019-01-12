import { Colors } from 'flowmap.gl';

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
