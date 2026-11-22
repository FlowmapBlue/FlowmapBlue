import {
  Colors,
  DiffColors,
  getColorsRGBA,
  getDiffColorsRGBA,
  isDiffColors,
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
  const circles = isDiffColors(colors)
    ? getDiffColorsRGBA(colors).positive.locationCircles
    : getColorsRGBA(colors).locationCircles;
  return (
    <div>
      {entries.map(({label, outer}) => (
        <div key={label} style={{display: 'flex', alignItems: 'center', gap: 3, padding: '3px 0'}}>
          <span
            aria-hidden="true"
            style={{
              flex: '0 0 16px',
              height: 16,
              borderRadius: '50%',
              border: `4px solid ${cssColor(circles[outer])}`,
              background: cssColor(circles.inner),
            }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}
