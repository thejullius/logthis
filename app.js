const fetch = require("node-fetch");
const moment = require("moment");
const Pretty = require("pretty-error");
const queryString = require("query-string");

const {
  SLACK_TOKEN: token,
  SLACK_LOG_CHANNEL: channel,
  SLACK_ICON_URL: icon_url,
  SLACK_USERNAME: username,
} = process.env;

const params = {
  token,
  channel,
  icon_url,
  username,
};

const url = "https://slack.com/api";
const headers = { "Content-Type": "application/x-www-form-urlencoded" };

async function postMessage(message) {
  try {
    const options = {
      method: "post",
      headers,
    };

    const query = queryString.stringify({ ...params, ...message });
    await fetch(`${url}/chat.postMessage?${query}`, options);
  } catch (error) {
    console.error(error);
  }
}

async function getHistory(payload) {
  const options = {
    method: "get",
    headers,
  };

  const query = queryString.stringify({ ...params, ...payload });
  return await fetch(`${url}/conversations.history?${query}`, options);
}

function sendNotify({ file, resume, details }) {
  const text = JSON.stringify(details, null, "  ");
  const attachments = [
    {
      fallback: "Error while rendering message",
      pretext: `*${file}*`,
      title: resume.replace(/  +/g, ""),
      color: "#3498db",
      text: `${"```"}${text}${"```"}`,
      ts: moment().format("X"),
    },
  ];

  postMessage({ attachments: JSON.stringify(attachments) });
  console.log({ file, resume, details });
}

async function sendError({ file, payload, error }) {
  const formattedError = new Pretty().withoutColors().render(error);

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${file}*`,
      },
    },
  ];

  const attachments = [
    {
      fallback: "Error while rendering message",
      pretext: "*Error*",
      color: "#e74c3c",
      text: `${"```"}${formattedError}${"```"}`,
      ts: moment().format("X"),
    },
  ];

  if (payload) {
    attachments.push({
      fallback: "Error while rendering message",
      pretext: "*Payload*",
      color: "#023e7d",
      text: `${"```"}${JSON.stringify(payload, null, 2)}${"```"}`,
    });
  }

  const options = {
    text: `New error in ${file}`,
    attachments: JSON.stringify(attachments),
    blocks: JSON.stringify(blocks),
  };

  const response = await getHistory({
    oldest: moment().startOf("day").format("X"),
    latest: moment().endOf("day").format("X"),
  });

  const { messages } = await response.json();

  for (const message of messages) {
    if (message.text === options.text) {
      options.thread_ts = message.ts;
      break;
    }
  }

  postMessage(options);

  console.log(new Pretty().render(error));
}

function configure(options) {
  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      params[key] = options[key];
    }
  }
}

module.exports = { sendError, sendNotify, configure };
