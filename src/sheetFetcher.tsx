import { connect } from 'react-refetch'

const sheetFetcher = connect.defaults({

  fetch: ((input: RequestInfo, init: RequestInit) => {
    const req = new Request(input, init)
    req.headers.set('Content-Type', 'text/plain') // to avoid slow CORS pre-flight requests
    return fetch(req)
  }) as any,

  handleResponse: function (response) {
    if (response.headers.get('content-length') === '0' || response.status === 204) {
      return
    }
    const text = response.text()
    if (response.status >= 200 && response.status < 300) {
      return text.then((text: string) => new Promise((resolve, reject) => {
        let rows
        try {
          const json = getJson(text) as SheetData
          rows = getSheetDataAsArray(json)
          if (json.status !== 'ok') {
            throw new Error(`Error loading data from Google Sheets`);
          }
          resolve(rows)
        } catch (err) {
          console.error(err)
          reject(err)
        }
      }))
    } else {
      return text.then((cause: any) => Promise.reject(new Error(cause)))
    }
  }
})

export default sheetFetcher

const BASE_URL = `https://docs.google.com/spreadsheets/d`

export const makeSheetQueryUrl = (spreadSheetKey: string, sheet: string, query: string) =>
  `${BASE_URL}/${spreadSheetKey}/gviz/tq?tq=${encodeURI(`${query} OPTIONS no_format`)}&tqx=out:json&sheet=${sheet}`

function getJson(text: string) {
  const startIdx = text.indexOf('{')
  const endIdx = text.lastIndexOf('}')
  if (startIdx >= 0 && endIdx >= startIdx) {
    return JSON.parse(text.substring(startIdx, endIdx + 1))
  }
}

type CellValue = {
  v: string | number,
  f: string,
}

type SheetData = {
  version: string,
  status: string,
  table: {
    cols: {
      id: string,
      label: string,
      type: string,
    }[],
    rows: {
      c: CellValue[]
    }[],
  }
};

function getSheetDataAsArray(data: SheetData) {
  if (!data || !data.table || !data.table.cols || !data.table.rows) {
    return []
  }
  const numCols = data.table.cols.length
  let rows, colNames: string[]
  if (!data.table.cols.find(col => col.label != null && col.label.length > 0)) {
    // header row was not properly recognized
    rows = data.table.rows.slice(1)
    colNames = data.table.rows[0].c.map(({ v, f }) => `${v != null ? v : f}`.trim())
  } else {
    rows = data.table.rows
    colNames = data.table.cols.map(({ label }) => `${label}`.trim())
  }
  return rows.map(row => {
    const obj: { [key: string]: string | number } = {}
    for (let i = 0; i < numCols; i++) {
      try {
        const colName = `${colNames[i]}`.trim()
        if (row.c && row.c[i]) {
          const val = row.c[i]
          obj[colName] = `${val.v != null ? val.v : val.f}`.trim()
        }
      } catch (err) {
        console.warn(`Couldn't parse row ${i} from sheet`)
      }
    }
    return obj
  })
}
