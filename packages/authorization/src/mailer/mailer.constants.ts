import { join } from 'path';

export const TEMPLATES_DIR = join(__dirname, '../../templates');

export enum Template {
  verifyEmail = 'verify',
}
