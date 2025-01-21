export const RMQ_PATTERNS = {
  deleteUser: 'delete_user',
};

export const LOG_MESSAGES = {
  inviteesDeletionSuccess: (userId: string, count: number) =>
    `Successfully deleted ${count} invitees for user with ID: ${userId}.`,
  meetupsDeletionSuccess: (userId: string, count: number) =>
    `Successfully deleted ${count} meetups for user with ID: ${userId}.`,
  userDeletionSuccess: (userId: string) =>
    `Deletion process completed successfully for user with ID: ${userId}.`,
  userDeletionError: (userId: string) =>
    `Error occurred while deleting user with ID: ${userId}.`,
} as const;

export const EXCEPTION_MESSAGES = {
  userDeletionError: 'Failed to delete user and associated data.',
} as const;
