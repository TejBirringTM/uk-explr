import {
  Pool,
  type PoolClient,
  type QueryConfig,
  type QueryConfigValues,
  type QueryResultRow,
} from "pg";
import { z } from "zod";
import { logError } from "./error";
import config, { type DbUserKey } from "./config";

type TransactionFn<R> = (client: PoolClient) => Promise<R>;

class Postgres {
  private readonly pool: Pool;
  constructor(user: DbUserKey, dbName: string) {
    this.pool = new Pool({
      host: z.string().nonempty().parse(process.env["PG_HOST"]),
      port: z.coerce.number().int().nonnegative().parse(process.env["PG_PORT"]),
      user: config.dbUsers[user].username,
      password: config.dbUsers[user].password,
      database: dbName,
    });
    this.pool.on("error", (error) => {
      logError(error);
      process.exit(1);
    });
  }
  async query<R extends QueryResultRow = any, I = any[]>(
    queryTextOrConfig: string | QueryConfig<I>,
    values?: QueryConfigValues<I>,
  ) {
    return await this.pool.query<R, I>(queryTextOrConfig, values);
  }
  async transaction<R>(fn: TransactionFn<R>) {
    const client = await this.pool.connect();
    client
      .on("error", (error) => {
        logError(error);
      })
      .on("notice", (notice) => {
        console.log(notice);
      })
      .on("notification", (notification) => {
        console.log(notification);
      });
    try {
      return await fn(client);
    } catch (error) {
      await client.query("ROLLBACK");
      logError(error);
      return null;
    } finally {
      client.release();
    }
  }
  async close() {
    await this.pool.end();
  }
}

const pgClient = (user: DbUserKey, dbName = config.dbms.pg.defaultDb) =>
  new Postgres(user, dbName);
export default pgClient;
