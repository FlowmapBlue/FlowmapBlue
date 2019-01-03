import * as d3dsv from 'd3-dsv';
import * as React from 'react';

const Message = ({ children }: { children: any }) => <div style={{ padding: '1em' }}>{children}</div>;

type State = {
  error: boolean
  data: { [sheet: string]: any }
}

const withFetchGoogleSheet = (sheets: string[]) => (Comp: React.ComponentType<any>) => (
  props: { spreadSheetKey: string }
) => {
  class Fetcher extends React.Component<{}, State> {
    state = {
      error: false,
      data: {},
    };

    componentDidMount() {
      for (const sheet of sheets) {
        this.fetchSheet(sheet)
      }
    }

    fetchSheet(sheet: string) {
      fetch(`https://docs.google.com/spreadsheets/d/${props.spreadSheetKey}/gviz/tq?tqx=out:csv&sheet=${sheet}`)
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
        .then(data => data &&
          this.setState(state => ({
            ...state,
            data: {
              ...state.data,
              [sheet]: d3dsv.csvParse(data)
            }
          }))
        );
    }

    render() {
      const { error } = this.state;
      if (error) {
        return <Message>
          Oops… Couldn't fetch data from{` `}
          <a href={`https://docs.google.com/spreadsheets/d/${props.spreadSheetKey}`}>this spreadsheet</a>.
        </Message>;
      }
      return <Comp {...{ ...props, ...this.state.data }} />;
    }
  }

  return <Fetcher />;
};

export default withFetchGoogleSheet;
