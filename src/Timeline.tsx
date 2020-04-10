import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Measure from 'react-measure';
import { scaleTime } from 'd3-scale';
import { TimeInterval } from 'd3-time';
import { EventManager } from 'mjolnir.js';
import PlayControl from './PlayControl';

interface Props {
  current: Date | undefined;
  start: Date | undefined;
  end: Date | undefined;
  formatDate: (d: Date) => string;
  timeInterval: TimeInterval;
  minTickWidth: number;
  stepDuration: number;
  onChange: (date: Date) => void;
}

interface Dimensions {
  width: number;
  height: number;
}

const SVG_HEIGHT = 60;
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

const eventManager = new EventManager();

const TimelineChart: React.FC<any> = (props) => {
  const { width, start, end, current, formatDate, timeInterval, minTickWidth, onChange } = props;

  const chartWidth = width - innerMargin.left - innerMargin.right;
  const x = scaleTime();
  x.domain([start, end]);
  x.range([0, chartWidth]);

  const svgRef = useRef<SVGSVGElement>(null);

  const _handleMove = useRef<(evt: any) => void>();
  _handleMove.current = (evt: any) => {
    const { current } = svgRef;
    if (current != null) {
      const { left } = current.getBoundingClientRect();
      const { center } = evt;
      let date = timeInterval.round(x.invert(center.x - left - innerMargin.left));
      if (date < start) date = start;
      if (date > end) date = end;
      onChange(date);
    }
  };

  const handleMove = (evt: any) => {
    if (_handleMove.current) {
      _handleMove.current(evt);
    }
  };

  useEffect(() => {
    eventManager.setElement(svgRef.current);
    eventManager.on('click', handleMove);
    eventManager.on('panstart', handleMove);
    eventManager.on('panmove', handleMove);
    eventManager.on('panend', handleMove);
    return () => {
      eventManager.setElement(null);
      eventManager.off('panstart', handleMove);
      eventManager.off('panmove', handleMove);
      eventManager.off('panend', handleMove);
    };
  }, []);

  const ticks = x.ticks(timeInterval);
  const tickLabels: Date[] = [];

  let nextTick = end;
  const step = -Math.ceil(ticks.length / (chartWidth / minTickWidth));
  while (nextTick >= start) {
    tickLabels.push(nextTick);
    nextTick = timeInterval.offset(nextTick, step);
  }

  return (
    <TimelineSvg width={width} height={SVG_HEIGHT} ref={svgRef}>
      <g transform={`translate(${innerMargin.left},${innerMargin.top})`}>
        <g transform={`translate(${x(current)},7)`}>
          <TrianglePath transform="translate(0,-14)" d="M-10,0 0,13 10,0 z" />
        </g>
        <g transform={`translate(0,10)`}>
          {ticks.map((t, i) => (
            <TickLine key={i} transform={`translate(${x(t)},${0})`} y1={0} y2={TICK_HEIGHT} />
          ))}
          {tickLabels.map((t, i) => (
            <g key={i} transform={`translate(${x(t)},${0})`}>
              <rect
                x={(-minTickWidth * 0.7) / 2}
                width={minTickWidth * 0.7}
                y={7}
                height={20}
                fill="#fff"
              />
              <TickText y={20}>{formatDate(t)}</TickText>
            </g>
          ))}
          <AxisPath
            d={`M0,${TICK_HEIGHT * 1.5} 0,0 ${chartWidth},0 ${chartWidth},${TICK_HEIGHT * 1.5}`}
          />
        </g>
      </g>
    </TimelineSvg>
  );
};

const Timeline: React.FC<Props> = (props) => {
  const [dimensions, setDimensions] = useState<Dimensions>();

  const { start, end, current, timeInterval, stepDuration, onChange } = props;

  if (!start || !end || !current) {
    return <Outer />;
  }

  return (
    <Outer>
      <PlayControl
        autoplay={true}
        start={start}
        end={end}
        current={current}
        timeStep={timeInterval}
        stepDuration={stepDuration}
        onChange={onChange}
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
