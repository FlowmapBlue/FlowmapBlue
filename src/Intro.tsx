import * as React from 'react'

const examples = [
  { key: '1zNbTBLInPOBcCwCDdoSdnnUDdOfDyStFdhPC6nJmBl8', name: 'London bicycle hire' },
  { key: '1IQ0txD09cJ8wsQRSux5AoZfG6eIM-cx6RvVfszZ_ScE', name: 'NYC citibike' },
  { key: '1fhX98NFv5gAkkjB2YFCm50-fplFpmWVAZby3dmm9cgQ', name: 'Chicago taxis' },
]

const Intro = () =>
  <>
    <section className="intro">
      <h1>Blue Arrow Map - Light</h1>
      <p>
        Flow map visualization backed by Google Sheets.
      </p>
      <p>
        Upload your data to Google Sheets to visualize as a flow map.
      </p>
      <h2>Examples</h2>
      <ul>
        {
          examples.map(({ key, name }) =>
            <li key={key}><a href={`/${key}`}>{name}</a></li>
          )
        }
      </ul>
    </section>

    <a href="https://github.com/ilyabo/blue-arrow-map-light">
      <img
        style={{
          position: 'absolute', top: 0, right: 0, border: 0,
        }}
        src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
        alt="Fork me on GitHub" />
    </a>
  </>


export default Intro
