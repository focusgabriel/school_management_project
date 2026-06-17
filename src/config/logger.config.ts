import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { env } from './env.config';

const streams: pino.TransportTargetOptions[] = [];

if (env.NODE_ENV === 'development') {
  streams.push({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  });
} else {
  streams.push({
    target: 'pino/file',
    options: {
      destination: './logs/app.log',
      mkdir: true,
    },
  });
}

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    targets: streams,
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  base: {
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const createChildLogger = (context: string) => {
  return logger.child({ context });
}; 