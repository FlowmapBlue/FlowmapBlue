import React from 'react';
import styled from '@emotion/styled';
import { TimeInterval } from 'd3-time';
import { Colors } from '@blueprintjs/core';

interface Props {
  current: Date;
  extent: [Date, Date];
  interval: TimeInterval;
  stepDuration: number;
  speed: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onAdvance: (date: Date) => void;
}

const width = 40,
  height = 40;

const OuterSvg = styled.svg({
  cursor: 'pointer',
  '& > circle': {
    transition: 'fill 0.2s',
    fill: Colors.GRAY4,
  },
  '&:hover': {
    '& > circle': {
      fill: Colors.WHITE,
    },
  },
});

const OuterCircle = styled.circle({
  cursor: 'pointer',
  strokeWidth: 1,
  stroke: '#000',
  fill: '#fff',
});

class PlayControl extends React.Component<Props> {
  playTimeout: NodeJS.Timeout | undefined;
  static defaultProps = {
    speed: 1,
  };

  componentWillUnmount(): void {
    this.clearPlayTimeOut();
  }

  start = () => {
    const { isPlaying, onPlay } = this.props;
    if (!isPlaying) {
      const { extent, current, onAdvance } = this.props;
      onPlay();
      this.scheduleNextStep();
      if (current >= extent[1]) {
        // rewind
        onAdvance(extent[0]);
      }
    }
  };

  stop = () => {
    this.clearPlayTimeOut();
    const { isPlaying, onPause } = this.props;
    if (isPlaying) {
      onPause();
    }
  };

  clearPlayTimeOut = () => {
    if (this.playTimeout != null) {
      clearTimeout(this.playTimeout);
      this.playTimeout = undefined;
    }
  };

  scheduleNextStep = () => {
    this.clearPlayTimeOut();
    const { stepDuration } = this.props;
    this.playTimeout = setTimeout(this.nextStep, stepDuration);
  };

  nextStep = () => {
    const { isPlaying, speed } = this.props;
    if (isPlaying) {
      const { interval, extent, current, onAdvance } = this.props;
      // @ts-ignore
      const numSteps = interval.count(extent[0], extent[1]);
      const next = interval.offset(current, speed * Math.max(1, Math.floor(numSteps / 60)));
      if (next > extent[1]) {
        this.stop();
      } else {
        onAdvance(next);
        this.scheduleNextStep();
      }
    }
  };

  render() {
    const { isPlaying } = this.props;
    const handleTogglePlay = () => {
      if (isPlaying) {
        this.stop();
      } else {
        this.start();
      }
    };

    let icon;
    if (!isPlaying) {
      icon = (
        <path
          fill="#000"
          d="M16 10c0-.36-.2-.67-.49-.84l.01-.01-10-6-.01.01A.991.991 0 005 3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1 .19 0 .36-.07.51-.16l.01.01 10-6-.01-.01c.29-.17.49-.48.49-.84z"
          transform="translate(.5)"
        />
      );
    } else {
      icon = (
        <path
          fill="#000"
          d="M7 3H4c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm9 0h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"
        />
      );
    }

    const r = Math.min(width, height) * 0.48;
    return (
      <OuterSvg width={width} height={height} onClick={handleTogglePlay}>
        <OuterCircle cx={width / 2} cy={height / 2} r={r} />
        <g transform={`translate(${width / 2 - 10},${height / 2 - 10})`}>{icon}</g>
      </OuterSvg>
    );
  }
}

export default PlayControl;
