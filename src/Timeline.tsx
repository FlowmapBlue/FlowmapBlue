import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Measure from 'react-measure';
import { scaleTime } from 'd3-scale';
import { TimeInterval } from 'd3-time';
import { EventManager } from 'mjolnir.js';
import PlayControl from './PlayControl';

interface Props {
  selectedRange: [Date, Date];
  extent: [Date, Date];
  formatDate: (d: Date) => string;
  timeInterval: TimeInterval;
  minTickWidth: number;
  stepDuration: number;
  onChange: (range: [Date, Date]) => void;
}

interface Dimensions {
  width: number;
  height: number;
}

const SVG_HEIGHT = 70;
const TICK_HEIGHT = 5;

const innerMargin = {
  top: 15,
  left: 30,
  right: 30,
  bottom: 20,
};

const Outer = styled.div({
  display: 'flex',
  padding: '5px 20px',
  alignItems: 'center',
  '&>*+*': {
    marginLeft: 10,
  },
});

// const PlayButton = styled.img({
//   border: '1px solid #000',
//   borderRadius: '50%',
//   padding: 10,
//   cursor: 'pointer',
//   opacity: 0.65,
//   transition: 'opacity 0.2s',
//   '&:hover': {
//     opacity: 1.0,
//   }
// });

const MeasureTarget = styled.div({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
});

const TimelineSvg = styled.svg({
  cursor: 'pointer',
});

const TickLine = styled.line({
  fill: 'none',
  stroke: '#333',
});

const TrianglePath = styled.path({
  strokeWidth: 1,
  stroke: 'none',
  fill: '#333',
  // opacity: 0.65,
  // transition: 'opacity 0.2s',
  // '&:hover': {
  //   opacity: 1.0,
  // }
});

const AxisPath = styled.path({
  fill: 'none',
  stroke: '#333',
});

const TickText = styled.text({
  fill: '#333',
  fontSize: 11,
  textAnchor: 'middle',
  // textTransform: 'uppercase',
});

interface HandleProps {
  onMove: (pos: number) => void;
}
const TimelineHandle: React.FC<HandleProps> = (props) => {
  const { onMove } = props;
  const handleMove = ({ center }: any) => {
    onMove(center.x);
  };
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const eventManager = new EventManager(ref.current);
    eventManager.on('panstart', handleMove);
    eventManager.on('panmove', handleMove);
    eventManager.on('panend', handleMove);
    return () => {
      // eventManager.off('panstart', handleMove);
      // eventManager.off('panmove', handleMove);
      // eventManager.off('panend', handleMove);
      eventManager.destroy();
    };
  }, []);

  return <TrianglePath ref={ref} transform="translate(0,-14)" d="M-10,0 0,13 10,0 z" />;
};

interface TimelineChartProps extends Props {
  width: number;
}

type MoveHandler = (pos: number, kind: 'start' | 'end') => void;
const TimelineChart: React.FC<TimelineChartProps> = (props) => {
  const { width, extent, selectedRange, formatDate, timeInterval, minTickWidth, onChange } = props;

  const chartWidth = width - innerMargin.left - innerMargin.right;
  const x = scaleTime();
  x.domain(extent);
  x.range([0, chartWidth]);

  const svgRef = useRef<SVGSVGElement>(null);
  const _handleMove = useRef<MoveHandler>();
  _handleMove.current = (pos, kind) => {
    const { current } = svgRef;
    if (current != null) {
      const { left } = current.getBoundingClientRect();
      let date = x.invert(pos - left - innerMargin.left);
      if (date < extent[0]) date = extent[0];
      if (date > extent[1]) date = extent[1];
      if (kind === 'start') {
        onChange([date < selectedRange[1] ? date : selectedRange[1], selectedRange[1]]);
      } else {
        onChange([selectedRange[0], date > selectedRange[0] ? date : selectedRange[0]]);
      }
    }
  };

  const handleMove: MoveHandler = (pos, kind) => {
    if (_handleMove.current) {
      _handleMove.current(pos, kind);
    }
  };

  useEffect(() => {
    const eventManager = new EventManager(svgRef.current);
    // eventManager.on('click', handleMove);
    // eventManager.on('panstart', handleMove);
    // eventManager.on('panmove', handleMove);
    // eventManager.on('panend', handleMove);
    return () => {
      // eventManager.setElement(null);
      // eventManager.off('click', handleMove);
      // eventManager.off('panstart', handleMove);
      // eventManager.off('panmove', handleMove);
      // eventManager.off('panend', handleMove);
      eventManager.destroy();
    };
  }, []);

  const ticks = x.ticks(timeInterval);
  const tickLabels: Date[] = [];

  let nextTick = extent[1];
  const step = -Math.ceil(ticks.length / (chartWidth / minTickWidth));
  while (nextTick >= extent[0]) {
    tickLabels.push(nextTick);
    nextTick = timeInterval.offset(nextTick, step);
  }

  return (
    <TimelineSvg width={width} height={SVG_HEIGHT} ref={svgRef}>
      <g transform={`translate(${innerMargin.left},${innerMargin.top})`}>
        <g transform={`translate(${x(selectedRange[0])},7)`}>
          <TimelineHandle onMove={(pos) => handleMove(pos, 'start')} />
        </g>
        <g transform={`translate(${x(selectedRange[1])},7)`}>
          <TimelineHandle onMove={(pos) => handleMove(pos, 'end')} />
        </g>
        <g transform={`translate(0,10)`}>
          {ticks.map((t, i) => (
            <TickLine key={i} transform={`translate(${x(t)},${0})`} y1={0} y2={TICK_HEIGHT} />
          ))}
          {tickLabels.map((t, i) => (
            <g key={i} transform={`translate(${x(t)},${0})`}>
              <TickText y={20}>{formatDate(t)}</TickText>
            </g>
          ))}
          <AxisPath
            d={`M0,${TICK_HEIGHT * 1.5} 0,0 ${chartWidth},0 ${chartWidth},${TICK_HEIGHT * 1.5}`}
          />
        </g>
        <g transform={`translate(0,${40})`}>
          {ticks.map((t, i) => (
            <TickLine key={i} transform={`translate(${x(t)},${0})`} y1={0} y2={-TICK_HEIGHT} />
          ))}
          <AxisPath
            d={`M0,-${TICK_HEIGHT * 1.5} 0,0 ${chartWidth},0 ${chartWidth},-${TICK_HEIGHT * 1.5}`}
          />
        </g>
      </g>
    </TimelineSvg>
  );
};

const Timeline: React.FC<Props> = (props) => {
  const [dimensions, setDimensions] = useState<Dimensions>();

  const { extent, selectedRange, timeInterval, stepDuration, onChange } = props;

  const handleChange = (start: Date) => {
    const length = selectedRange[1].getTime() - selectedRange[0].getTime();
    const end = new Date(start.getTime() + length);
    if (end > extent[1]) {
      return [new Date(end.getTime() - length), end];
    }
    onChange([start, end]);
  };

  return (
    <Outer>
      <PlayControl
        autoplay={false}
        extent={extent}
        current={selectedRange[0]}
        timeStep={timeInterval}
        stepDuration={stepDuration}
        onChange={handleChange}
      />
      <Measure bounds={true} onResize={(contentRect) => setDimensions(contentRect.bounds)}>
        {({ measureRef }) => {
          return (
            <MeasureTarget ref={measureRef}>
              {dimensions && <TimelineChart {...props} width={dimensions.width} />}
            </MeasureTarget>
          );
        }}
      </Measure>
    </Outer>
  );
};

export default Timeline;
