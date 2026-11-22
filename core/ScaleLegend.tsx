import {Button} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import styled from '@emotion/styled';
import type {FlowScaleSample, RGBA, ScaleState} from '@flowmap.gl/data';
import {Column, LegendTitle} from './Boxes';

const cssColor = ([r, g, b, a]: RGBA) => `rgba(${r}, ${g}, ${b}, ${a / 255})`;
const formatValue = new Intl.NumberFormat(undefined, {maximumSignificantDigits: 4}).format;

const SampleRow = styled.div`
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  min-height: 17px;
`;
const WidthRow = styled(SampleRow)`
  grid-template-columns: 30px minmax(0, 1fr);
  font-variant-numeric: tabular-nums;
`;
const SectionTitle = styled(LegendTitle)`
  margin-bottom: 3px;
`;
const Range = styled.div`
  margin-top: 3px;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
`;
const LockButton = styled(Button)`
  font-size: 11px;
`;
const circleStyle = {width: 14, height: 14, borderRadius: '50%'};
const circleEntries = [
  {label: 'Outgoing ≅ incoming', ring: null},
  {label: 'More outgoing', ring: 'outgoing'},
  {label: 'More incoming', ring: 'incoming'},
] as const;

function WidthSample({sample, label}: {sample: FlowScaleSample; label: string}) {
  return (
    <WidthRow>
      <span
        aria-hidden="true"
        style={{
          height: Math.max(1, sample.thickness),
          background: cssColor(sample.color),
          borderRadius: 1,
        }}
      />
      {label}
    </WidthRow>
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
    <Column spacing={7} padding="8px 10px">
      {flowThickness && (
        <div>
          <SectionTitle>Flow width</SectionTitle>
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
          <SectionTitle>Location totals</SectionTitle>
          {circleEntries.map(({label, ring}) => (
            <SampleRow key={label}>
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
            </SampleRow>
          ))}
          <Range>{locationRange}</Range>
          {locationCircles.outOfScale && (
            <SampleRow>
              <span
                aria-hidden="true"
                style={{
                  ...circleStyle,
                  background: cssColor(locationCircles.outOfScale.color),
                }}
              />
              <span>Above {formatValue(locationCircles.outOfScale.magnitude)}</span>
            </SampleRow>
          )}
        </div>
      )}
      <LockButton
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
