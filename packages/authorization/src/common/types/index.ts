export type EnvConfig = {
  HOST: string;
  PORT: number;
  PROTOCOL: string;

  DATABASE_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;

  ACCESS_JWT_SECRET: string;
  REFRESH_JWT_SECRET: string;

  ACCESS_JWT_EXPIRE_IN: number;
  REFRESH_JWT_EXPIRE_IN: number;

  VERIFY_SECRET: string;
  VERIFY_EXPIRE_IN: number;

  ELASTIC_HOST: string;

  RABBITMQ_HOST: string;
  AUTH_QUEUE: string;
  MEETUP_QUEUE: string;

  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_SECURE: boolean;
  EMAIL_USER: string;
  EMAIL_PASS: string;
};

export type OAuthPayload = {
  email: string;
  name?: string;
  surname?: string;
  picture?: string;
};

export type GoogleProfile = {
  name: {
    familyName: string;
    givenName: string;
  };
  email: string;
  picture: string;
};

export type JwtPayload = {
  id: string;
};
