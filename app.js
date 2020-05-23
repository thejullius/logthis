import moment from 'moment'
import Pretty from 'pretty-error'
import stackTrace from 'stack-trace'

const { SLACK_LOG, SLACK_CHANNEL, NODE_ENV } = process.env
const slack = require('slack-notify')(SLACK_LOG)
slack.onError = function (err) {
  console.log('API error:', err)
}

class LogController {
  sendNotify({ file, resume, details }) {
    const text = JSON.stringify(details, null, '  ')
    const attachments = [
      {
        fallback: 'Error while rendering message',
        pretext: `*${file}*`,
        title: resume.replace(/  +/g, ''),
        color: '#3498db',
        text: `${'```'}${text}${'```'}`,
        ts: moment().format('X')
      }
    ]
    this.sendSlackMessage({ attachments })
    console.log({ file, resume, details })
  }

  async sendError({ error, payload }) {
    const [{ fileName, functionName }] = stackTrace.parse(error)

    const pathOrFunction =
      functionName || fileName.split('/').slice(-3).join('/')

    const formattedError = new Pretty().withoutColors().render(error)

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Something went wrong in ${pathOrFunction}*`
        }
      }
    ]

    const attachments = [
      {
        fallback: 'Error while rendering message',
        color: '#e74c3c',
        text: `${'```'}${formattedError}${'```'}`,
        ts: moment().format('X')
      },
      {
        fallback: 'Error while rendering message',
        pretext: '*Payload*',
        color: '#023e7d',
        text: `${'```'}${JSON.stringify(payload, null, 2)}${'```'}`
      }
    ]

    this.sendSlackMessage({
      blocks,
      attachments
    })

    console.log(new Pretty().render(error))
  }

  sendSlackMessage({ attachments, blocks }) {
    const message = {
      channel: SLACK_CHANNEL,
      icon_url: 'https://impulsowork.slack.com/services/BLA0E0RA5',
      username: `Atena - [${NODE_ENV}]`,
      attachments
    }

    !!blocks && (message.blocks = blocks)
    slack.send(message)
  }
}

export default new LogController()
