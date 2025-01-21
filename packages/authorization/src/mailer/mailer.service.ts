import { Injectable } from '@nestjs/common';
import { MailerService as DefaultMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/types';
import { LoggerService } from '@/logger/logger.service';
import { LOG_MESSAGES, verificationEmail } from './mailer.constants';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailer: DefaultMailerService,
    private readonly cfgService: ConfigService<EnvConfig>,
    private readonly logger: LoggerService
  ) {}

  public async sendVerificationEmail(email: string, verificationUrl: string) {
    try {
      this.logger.log(LOG_MESSAGES.sendingVerificationEmail(email));

      return this.mailer.sendMail({
        from: verificationEmail.from(this.cfgService.get('EMAIL_USER')),
        to: email,
        subject: verificationEmail.subject,
        text: verificationEmail.text(verificationUrl),
        template: verificationEmail.template,
        context: { verificationUrl },
      });
    } catch (error) {
      this.logger.error(
        LOG_MESSAGES.errorSendingVerificationEmail(email),
        error.stack
      );
      throw error;
    }
  }
}
