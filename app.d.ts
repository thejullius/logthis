export declare function configure(
  token: string,
  channel: string,
  icon_url?: string,
  username?: string
): void;

export declare function sendError(
  file: string,
  error: object,
  payload?: object | string
): void;

export declare function sendNotify(
  file: string,
  resume: string,
  payload?: object | string
): void;
