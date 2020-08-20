declare function configure(
  token: string,
  channel: string,
  icon_url?: string,
  username?: string
): void;

declare function sendError(
  file: string,
  error: object,
  payload?: object | string
): void;

declare function sendNotify(
  file: string,
  resume: string,
  payload?: object | string
): void;
