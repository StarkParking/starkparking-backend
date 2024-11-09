import { createLogger, format, transports } from 'winston'
import chalk from 'chalk'

const { combine, printf, timestamp } = format

const lFormat = printf(({ level, message, timestamp }) => {
  const str = `${timestamp} ${level.toUpperCase()}: ${message}`

  if (level === 'info') {
    return chalk.green(str)
  } else if (level === 'error') {
    return chalk.red(str)
  } else if (level === 'warn') {
    return chalk.magenta(str)
  } else {
    return chalk.grey(str)
  }
})

const logger = createLogger({
  level: 'debug',
  format: combine(format.splat(), timestamp(), lFormat),
  transports: [new transports.Console()]
})

logger.stream({
  write: text => {
    logger.info(text)
  }
})

export default logger
