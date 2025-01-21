export const LOG_MESSAGES = {
  getMeetupsInRadiusSuccess: (
    latitude: number,
    longitude: number,
    radius: number
  ) =>
    `Successfully fetched meetups within ${radius} meters of coordinates (latitude: ${latitude}, longitude: ${longitude}).`,
  getMeetupsInRadiusError: (
    latitude: number,
    longitude: number,
    radius: number
  ) =>
    `Error fetching meetups within ${radius} meters of coordinates (latitude: ${latitude}, longitude: ${longitude}).`,
  searchMeetupsSuccess: (text: string) =>
    `Successfully fetched meetups with search text: "${text}".`,
  searchMeetupsError: (text: string) =>
    `Error fetching meetups with search text: "${text}".`,
  meetupFetchSuccess: (id: string) =>
    `Successfully fetched meetup with ID ${id}.`,
  meetupFetchError: (id: string) => `Error fetching meetup with ID ${id}.`,
  meetupNotFound: (id: string) => `Meetup with ID ${id} not found.`,
  meetupsFetchSuccess: (userId: string, skip: number, take: number) =>
    `Successfully fetched meetups for user ${userId} with skip: ${skip}, take: ${take}.`,
  meetupsFetchError: (userId: string, skip: number, take: number) =>
    `Error fetching meetups for user ${userId} with skip: ${skip}, take: ${take}.`,
  meetupCreated: (meetupId: string) =>
    `Meetup with ID ${meetupId} created successfully.`,
  meetupLocationUpdated: (meetupId: string) =>
    `Location for meetup with ID ${meetupId} updated successfully.`,
  meetupIndexingSuccess: (meetupId: string) =>
    `Meetup with ID ${meetupId} indexed in Elasticsearch successfully.`,
  meetupCreationError: 'Error adding new meetup.',
  meetupLocationUpdateError: (meetupId: string) =>
    `Error updating location for meetup with ID ${meetupId}.`,
  meetupUpdated: (meetupId: string, userId: string) =>
    `Meetup with ID ${meetupId} updated successfully by user ${userId}.`,
  meetupUpdateError: (meetupId: string, userId: string) =>
    `Error updating meetup with ID ${meetupId} for user ${userId}.`,
  meetupDeleted: (meetupId: string, userId: string) =>
    `Meetup with ID ${meetupId} has been deleted by user ${userId}.`,
  meetupDeleteError: (meetupId: string, userId: string) =>
    `Error deleting meetup with ID ${meetupId} for user ${userId}.`,
} as const;

export const EXCEPTION_MESSAGES = {
  getMeetupsInRadiusError: 'Error fetching meetups in radius.',
  searchMeetupsError: 'Error searching for meetups.',
  meetupNotFound: (id: string) => `Meetup with ID ${id} not found.`,
  meetupsFetchError: 'Error fetching meetups.',
  meetupCreationError: 'Error adding meetup.',
  meetupUpdateError: 'Error updating meetup.',
  meetupDeleteError: 'Error deleting meetup.',
} as const;
