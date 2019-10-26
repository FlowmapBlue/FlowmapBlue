import styled from '@emotion/styled'
import * as React from 'react'
import { Card } from '@blueprintjs/core';

const MoreContent = styled(Card)`
  margin-top: 1em;
  margin-bottom: 1em;
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
        <MoreContent>{this.props.children}</MoreContent>
        : <MoreLink onClick={this.handleClick}>Read more…</MoreLink>
    )
  }
}
