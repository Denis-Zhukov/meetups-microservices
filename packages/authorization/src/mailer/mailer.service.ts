import { Injectable } from '@nestjs/common';
import { MailerService as DefaultMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@/common/types';
import { Template } from '@/mailer/mailer.constants';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailer: DefaultMailerService,
    private readonly cfgService: ConfigService<EnvConfig>
  ) {}

  async sendVerificationEmail(email: string, verificationUrl: string) {
    return this.mailer.sendMail({
      from: `"No Reply" <${this.cfgService.get('EMAIL_USER')}>`,
      to: email,
      subject: 'Verify email 👋',
      text: `Welcome. Verify email: ${verificationUrl}`,
      template: Template.verifyEmail,
      context: { verificationUrl },
    });
  }
}
