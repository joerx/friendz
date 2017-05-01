# Friends API

## Requirements

- NodeJS 6.x, PostGres
- Docker Compose

## Technical Considerations 

- App: Node+Express since I am pretty familiar with it
- Database: PostGres because in development it's faster than MySQL
- No full blown MVC framework since I haven't found any good ones for NodeJS yet
- [Knex.js](http://knexjs.org/) query builder, but not DB agnostic due to some raw queries
- Docker Compose to run in development

## Development Process

- Mostly test driven, tests are organised per user story
- Only high-level API tests here
- Tests are running against actual DB - mocking DB access is usually not worth the trouble
- A larger project might need more fine-grained unit tests

## Running

- Recommended to use docker-compose
- Start the server: `docker-compose up`
- API will listen on port 3000 by default

## Tests

- Standalone: `npm test`
- Via docker: `docker-compose run app test`
- Watch mode: `docker-compose run app run watch` 
- Watch mode will re-run tests after file change, but needs to be restarted for migrations

## Migrations

- Using Knex.js's migration tool
- Migrations are automatically run before tests
- Create migration: `docker-compose run app run migrate:make create_friendships`
- Run migrations: `docker-compose run app run migrate:latest`
