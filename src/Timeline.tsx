import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { scaleLinear, scaleTime } from 'd3-scale';
import { max } from 'd3-array';
import { EventManager } from 'mjolnir.js';
import PlayControl from './PlayControl';
import { Colors } from '@blueprintjs/core';
import { useMeasure, useThrottle } from 'react-use';
import { areRangesEqual, tickMultiFormat, TimeGranularity } from './time';
import { CountByTime } from './types';

interface Props {
  selectedRange: [Date, Date];
  extent: [Date, Date];
  totalCountsByTime: CountByTime[];
  darkMode: boolean;
  timeGranularity: TimeGranularity;
  onChange: (range: [Date, Date]) => void;
}

const SVG_HEIGHT = 80;
const AXIS_AREA_HEIGHT = 20;
const TOTAL_COUNT_CHART_HEIGHT = 30;
const TICK_HEIGHT = 5;

const margin = {
  top: 15,
  left: 20,
  right: 20,
  bottom: 20,
};

const Outer = styled.div({
  display: 'flex',
  padding: '5px 20px',
  alignItems: 'center',
  userSelect: 'none',
  '&>*+*': {
    marginLeft: 10,
  },
});

const MeasureTarget = styled.div({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
});

const TimelineSvg = styled.svg({
  cursor: 'pointer',
});

const HandleOuter = styled.g({
  cursor: 'ew-resize',
  '& > path': {
    stroke: Colors.DARK_GRAY1,
    transition: 'fill 0.2s',
    fill: Colors.GRAY4,
  },
  '&:hover path': {
    fill: Colors.WHITE,
  },
});

const HandlePath = styled.path({
  strokeWidth: 1,
} as any);

const HandleHoverTarget = styled.rect({
  fill: Colors.GRAY5,
  fillOpacity: 0,
});

const SelectedRangeRect = styled.rect({
  fill: Colors.BLUE5,
  cursor: 'move',
  transition: 'fill-opacity 0.2s',
  fillOpacity: 0.3,
  '&:hover': {
    fillOpacity: 0.4,
  },
});

const AxisPath = styled.path({
  fill: 'none',
  stroke: Colors.GRAY1,
  shapeRendering: 'crispEdges',
} as any);

const TickText = styled.text<{ darkMode: boolean }>((props) => ({
  fill: props.darkMode ? Colors.LIGHT_GRAY1 : Colors.DARK_GRAY1,
  fontSize: 10,
  textAnchor: 'middle',
}));

const TickLine = styled.line({
  fill: 'none',
  stroke: Colors.GRAY1,
  shapeRendering: 'crispEdges',
} as any);

type Side = 'start' | 'end';

interface HandleProps {
  width: number;
  height: number;
  side: Side;
  onMove: (pos: number, side: Side) => void;
}
const TimelineHandle: React.FC<HandleProps> = (props) => {
  const { width, height, side, onMove } = props;
  const handleMoveRef = useRef<any>();
  handleMoveRef.current = ({ center }: any) => {
    onMove(center.x, side);
  };
  const ref = useRef<SVGRectElement>(null);
  useEffect(() => {
    const eventManager = new EventManager(ref.current);
    if (handleMoveRef.current) {
      eventManager.on('panstart', handleMoveRef.current);
      eventManager.on('panmove', handleMoveRef.current);
      eventManager.on('panend', handleMoveRef.current);
    }
    return () => {
      // eventManager.off('panstart', handleMove);
      // eventManager.off('panmove', handleMove);
      // eventManager.off('panend', handleMove);
      eventManager.destroy();
    };
  }, [handleMoveRef]);

  const [w, h] = [width, width];
  return (
    <HandleOuter>
      <HandlePath
        transform={`translate(${side === 'start' ? 0 : width},0)`}
        d={
          side === 'start'
            ? `M0,${h} Q${-w},${h} ${-w},0 L0,0 0,${height} ${-w},${height} Q${-w},${
                height - h
              } 0,${height - h} z`
            : `M0,${h} Q${w},${h} ${w},0 L0,0 0,${height} ${w},${height} Q${w},${height - h} 0,${
                height - h
              } z`
        }
      />
      <HandleHoverTarget x={side === 'start' ? -w : w} ref={ref} height={height} width={width} />
    </HandleOuter>
  );
};

interface TimelineChartProps extends Props {
  width: number;
}

type MoveSideHandler = (pos: number, side: Side) => void;

const TimelineChart: React.FC<TimelineChartProps> = (props) => {
  const {
    width,
    extent,
    selectedRange,
    timeGranularity,
    totalCountsByTime,
    darkMode,
    onChange,
  } = props;

  const handleWidth = 10;
  const handleHGap = 10;
  const handleHeight = TOTAL_COUNT_CHART_HEIGHT + AXIS_AREA_HEIGHT + handleHGap * 2;

  const chartWidth = width - margin.left - margin.right;
  const timeScale = scaleTime();
  timeScale.domain(extent);
  timeScale.range([0, chartWidth]);

  const [offset, setOffset] = useState<number>();

  const svgRef = useRef<SVGSVGElement>(null);
  const rectRef = useRef<SVGRectElement>(null);

  const mousePosition = (absPos: number) => {
    const { current } = svgRef;
    if (current != null) {
      const { left } = current.getBoundingClientRect();
      return absPos - left - margin.left;
    }
    return undefined;
  };

  const timeFromPos = (pos: number) => {
    const relPos = mousePosition(pos);
    if (relPos != null) return timeScale.invert(relPos);
    return undefined;
  };

  const handleMoveRef = useRef<any>();
  handleMoveRef.current = ({ center }: any) => {
    if (offset == null) {
      const pos = mousePosition(center.x);
      if (pos != null) {
        setOffset(timeScale(selectedRange[0]) - pos);
      }
    } else {
      let nextStart = timeFromPos(center.x + offset);
      if (nextStart) {
        const { interval } = timeGranularity;
        nextStart = interval.round(nextStart);
        const length = (interval as any).count(selectedRange[0], selectedRange[1]);
        let nextEnd = interval.offset(nextStart, length);
        if (nextStart < extent[0]) {
          nextStart = extent[0];
          nextEnd = interval.offset(extent[0], length);
        }
        if (nextEnd > extent[1]) {
          nextStart = interval.offset(extent[1], -length);
          nextEnd = extent[1];
        }
        onChange([nextStart, nextEnd]);
      }
    }
  };

  const handleMove = (evt: any) => {
    if (handleMoveRef.current) {
      handleMoveRef.current(evt);
    }
  };
  const handleMoveEnd = (evt: any) => {
    if (handleMoveRef.current) {
      handleMoveRef.current(evt);
    }
    setOffset(undefined);
  };

  useEffect(() => {
    const eventManager = new EventManager(rectRef.current);
    eventManager.on('panstart', handleMove);
    eventManager.on('panmove', handleMove);
    eventManager.on('panend', handleMoveEnd);
    return () => {
      eventManager.destroy();
    };
  }, []);

  const handleMoveSideRef = useRef<MoveSideHandler>();
  handleMoveSideRef.current = (pos, side) => {
    let t = timeFromPos(pos);
    if (t != null) {
      t = timeGranularity.interval.round(t);
      if (t < extent[0]) t = extent[0];
      if (t > extent[1]) t = extent[1];
      if (side === 'start') {
        onChange([t < selectedRange[1] ? t : selectedRange[1], selectedRange[1]]);
      } else {
        onChange([selectedRange[0], t > selectedRange[0] ? t : selectedRange[0]]);
      }
    }
  };
  const handleMoveSide: MoveSideHandler = (pos, kind) => {
    if (handleMoveSideRef.current) {
      handleMoveSideRef.current(pos, kind);
    }
  };

  const minLabelWidth = 70;
  const ticks = timeScale.ticks(
    Math.min(
      (timeGranularity.interval as any).count(extent[0], extent[1]),
      chartWidth / minLabelWidth
    )
  );

  const totalCountScale = scaleLinear()
    .domain([0, max(totalCountsByTime, (d) => d.count) ?? 0])
    .range([0, TOTAL_COUNT_CHART_HEIGHT]);

  const tickLabelFormat = tickMultiFormat; // timeScale.tickFormat();
  return (
    <TimelineSvg width={width} height={SVG_HEIGHT} ref={svgRef}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        <g transform={`translate(0,0)`}>
          {totalCountsByTime.map(({ time, count }) => (
            <rect
              key={time.getTime()}
              x={timeScale(time)}
              y={TOTAL_COUNT_CHART_HEIGHT - totalCountScale(count)}
              width={Math.max(
                timeScale(timeGranularity.interval.offset(time)) - timeScale(time) - 1,
                1
              )}
              height={totalCountScale(count)}
              fill={Colors.LIGHT_GRAY1}
              stroke={Colors.GRAY4}
            />
          ))}
        </g>
        <g transform={`translate(0,${TOTAL_COUNT_CHART_HEIGHT})`}>
          <g>
            {ticks.map((t, i) => (
              <g key={i} transform={`translate(${timeScale(t)},${0})`}>
                <TickLine y1={0} y2={TICK_HEIGHT} />
                <TickText darkMode={darkMode} x={3} y={15}>
                  {
                    // timeGranularity.format(t)
                    tickLabelFormat(t)
                  }
                </TickText>
              </g>
            ))}
            <AxisPath
              d={`M0,${TICK_HEIGHT * 1.5} 0,0 ${chartWidth},0 ${chartWidth},${TICK_HEIGHT * 1.5}`}
            />
          </g>
          {/*<g transform={`translate(0,${AXIS_AREA_HEIGHT})`}>*/}
          {/*  {ticks.map((t, i) => (*/}
          {/*    <TickLine key={i} transform={`translate(${timeScale(t)},${0})`} y1={0} y2={-TICK_HEIGHT} />*/}
          {/*  ))}*/}
          {/*  <AxisPath*/}
          {/*    d={`M0,-${TICK_HEIGHT * 1.5} 0,0 ${chartWidth},0 ${chartWidth},-${TICK_HEIGHT * 1.5}`}*/}
          {/*  />*/}
          {/*</g>*/}
        </g>
        <g transform={`translate(${timeScale(selectedRange[0])},${-handleHGap})`}>
          <SelectedRangeRect
            ref={rectRef}
            height={handleHeight}
            width={timeScale(selectedRange[1]) - timeScale(selectedRange[0])}
          />
          <TimelineHandle
            width={handleWidth}
            height={handleHeight}
            side="start"
            onMove={handleMoveSide}
          />
        </g>
        s{' '}
        <g transform={`translate(${timeScale(selectedRange[1]) - handleWidth},${-handleHGap})`}>
          <TimelineHandle
            width={handleWidth}
            height={handleHeight}
            side="end"
            onMove={handleMoveSide}
          />
        </g>
      </g>
    </TimelineSvg>
  );
};

const Timeline: React.FC<Props> = (props) => {
  const [measureRef, dimensions] = useMeasure();
  const { extent, selectedRange, timeGranularity, onChange } = props;
  const [internalRange, setInternalRange] = useState<[Date, Date]>(selectedRange);
  const throttledRange = useThrottle(internalRange, 100);
  const onChangeRef = useRef<(range: [Date, Date]) => void>();
  onChangeRef.current = (range) => onChange(range);
  useEffect(() => {
    const { current } = onChangeRef;
    if (current) current(throttledRange);
  }, [throttledRange, onChangeRef]);

  const [prevSelectedRange, setPrevSelectedRange] = useState(selectedRange);
  if (!areRangesEqual(selectedRange, prevSelectedRange)) {
    setInternalRange(selectedRange);
    setPrevSelectedRange(selectedRange);
  }

  const [isPlaying, setPlaying] = useState(false);

  const handlePlay = () => {
    const { interval } = timeGranularity;
    if (selectedRange[1] >= extent[1]) {
      const length = (interval as any).count(selectedRange[0], selectedRange[1]);
      setInternalRange([extent[0], interval.offset(extent[0], length)]);
    }
    setPlaying(true);
  };

  const handlePlayAdvance = (start: Date) => {
    const { interval } = timeGranularity;
    const length = (interval as any).count(selectedRange[0], selectedRange[1]);
    const end = interval.offset(start, length);
    if (end >= extent[1]) {
      setPlaying(false);
      setInternalRange([interval.offset(end, -length), end]);
    } else {
      setInternalRange([start, end]);
    }
  };

  const handleMove = (range: [Date, Date]) => {
    setInternalRange(range);
    setPlaying(false);
  };

  return (
    <Outer>
      <PlayControl
        extent={extent}
        current={internalRange[0]}
        interval={timeGranularity.interval}
        stepDuration={100}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={() => setPlaying(false)}
        onAdvance={handlePlayAdvance}
      />
      <MeasureTarget ref={measureRef}>
        {dimensions.width > 0 && (
          <TimelineChart
            {...props}
            selectedRange={internalRange}
            width={dimensions.width}
            onChange={handleMove}
          />
        )}
      </MeasureTarget>
    </Outer>
  );
};

export default Timeline;
