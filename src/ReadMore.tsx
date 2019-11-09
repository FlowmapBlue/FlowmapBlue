import styled from '@emotion/styled'
import * as React from 'react'
import { Card, Colors } from '@blueprintjs/core';
import { Elevation } from '@blueprintjs/core/lib/esm/common/elevation';

const MoreContent = styled(Card)`
  margin-top: 1em;
  margin-bottom: 1em;
  background-color: ${Colors.GRAY1} !important;
`
const MoreLink = styled.a`
  cursor: pointer;
`

export default class ReadMore extends React.Component {
  state = {
    isOpen: false
  }
  handleClick = () => this.setState({ isOpen: true })
  render() {
    return (
      this.state.isOpen ?
        <MoreContent
          elevation={Elevation.TWO}
        >
          {this.props.children}
        </MoreContent>
        : <MoreLink onClick={this.handleClick}>Read more…</MoreLink>
    )
  }
}
