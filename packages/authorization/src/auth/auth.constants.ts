export const COOKIE_REFRESH_TOKEN = 'refreshToken';

export const getVerifyEmailUrl = (
  protocol: string,
  host: string,
  port: string,
  verifyHash: string
) => `${protocol}://${host}:${port}/api/auth/verify/${verifyHash}`;

export const LOG_MESSAGES = {
  tokensGenerated: (id: string) =>
    `Tokens successfully generated and stored for user with ID: ${id}`,
  errorGeneratingTokens: (id: string) =>
    `Error generating and storing tokens for user with ID: ${id}`,
  userCreated: (email: string) => `User created with email: ${email}`,
  userCreationError: (email: string) =>
    `Error creating user with email: ${email}`,
  duplicateEmail: (email: string) =>
    `Attempt to create user with duplicate email: ${email}`,
  failedLogin: (email: string) =>
    `Failed login attempt: User with email ${email} not found.`,
  emailNotVerified: (email: string) =>
    `Failed login attempt: User with email ${email} not verified.`,
  incorrectPassword: (email: string) =>
    `Failed login attempt: Incorrect password for email ${email}.`,
  errorLoggingIn: (email: string) =>
    `Error occurred while logging in for email ${email}.`,
  userLoggedIn: (email: string) => `User ${email} logged in successfully.`,
  userAuthorized: (email: string) => `User authorized with email: ${email}`,
  tokenRefreshed: (id: string) => `Token refreshed for user with ID: ${id}`,
  verifyEmailError: () => 'Wrong verify hash',
  verifyEmailExpired: (hash: string) => `Verify hash is expired: ${hash}`,
  errorRefreshingToken: (refreshToken: string) =>
    `Error refreshing token: ${refreshToken}`,
} as const;

export const EXCEPTION_MESSAGES = {
  tokenGeneration: 'Error generating tokens',
  registrationAlreadyExists: 'User with this email already exists',
  login: 'Error logging in',
  wrongCredentials: 'Email or password are incorrect',
  emailNotVerified: 'Email is not verified',
  userNotExist: 'User does not exist',
} as const;
