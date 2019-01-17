/**
 * The MIT License (MIT)

 Copyright (c) 2014 Luke Haas

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as React from 'react'
import styled from '@emotion/styled'
import { ColorScheme } from './colors'
import { hcl, RGBColor } from 'd3-color';

const lighter = (color: string) => {
  const c = hcl(ColorScheme.primary).brighter(2)
  c.c *= 0.5
  return c.toString()
}

const color1 = lighter(ColorScheme.primary)
const color2 = ColorScheme.primary
const size = '1.2px'
const thickness = '2.5em'

const Outer = styled.div`
  display: flex;
  height: 100%; 
  width: 100%; 
`

const Spinner = styled.div`
  margin: auto auto;
  font-size: ${size};
  position: relative;
  text-indent: -9999em;
  border-top: ${thickness} solid ${color2};
  border-right: ${thickness} solid ${color1};
  border-bottom: ${thickness} solid ${color1};
  border-left: ${thickness} solid ${color1};
  transform: translateZ(0);
  animation: load8 1.1s infinite linear;

  &, &:after {
    border-radius: 50%;
    width: 10em;
    height: 10em;
  }
  @keyframes load8 {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`


const Loader = () =>
  <Outer>
    <Spinner/>
  </Outer>

export default Loader
