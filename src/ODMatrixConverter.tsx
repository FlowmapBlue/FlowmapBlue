import React, { useCallback, useState } from 'react'
import Nav from './Nav';
import styled from '@emotion/styled';
import { Button, Classes, H5, Intent, TextArea } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { tsvFormatRows, tsvParseRows } from 'd3-dsv';

const ContentBody = styled.div`
  padding: 30px 30px;
  & h1 { font-size: 2rem; }
  & li { margin: 0.5em 0; }
  margin: auto;
  max-width: 1500px;
`

const ConverterContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr min-content 1fr;
  grid-template-rows: min-content 1fr;
  column-gap: 1rem;
  row-gap: 0.2rem;
  align-items: center;
  & > textarea {
    min-height: 300px;
    height: 100%;
    font-size: 12px !important; 
    white-space: nowrap;
    font-family: monospace;
  }
`

function convert(inputTsv: string) {
  const inputRows = tsvParseRows(inputTsv)
  const outputRows = [['origin', 'dest', 'count']]
  if (inputRows.length > 0) {
    const header = inputRows[0]
    for (let i = 1; i < inputRows.length; i++) {
      const row = inputRows[i]
      if (row.length > 0) {
        for (let j = 1; j < row.length; j++) {
          outputRows.push([
            row[0],
            header.length > j ? header[j] : `col${j+1}`,
            row[j]
          ])
        }
      }
    }
  }
  return tsvFormatRows(outputRows)
}

const ODMatrixConverter = () => {
  const [input, setInput] = useState(
    tsvFormatRows([
      ['', 'Paris', 'Berlin', 'London'],
      ['Paris', '100', '200', '20'],
      ['Berlin', '300', '50', '30'],
      ['London', '140', '20', '10'],
    ])
  )
  const [output, setOutput] = useState(convert(input))
  const handleConvert = useCallback(
    () => {
      setOutput(convert(input))
    },
    [input]
  )
  return (
    <>
      <Nav />
      <ContentBody className={Classes.DARK}>
        <h1>OD-matrix converter</h1>
        <section>
          <p>Often OD-data comes in the form of an OD-matrix:
            the rows are the origins, the columns are the destinations and the trip counts are in the cells.
          </p>
          <p>
            This utility can help you converting an OD-matrix dataset
            into the form suitable for flowmap.blue
            by unpivoting the destinations.
          </p>
        </section>
        <ConverterContainer>
          <H5>Input OD-matrix TSV (tab-separated values)</H5>
          <span/>
          <H5>Output TSV</H5>
          <TextArea
            growVertically={false}
            large={true}
            intent={Intent.PRIMARY}
            onChange={event => setInput(event.target.value)}
            value={input}
          />
          <Button
            large={true}
            icon={IconNames.ARROW_RIGHT}
            rightIcon={IconNames.ARROW_RIGHT}
            onClick={handleConvert}
          >Convert</Button>
          <TextArea
            growVertically={false}
            large={true}
            intent={Intent.PRIMARY}
            onChange={console.log}
            value={output}
          />
        </ConverterContainer>
        <br/>
        <section>
          <p>You can copy-paste these data directly from and to your Google spreadsheet.</p>
        </section>
      </ContentBody>
    </>
  )
}

export default ODMatrixConverter
