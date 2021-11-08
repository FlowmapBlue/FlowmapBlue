import md5 from 'blueimp-md5';
import { UrlObject } from 'url';

export const SPREADSHEET_KEY_RE = '[a-zA-Z0-9-_]{44}';
export const FLOWS_SHEET_KEY_RE = '[a-z0-9]{7}';

export const getFlowsSheetKey = (name: string) => md5(name).substr(0, 7);

export const makeGSheetsMapUrl = (
  spreadSheetKey: string,
  flowsSheetName: string | undefined,
  embed: boolean | undefined,
  queryParams?: Record<string, string | string[] | undefined>
): UrlObject => {
  const flowsSheetKey = flowsSheetName ? getFlowsSheetKey(flowsSheetName) : undefined;
  return {
    pathname: flowsSheetKey
      ? `/[id]/[sheet]/${embed ? '/embed' : ''}`
      : `/[id]/${embed ? '/embed' : ''}`,
    query: {
      ...queryParams,
      id: spreadSheetKey,
      ...(flowsSheetKey ? { sheet: flowsSheetKey } : {}),
    },
  };
};
