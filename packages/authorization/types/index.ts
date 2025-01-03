export type EnvConfig = {
  DATABASE_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;

  ACCESS_JWT_SECRET: string;
  REFRESH_JWT_SECRET: string;

  ACCESS_JWT_EXPIRE_IN: number;
  REFRESH_JWT_EXPIRE_IN: number;

  ELASTIC_HOST: string;
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
  id: number;
};
