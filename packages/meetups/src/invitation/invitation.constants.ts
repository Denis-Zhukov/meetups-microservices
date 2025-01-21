export const RMQ_CHECK_USERS_EXIST = 'all_users_exist';

export const RESPONSES = {
  usersAdded: (count: number) => `${count} users successfully added to meetup`,
  usersRemoved: (count: number) => `${count} users removed from meetups`,
} as const;

export const LOG_MESSAGES = {
  meetupNotFound: (meetupId: string) => `Meetup with ID ${meetupId} not found.`,
  notMeetupCreator: (creatorId: string, meetupId: string) =>
    `User ${creatorId} is not the creator of meetup ${meetupId}.`,
  usersDoNotExist: (users: string[]) =>
    `One or more users do not exist: ${users.join(', ')}`,
  usersAddedToMeetup: (meetupId: string, count: number) =>
    `${count} users successfully added to meetup ${meetupId}.`,
  errorAddingUsersToMeetup: (meetupId: string) =>
    `Error adding users to meetup ${meetupId}.`,
  notCreator: (userId: string, meetupId: string) =>
    `User ${userId} is not the creator of meetup ${meetupId} and cannot remove users.`,
  noUsersRemoved: (meetupId: string) =>
    `No users were removed from meetup ${meetupId}`,
  errorRemovingUsers: (meetupId: string) =>
    `Error removing users from meetup ${meetupId}`,
  invitationAlreadyAccepted: (userId: string, meetupId: string) =>
    `User ${userId} attempted to accept an already accepted invitation for meetup ${meetupId}.`,
  invitationAccepted: (userId: string, meetupId: string) =>
    `User ${userId} accepted the invitation for meetup ${meetupId}.`,
  errorAcceptingInvitation: (userId: string, meetupId: string) =>
    `Error accepting invitation for user ${userId} and meetup ${meetupId}.`,
  invitationDeclined: (userId: string, meetupId: string) =>
    `User ${userId} declined the invitation for meetup ${meetupId}.`,
  invitationAlreadyDeclined: (userId: string, meetupId: string) =>
    `User ${userId} attempted to decline an already declined invitation for meetup ${meetupId}.`,
  errorDecliningInvitation: (userId: string, meetupId: string) =>
    `Error declining invitation for user ${userId} and meetup ${meetupId}.`,
} as const;

export const EXCEPTION_MESSAGES = {
  meetupNotFound: (meetupId: string) => `Meetup with ID ${meetupId} not found.`,
  notMeetupCreator: (meetupId: string) =>
    `You are not the creator of meetup ${meetupId}.`,
  usersDoNotExist: () => `One or more users do not exist.`,
  errorAddingUsersToMeetup: () => `Failed to add users to meetup.`,
  noPermission: 'You do not have permission to remove users from this meetup',
  invitationAlreadyAccepted: 'Invitation already accepted',
  invitationNotFound: 'Invitation not found',
  invitationAlreadyDeclined: 'Invitation already declined',
} as const;
