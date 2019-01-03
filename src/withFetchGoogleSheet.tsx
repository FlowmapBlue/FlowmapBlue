import * as d3dsv from 'd3-dsv';
import * as React from 'react';

export const pipe = (...args: Function[]): Function => (d: any) => args.reduce((m, f) => f(m), d);

const Message = ({ children }: { children: any }) => <div style={{ padding: '1em' }}>{children}</div>;

const withFetchGoogleSheet = (spreadSheetKey: string, sheet: string) => (Comp: React.ComponentType<any>) => (
  props: any,
) => {
  class Fetcher extends React.Component {
    state = {
      error: null,
      data: null,
    };
    componentDidMount() {
      fetch(`https://docs.google.com/spreadsheets/d/${spreadSheetKey}/gviz/tq?tqx=out:csv&sheet=${sheet}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(response.statusText)
          }
          return response.text()
        })
        .catch(reason => {
          console.log(reason);
          this.setState({ error: true });
        })
        .then(data => data && this.setState({ data: d3dsv.csvParse(data) }));
    }
    render() {
      const { error } = this.state;
      if (error) {
        return <Message>
          Oops… Couldn't fetch data from{` `}
          <a href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}/edit?usp=sharing`}>this spreadsheet</a>.
        </Message>;
      }
      return <Comp {...{ ...props, [sheet]: this.state.data }} />;
    }
  }
  return <Fetcher />;
};

export default withFetchGoogleSheet;
