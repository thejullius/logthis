export interface configure {
  token: string,
  channel: string,
  icon_url?: string,
  username?: string
}

export interface sendError {
  file: string,
  error: object,
  payload?: object | string
}

export interface sendNotify {
  file: string,
  resume: string,
  payload?: object | string
}

export declare function configure(payload: configure): void;

export declare function sendError(payload: sendError): void;

export declare function sendNotify(payload: sendNotify): void;
