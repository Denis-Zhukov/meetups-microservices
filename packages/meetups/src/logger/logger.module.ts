import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ConfigService } from '@nestjs/config';
import { createLogger, format, Logger, transports } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { EnvConfig } from '@/common/types';
import { INDEX } from '@/logger/logger.constants';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: Logger,
      useFactory: (cfgService: ConfigService<EnvConfig>) => {
        const esTransport = new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: cfgService.getOrThrow('ELASTIC_HOST'),
          },
          indexPrefix: INDEX,
        });

        return createLogger({
          transports: [
            new transports.Console({
              format: format.combine(format.colorize(), format.simple()),
            }),
            esTransport,
          ],
        });
      },
      inject: [ConfigService],
    },
    LoggerService,
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
