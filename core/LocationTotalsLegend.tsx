import {
  Colors,
  DiffColors,
  getColorsRGBA,
  getDiffColorsRGBA,
  isDiffColors,
  isDiffColorsRGBA,
  RGBA,
} from '@flowmap.gl/data';
import React from 'react';

const cssColor = ([r, g, b, a]: RGBA) => `rgba(${r}, ${g}, ${b}, ${a / 255})`;
const entries = [
  {label: 'outgoing ≅ incoming', outer: 'inner'},
  {label: 'more outgoing', outer: 'outgoing'},
  {label: 'more incoming', outer: 'incoming'},
] as const;

export default function LocationTotalsLegend({colors}: {colors: Colors | DiffColors}) {
  const rgba = isDiffColors(colors) ? getDiffColorsRGBA(colors) : getColorsRGBA(colors);
  const circles = isDiffColorsRGBA(rgba)
    ? [rgba.positive.locationCircles, rgba.negative.locationCircles]
    : [rgba.locationCircles];
  return (
    <div>
      {entries.map(({label, outer}) => (
        <div key={label} style={{display: 'flex', alignItems: 'center', gap: 3, padding: '3px 0'}}>
          {circles.map(({inner, ...ring}, index) => (
            <span
              key={index}
              aria-hidden="true"
              style={{
                flex: '0 0 16px',
                height: 16,
                borderRadius: '50%',
                border: `4px solid ${cssColor(outer === 'inner' ? inner : ring[outer])}`,
                background: cssColor(inner),
              }}
            />
          ))}
          {label}
        </div>
      ))}
    </div>
  );
}
