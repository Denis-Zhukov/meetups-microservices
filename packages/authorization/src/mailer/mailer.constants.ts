import { join } from 'path';

export const TEMPLATES_DIR = join(__dirname, '../../templates');

export enum Template {
  verifyEmail = 'verify',
}

export const LOG_MESSAGES = {
  sendingVerificationEmail: (email: string) =>
    `Sending verification email to ${email}.`,
  errorSendingVerificationEmail: (email: string) =>
    `Error sending verification email to ${email}.`,
};

export const verificationEmail = {
  from: (email: string) => `"No Reply" <${email}>`,
  subject: 'Verify email 👋',
  text: (url: string) => `Welcome. Verify email: ${url}`,
  template: Template.verifyEmail,
};
