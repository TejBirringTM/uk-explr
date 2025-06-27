import { PoolClient } from "pg";

export const dbExists = async (client: PoolClient, dbName: string) => ((await client.query(`SELECT FROM pg_database WHERE datname='${dbName}'`)).rowCount ?? 0) > 0;
export const userExists = async (client: PoolClient, userName: string) => ((await client.query(`SELECT FROM pg_roles WHERE rolname='${userName}' AND rolcanlogin='true'`)).rowCount ?? 0) > 0;
export const roleExists = async (client: PoolClient, userName: string) => ((await client.query(`SELECT FROM pg_roles WHERE rolname='${userName}' AND rolcanlogin='false'`)).rowCount ?? 0) > 0;
export const countRows = async (client: PoolClient, schemaName: string, tableName: string) => parseInt(((await client.query(`SELECT COUNT(*) FROM "${schemaName}"."${tableName}"`)).rows[0].count));