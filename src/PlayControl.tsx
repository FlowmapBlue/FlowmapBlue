import React from 'react';
import styled from '@emotion/styled';
import { TimeInterval } from 'd3-time';

interface Props {
  current: Date;
  start: Date;
  end: Date;
  timeStep: TimeInterval;
  autoplay: boolean;
  stepDuration: number;
  onChange: (date: Date) => void;
}

const width = 40,
  height = 40;

const OuterSvg = styled.svg({
  cursor: 'pointer',
  '& > circle': {
    transition: 'opacity 0.2s',
    opacity: 0.25,
  },
  '&:hover': {
    '& > circle': {
      opacity: 1.0,
    },
  },
});

const OuterCircle = styled.circle({
  cursor: 'pointer',
  strokeWidth: 1,
  stroke: '#000',
  fill: '#fff',
});

interface State {
  isPlaying: boolean;
}

class PlayControl extends React.Component<Props, State> {
  playTimeout: NodeJS.Timeout | undefined;

  state = {
    isPlaying: false,
  };

  componentDidMount(): void {
    const { autoplay } = this.props;
    if (autoplay) {
      this.start();
    }
  }

  componentWillUnmount(): void {
    this.clearPlayTimeOut();
  }

  start = () => {
    const { isPlaying } = this.state;
    if (!isPlaying) {
      const { start, current, end, onChange } = this.props;
      this.setState({ isPlaying: true }, () => {
        this.scheduleNextStep();
      });
      if (current >= end) {
        // rewind
        onChange(start);
      }
    }
  };

  stop = () => {
    this.clearPlayTimeOut();
    const { isPlaying } = this.state;
    if (isPlaying) {
      this.setState({ isPlaying: false });
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
    const { isPlaying } = this.state;
    if (isPlaying) {
      const { timeStep, end, current, onChange } = this.props;
      const next = timeStep.offset(current, 1);
      if (next > end) {
        this.stop();
      } else {
        onChange(next);
        this.scheduleNextStep();
      }
    }
  };

  render() {
    const { isPlaying } = this.state;
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
