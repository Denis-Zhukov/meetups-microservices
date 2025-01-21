export type EnvConfig = {
  PORT: string;
  ELASTIC_HOST: string;

  RABBITMQ_HOST: string;
  AUTH_QUEUE: string;
  MEETUP_QUEUE: string;
};

export type UserPayload = {
  id: string;
};
