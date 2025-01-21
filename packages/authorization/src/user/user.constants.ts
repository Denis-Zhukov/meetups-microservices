import { join } from 'path';

export const RMQ_MEETUP = Symbol('RMQ_MEETUP');

export const RMQ_REMOVE_MEETUPS_OF_THIS_USER = 'delete_user';

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
  avatarDeleteFailed: (userId: string) =>
    `Failed to delete avatar for user ${userId}`,
  avatarNotFoundForDelete: (userId: string) =>
    `Avatar not found for user ${userId} (cannot delete)`,
  userUpdated: (userId: string) =>
    `User with ID: ${userId} successfully updated`,
  userUpdateFailed: (userId: string) =>
    `Failed to update user with ID: ${userId}`,
  userDeleted: (userId: string) =>
    `User with ID: ${userId} successfully deleted`,
  userNotFoundForDelete: (userId: string) =>
    `User with ID: ${userId} doesn't exist`,
  userDeleteFailed: (userId: string) => `Failed to delete user ${userId}`,
  errorCheckingUsersExist: (users: string[]) =>
    `Error checking if users exist: ${users}`,
} as const;

export const EXCEPTION_ERRORS = {
  fileNotFound: 'File not found',
  userNotFound: 'User not found',
  fileReadingError: 'File reading problem',
  wrongMimeType: `Only ${ALLOWED_EXTENSIONS} are allowed`,
} as const;
