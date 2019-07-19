import { Colors, DiffColors } from '@flowmap.gl/core'
import {
  schemeGnBu,
  schemePuRd,
  schemeOrRd,
  schemePuBu,
  schemeBuGn,
  schemePuBuGn,
  schemeBuPu,
  schemeRdPu,
  schemeYlGnBu,
  schemeYlGn,
  schemeYlOrBr,
  schemeYlOrRd,
  schemeBlues,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemePurples,
  schemeReds,
} from 'd3-scale-chromatic';
import { range } from 'd3-array';
// @ts-ignore
import { scaleSequentialPow } from 'd3-scale';
import { interpolateHcl } from 'd3-interpolate';
import { Config, ConfigPropName } from './types';

const asScheme = (scheme: ReadonlyArray<ReadonlyArray<string>>) =>
  scheme[scheme.length - 1] as string[]

const flowColorSchemes: { [key: string]: string[] } = {
  GnBu: asScheme(schemeGnBu),
  PuRd: asScheme(schemePuRd),
  Blues: asScheme(schemeBlues),
  OrRd: asScheme(schemeOrRd),
  PuBu: asScheme(schemePuBu),
  Greens: asScheme(schemeGreens),
  Greys: asScheme(schemeGreys),
  Oranges: asScheme(schemeOranges),
  Purples: asScheme(schemePurples),
  Reds: asScheme(schemeReds),
  BuGn: asScheme(schemeBuGn),
  PuBuGn: asScheme(schemePuBuGn),
  BuPu: asScheme(schemeBuPu),
  RdPu: asScheme(schemeRdPu),
  YlGnBu: asScheme(schemeYlGnBu),
  YlGn: asScheme(schemeYlGn),
  YlOrBr: asScheme(schemeYlOrBr),
  YlOrRd: asScheme(schemeYlOrRd),
}

export enum ColorScheme {
  primary = '#137CBD',
}

const FLOW_MIN_COLOR = 'rgba(240,240,240,0.5)'

const colors: Colors = {
  flows: {
    scheme: [FLOW_MIN_COLOR, ColorScheme.primary],
  },
  locationCircles: {
    // outgoing: hcl(ColorScheme.primary).brighter(2).toString(),
    outgoing: '#fff',
  },
  outlineColor: 'rgba(255, 255, 255, 0.5)',
  // outlineColor: 'rgba(0, 0, 0, 0.5)',    // dark mode
};

const animatedColors: Colors = {
  ...colors,
  flows: {
    scheme:
      range(0,1.1, 0.1)
      .map(
        scaleSequentialPow(
          interpolateHcl('rgb(255,255,255)', ColorScheme.primary)
      )
      .exponent(2)
    )
  },
};

const complementary = '#f52020'
const baseDiffColor = '#17a5be'

const diffColors: DiffColors = {
  negative: {
    flows: {
      scheme: [FLOW_MIN_COLOR, baseDiffColor],
    },
  },
  positive: {
    flows: {
      scheme: [FLOW_MIN_COLOR, complementary],
    },
  },
  locationAreas: {
    outline: 'rgba(92,112,128,0.5)',
    normal: 'rgba(220,220,220,0.5)',
  },
  outlineColor: 'rgb(230,233,237)',
};


export default function getColors(
  config: Config, diffMode: boolean, animate: boolean
): Colors | DiffColors {
  if (diffMode) {
    return diffColors
  }
  const schemeKey = config[ConfigPropName.COLORS_SCHEME]
  const scheme = schemeKey && flowColorSchemes[schemeKey]
  if (scheme) {
    return {
      ...colors,
      flows: {
        scheme,
      }
    }
  }
  if (animate) {
    return animatedColors
  }
  return colors
}
