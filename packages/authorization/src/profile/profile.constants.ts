import { join } from 'path';

export const IMAGES_DIR = join(__dirname, '../../uploads');

export const MAX_FILENAME_LENGTH = 100;

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];

export const ALLOWED_EXTENSIONS = ['PNG', 'JPEG'];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

export const LOG_MESSAGES = {
  avatarUpdated: (userId: string, filename: string) =>
    `Avatar successfully updated for user ${userId}: ${filename}`,
  avatarUpdateFailed: (userId: string, filename: string) =>
    `Failed to update avatar for user ${userId}: ${filename}`,
  avatarNotFound: (filePath: string) => `Avatar file not found: ${filePath}`,
  avatarReadError: (filePath: string) =>
    `Error reading avatar file: ${filePath}`,
  unexpectedFetchingAvatar: (filePath: string) =>
    `Unexpected error while fetching file ${filePath}`,
  avatarDeleted: (userId: string, filename: string) =>
    `Avatar successfully deleted for user ${userId}: ${filename}`,
  avatarDeleteFailed: (userId: string, filename: string) =>
    `Failed to delete avatar for user ${userId}: ${filename}`,
  avatarNotFoundForDelete: (userId: string) =>
    `Avatar not found for user ${userId} (cannot delete)`,
};
