import { PoolClient, Client } from "pg";
import pg from "../../libs/pg";

export const dbExists = async (client: PoolClient, dbName: string) => ((await client.query(`SELECT FROM pg_database WHERE datname='${dbName}'`)).rowCount ?? 0) > 0;
export const userExists = async (client: PoolClient, userName: string) => ((await client.query(`SELECT FROM pg_roles WHERE rolname='${userName}' AND rolcanlogin='true'`)).rowCount ?? 0) > 0;
export const roleExists = async (client: PoolClient, userName: string) => ((await client.query(`SELECT FROM pg_roles WHERE rolname='${userName}' AND rolcanlogin='false'`)).rowCount ?? 0) > 0;
export const countRows = async (client: PoolClient, schemaName: string, tableName: string) => parseInt(((await client.query(`SELECT COUNT(*) FROM "${schemaName}"."${tableName}"`)).rows[0].count));

export const assertTableIsEmpty = async (dbName: string, schemaName: string, tableName: string) => {
    const client = pg("reader", dbName);
    try {
        const nRowsInTable = (await client.query(`SELECT COUNT(*) FROM "${schemaName}"."${tableName}"`)).rows[0].count;
        if (nRowsInTable > 0) {
            console.error(`The table must be empty before migration: "${dbName}"."${schemaName}"."${tableName}"`);
            process.exit(1);
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }

}