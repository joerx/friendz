# Friends API

## Requirements

- NodeJS 6.x

## Running

- Recommended to use docker-compose
- Start the server: `docker-compose up`
- API will listen on port 3000 by default

## Tests

- Standalone: `npm test`
- Via docker: `docker-compose run app test`   

## Migrations

- Create migration: `docker-compose run app run migrate:make create_friendships`
