import styled from '@emotion/styled'
import * as React from 'react'

const MoreContent = styled.div`
  padding: 10px;
  border-radius: 4px;
  background: #eef;
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
