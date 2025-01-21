# Meetup Management API

This project is a backend API designed for managing meetups, including functionalities for creating, updating, and
managing meetups and invitations. The system supports location-based features, CSV/PDF exports, and Elasticsearch-based
search functionality.

## Features

- Create, update, and delete meetups
- Invite users to meetups
- Accept or decline invitations
- Fetch meetups based on radius or pagination
- Export meetups to CSV or PDF formats
- Search meetups using Elasticsearch

## Prerequisites

Before starting the application, ensure all required environment variables are set in your `.env` file. The application
depends on:

- PostgreSQL database
- Elasticsearch server
- RabbitMQ
- Mail service

Refer to the `.env.example` file for a list of required variables.

## Postman collection
[Postman collection](./meetups.postman_collection.json)

## Getting Started (DOCKER-COMPOSE)

1. **Start docker-compose**
   ```bash
   docker-compose up
   ```

2. **Run database migrations**
   After starting the services, apply the Prisma migrations:
   ```bash
   yarn run migrate:dev
   ```

## Getting Started (MANUAL)

1. **Install dependencies**  
   Use `yarn` to install the necessary dependencies:
   ```bash
   yarn install
   ```

2. **Run database migrations**
   After starting the services, apply the Prisma migrations:
   ```bash
   yarn run migrate:dev
   ```

3. **Run project**  
   Use `yarn` to start services:
   ```bash
   yarn run start:dev
   ```
