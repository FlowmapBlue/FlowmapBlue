import { Colors, DiffColors } from '@flowmap.gl/core';
import {
  interpolateCool,
  interpolateInferno,
  interpolateMagma,
  interpolatePlasma,
  interpolateViridis,
  interpolateWarm,
  schemeBlues,
  schemeBuGn,
  schemeBuPu,
  schemeGnBu,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemeOrRd,
  schemePuBu,
  schemePuBuGn,
  schemePuRd,
  schemePurples,
  schemeRdPu,
  schemeReds,
  schemeYlGn,
  schemeYlGnBu,
  schemeYlOrBr,
  schemeYlOrRd,
} from 'd3-scale-chromatic';
import { range } from 'd3-array';
import { scalePow, scaleSequential } from 'd3-scale';
import { interpolateRgbBasis } from 'd3-interpolate';
import { Config } from './types';
import { hcl } from 'd3-color';

const asScheme = (scheme: ReadonlyArray<ReadonlyArray<string>>) =>
  scheme[scheme.length - 1] as string[];

export enum ColorScheme {
  primary = '#137CBD',
}

const FLOW_MIN_COLOR = 'rgba(240,240,240,0.5)';
export const DEFAULT_COLOR_SCHEME = [FLOW_MIN_COLOR, ColorScheme.primary];

const SCALE_NUM_STEPS = 20;
const getColorSteps = (interpolate: (x: number) => string) =>
    range(0,SCALE_NUM_STEPS + 1)
      .map(i => interpolate(i/SCALE_NUM_STEPS)).reverse();

export const COLOR_SCHEMES: { [key: string]: string[] } = {
  Default: DEFAULT_COLOR_SCHEME,
  // https://carto.com/carto-colors/
  Blues: asScheme(schemeBlues),
  BluGrn: ['#c4e6c3', '#96d2a4', '#6dbc90', '#4da284', '#36877a', '#266b6e', '#1d4f60'],
  BluYl: ['#f7feae', '#b7e6a5', '#7ccba2', '#46aea0', '#089099', '#00718b', '#045275'],
  BrwnYl: ['#ede5cf', '#e0c2a2', '#d39c83', '#c1766f', '#a65461', '#813753', '#541f3f'],
  BuGn: asScheme(schemeBuGn),
  BuPu: asScheme(schemeBuPu),
  Burg: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044'],
  BurgYl: ['#fbe6c5', '#f5ba98', '#ee8a82', '#dc7176', '#c8586c', '#9c3f5d', '#70284a'],
  Cool: getColorSteps(interpolateCool),
  DarkMint: ['#d2fbd4', '#a5dbc2', '#7bbcb0', '#559c9e', '#3a7c89', '#235d72', '#123f5a'],
  Emrld: ['#d3f2a3', '#97e196', '#6cc08b', '#4c9b82', '#217a79', '#105965', '#074050'],
  GnBu: asScheme(schemeGnBu),
  Greens: asScheme(schemeGreens),
  Greys: asScheme(schemeGreys),
  Inferno: getColorSteps(interpolateInferno),
  Magenta: ['#f3cbd3', '#eaa9bd', '#dd88ac', '#ca699d', '#b14d8e', '#91357d', '#6c2167'],
  Magma: getColorSteps(interpolateMagma),
  Mint: ['#e4f1e1', '#b4d9cc', '#89c0b6', '#63a6a0', '#448c8a', '#287274', '#0d585f'],
  Oranges: asScheme(schemeOranges),
  OrRd: asScheme(schemeOrRd),
  OrYel: ['#ecda9a', '#efc47e', '#f3ad6a', '#f7945d', '#f97b57', '#f66356', '#ee4d5a'],
  Peach: ['#fde0c5', '#facba6', '#f8b58b', '#f59e72', '#f2855d', '#ef6a4c', '#eb4a40'],
  Plasma: getColorSteps(interpolatePlasma),
  PinkYl: ['#fef6b5', '#ffdd9a', '#ffc285', '#ffa679', '#fa8a76', '#f16d7a', '#e15383'],
  PuBu: asScheme(schemePuBu),
  PuBuGn: asScheme(schemePuBuGn),
  PuRd: asScheme(schemePuRd),
  Purp: ['#f3e0f7', '#e4c7f1', '#d1afe8', '#b998dd', '#9f82ce', '#826dba', '#63589f'],
  Purples: asScheme(schemePurples),
  PurpOr: ['#f9ddda', '#f2b9c4', '#e597b9', '#ce78b3', '#ad5fad', '#834ba0', '#573b88'],
  RdPu: asScheme(schemeRdPu),
  RedOr: ['#f6d2a9', '#f5b78e', '#f19c7c', '#ea8171', '#dd686c', '#ca5268', '#b13f64'],
  Reds: asScheme(schemeReds),
  Sunset: ['#f3e79b', '#fac484', '#f8a07e', '#eb7f86', '#ce6693', '#a059a0', '#5c53a5'],
  SunsetDark: ['#fcde9c', '#faa476', '#f0746e', '#e34f6f', '#dc3977', '#b9257a', '#7c1d6f'],
  Teal: ['#d1eeea', '#a8dbd9', '#85c4c9', '#68abb8', '#4f90a6', '#3b738f', '#2a5674'],
  TealGrn: ['#b0f2bc', '#89e8ac', '#67dba5', '#4cc8a3', '#38b2a3', '#2c98a0', '#257d98'],
  Viridis: getColorSteps(interpolateViridis),
  Warm: getColorSteps(interpolateWarm),
  YlGn: asScheme(schemeYlGn),
  YlGnBu: asScheme(schemeYlGnBu),
  YlOrBr: asScheme(schemeYlOrBr),
  YlOrRd: asScheme(schemeYlOrRd),
};

export const COLOR_SCHEME_KEYS = Object.keys(COLOR_SCHEMES);

const complementary = '#f52020';
const baseDiffColor = '#17a5be';

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
  schemeKey: string | undefined,
  darkMode: boolean,
  fadeEnabled: boolean,
  fadeAmount: number,
  animate: boolean
): Colors | DiffColors {
  if (diffMode) {
    return diffColors;
  }

  let scheme = (schemeKey && COLOR_SCHEMES[schemeKey]) || DEFAULT_COLOR_SCHEME;

  if (darkMode) {
    scheme = scheme.slice().reverse();
  }
  // if (animate)
  // if (fadeAmount > 0)
  {
    const indices = range(0, Math.max(10, scheme.length));
    const N = indices.length - 1;
    const colorScale = scaleSequential(interpolateRgbBasis(scheme)).domain([0, N]);

    if (!fadeEnabled || fadeAmount === 0) {
      scheme = indices.map((c, i) => colorScale(i));
    } else {
      const amount = scalePow()
        // .exponent(animate ? 1 : 1/2.5)
        // .exponent(animate ? 100 : 50)
        // .exponent(animate ? 20 : 5)
        // .exponent(1/2.5)
        .exponent(1.5)
        .domain([N, 0])
        // .range([fadeAmount/100*(animate?2:1), 0])
        // .range([0, fadeAmount/100*(animate?2:1)])
        // .range(darkMode ? [1-fadeAmount/100, 1] : [1, 1 - fadeAmount/100])
        // .range(darkMode ? [1 - fadeAmount/100, 1] : [fadeAmount/100, 0])
        // .range([1 - fadeAmount/100, 1])
        .range([0, ((animate ? 2.5 : 2) * fadeAmount) / 100]);

      scheme = indices.map(
        (c, i) => {
          const col = hcl(colorScale(i));
          col.l = darkMode ? col.l - col.l * amount(i) : col.l + (100 - col.l) * amount(i);
          col.c = col.c - col.c * (amount(i) / 4);
          return col.toString();
        }
        // interpolateRgbBasis([colorScale(i), darkMode ? '#000' : '#fff'])(amount(i))
        // interpolateHsl(colorScale(i), darkMode ? '#000' : '#fff')(amount(i)).toString()
      );
    }
  }

  return {
    flows: {
      scheme,
    },
    locationCircles: {
      outgoing: darkMode ? '#000' : '#fff',
    },
    outlineColor: darkMode ? '#000' : 'rgba(255, 255, 255, 0.5)',
  };
}
