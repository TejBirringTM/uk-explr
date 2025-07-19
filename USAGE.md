# UK Explr Usage

## Overview

There are two parts to UK Explr:

1. To create a database from raw data files. **See: [Initialise Database](#initialise-database).**

2. To serve the data through a REST API endpoint. **See: [Serve Query API](#serve-query-api).**

## Getting Started

1. Create `.env` file in project root directory based on `.env.example`.

## Initialise Database

1. *Optional.* Clear the existing database, if any:

    `npm run uninit`

2. Initialise the new database:

    `npm run init`

3. Start the migration:

    `npm run migrate`

## Serve Query API

1. Start the web server:

    `npm run serve`

2. Make `GET` request(s) to route: `/v1/query-result`

   Note that:
    - The query string is parsed to using the [`qs`](https://www.npmjs.com/package/qs) package.

    - Query parameters are described by the [`QueryRequest`](web-api/models/QueryRequest.ts) schema object.

## Troubleshooting

### Stuck at `Updating lookup table...`

This is due to Postgres not unlocking the lookup table due to a race condition.

To resolve this issue, first cancel execution of the migration script (using the Control + C keys).

Next, find the process that has locked the table using the command:

`lsof -i :<value of PG_PORT in env file>`

You should first check the machine from which the migration script is executed (this will likely be a `node` process).

If no process can be found on the machine from which the migration script is executed, then check the machine hosting the Postgres database (this will likely be a `postgres` process that is NOT the database server, but represents a network connection to the database).

Once the process is identified, kill the process:

`kill -9 <identified process id>`

*where `-9` corresponds to `SIGKILL`*

It might take more than one attempt to kill the process; when the process is killed, the command should print: `no such process`.

You can now rerun the migration script.
