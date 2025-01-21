import { Module } from '@nestjs/common';
import { MailerModule as DefaultMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TEMPLATES_DIR } from './mailer.constants';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/types';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    DefaultMailerModule.forRootAsync({
      useFactory: (cfgService: ConfigService<EnvConfig>) => ({
        transport: {
          host: cfgService.getOrThrow('EMAIL_HOST'),
          port: cfgService.getOrThrow('EMAIL_PORT'),
          secure: cfgService.getOrThrow('EMAIL_SECURE'),
          auth: {
            user: cfgService.getOrThrow('EMAIL_USER'),
            pass: cfgService.getOrThrow('EMAIL_PASS'),
          },
        },
        template: {
          dir: TEMPLATES_DIR,
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
