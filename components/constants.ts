import md5 from 'blueimp-md5';

export const SPREADSHEET_KEY_RE = '[a-zA-Z0-9-_]{44}';
export const FLOWS_SHEET_KEY_RE = '[a-z0-9]{7}';
export const getFlowsSheetKey = (name: string) => md5(name).substr(0, 7);
