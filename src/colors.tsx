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
import { scaleSequential, scalePow } from 'd3-scale';
import { interpolateRgbBasis } from 'd3-interpolate';
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

const DEFAULT_COLOR_SCHEME = [FLOW_MIN_COLOR, ColorScheme.primary];

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
  config: Config,
  diffMode: boolean,
  darkMode: boolean,
  animate: boolean,
): Colors | DiffColors {
  if (diffMode) {
    return diffColors
  }

  const schemeKey = config[ConfigPropName.COLORS_SCHEME]
  let scheme = (schemeKey && flowColorSchemes[schemeKey]) || DEFAULT_COLOR_SCHEME

  if (darkMode) {
    scheme = scheme.slice().reverse()
  }
  // if (animate)
  {
    // lighten or darken to prevent the "worms" effect
    const indices = range(0, Math.max(10, scheme.length))
    const N = indices.length - 1;
    const colorScale = scaleSequential(interpolateRgbBasis(scheme))
      .domain([0, N])

    const amount = scalePow()
      .exponent(animate ? 1 : 1/2.5)
      .domain([0, N])
      .range([1, 0])

    scheme = indices.map((c, i) =>
      interpolateRgbBasis([colorScale(i), darkMode ? '#000' : '#fff'])(amount(i))
    )
  }

  return {
    flows: {
      scheme,
    },
    locationCircles: {
      outgoing: '#fff',
    },
    outlineColor: darkMode ? '#000' : 'rgba(255, 255, 255, 0.5)',
  }
}
