import {Button} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import type {FlowScaleSample, RGBA, ScaleState} from '@flowmap.gl/data';
import {Column, LegendTitle} from './Boxes';

const cssColor = ([r, g, b, a]: RGBA) => `rgba(${r}, ${g}, ${b}, ${a / 255})`;
const formatValue = new Intl.NumberFormat(undefined, {maximumSignificantDigits: 4}).format;

const rowStyle = {display: 'flex', alignItems: 'center', gap: 6, minHeight: 18};
const circleStyle = {flex: '0 0 16px', height: 16, borderRadius: '50%'};
const circleEntries = [
  {label: 'Outgoing ≅ incoming', ring: null},
  {label: 'More outgoing', ring: 'outgoing'},
  {label: 'More incoming', ring: 'incoming'},
] as const;

function WidthSample({sample, label}: {sample: FlowScaleSample; label: string}) {
  return (
    <div style={rowStyle}>
      <span
        aria-hidden="true"
        style={{
          flex: '0 0 36px',
          height: Math.max(1, sample.thickness),
          background: cssColor(sample.color),
          borderRadius: 1,
        }}
      />
      {label}
    </div>
  );
}

interface Props {
  scale?: ScaleState;
  locked: boolean;
  onToggleLock: () => void;
}

export default function ScaleLegend({scale, locked, onToggleLock}: Props) {
  const {flowThickness, locationCircles} = scale ?? {};
  const locationRange = locationCircles?.domain.map(formatValue).join(' to ');
  return (
    <Column spacing={8} padding="12px">
      {flowThickness && (
        <div>
          <LegendTitle>Flow width</LegendTitle>
          {flowThickness.samples
            .filter(
              (sample, index, samples) =>
                index === 0 || sample.magnitude !== samples[index - 1].magnitude,
            )
            .map((sample) => (
              <WidthSample
                key={sample.magnitude}
                sample={sample}
                label={formatValue(sample.magnitude)}
              />
            ))}
          {flowThickness.outOfScale && (
            <WidthSample
              sample={flowThickness.outOfScale}
              label={`Above ${formatValue(flowThickness.outOfScale.magnitude)}`}
            />
          )}
        </div>
      )}
      {locationCircles && (
        <div>
          <LegendTitle>Location totals</LegendTitle>
          {circleEntries.map(({label, ring}) => (
            <div key={label} style={rowStyle}>
              <span
                aria-hidden="true"
                style={{
                  ...circleStyle,
                  display: 'grid',
                  placeItems: 'center',
                  border: `1px solid ${cssColor(locationCircles.colors.incoming)}`,
                  background: cssColor(locationCircles.colors[ring ?? 'incoming']),
                }}
              >
                {ring && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: cssColor(locationCircles.colors.incoming),
                      boxShadow: `0 0 0 1px ${cssColor(locationCircles.colors.empty)}`,
                    }}
                  />
                )}
              </span>
              {label}
            </div>
          ))}
          <div>{locationRange}</div>
          {locationCircles.outOfScale && (
            <div style={rowStyle}>
              <span
                aria-hidden="true"
                style={{
                  ...circleStyle,
                  background: cssColor(locationCircles.outOfScale.color),
                }}
              />
              Above {formatValue(locationCircles.outOfScale.magnitude)}
            </div>
          )}
        </div>
      )}
      <Button
        small
        fill
        icon={locked ? IconNames.LOCK : IconNames.UNLOCK}
        active={locked}
        aria-pressed={locked}
        disabled={!locked && !scale?.domains}
        onClick={onToggleLock}
        text="Lock scales"
      />
    </Column>
  );
}
