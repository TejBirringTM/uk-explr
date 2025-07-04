import { z } from "zod";

const DbUser = z.object({
  username: z.string().nonempty(),
  password: z.string(),
});

const Db = z.object({
  host: z.string().nonempty(),
  port: z.coerce.number().int().nonnegative(),
});

const Config = z.object({
  appName: z
    .string()
    .nonempty()
    .regex(/^(?:[a-z])(?:[a-z0-9\-]+)(?:[a-z0-9])$/), // accept lowercase, must begin with letter, end with letter or number, may contain dashes
  server: z.object({
    port: z.coerce.number().int().nonnegative(),
  }),
  dbms: z.object({
    pg: Db,
    // mongo: Db,
  }),
  dbUsers: z.object({
    pgAdmin: DbUser,
    // mongoAdmin: DbUser,
    editor: DbUser,
    reader: DbUser,
  }),
});

type Config = z.infer<typeof Config>;

export const config = Config.parse({
  appName: process.env["APP_NAME"]!,
  server: {
    port: process.env["PORT"]! as unknown as number,
  },
  dbms: {
    pg: {
      host: process.env["PG_HOST"]!,
      port: process.env["PG_PORT"]! as unknown as number,
    },
    // mongo: {
    //   host: process.env["MONGODB_HOST"]!,
    //   port: process.env["MONGODB_PORT"]! as unknown as number,
    // },
  },
  dbUsers: {
    pgAdmin: {
      username: process.env["PG_ADMIN_USER"]!,
      password: process.env["PG_ADMIN_PWD"]!,
    },
    // mongoAdmin: {
    //   username: process.env["MONGODB_ADMIN_USER"]!,
    //   password: process.env["MONGODB_ADMIN_PWD"]!,
    // },
    editor: {
      username: process.env["ALL_DB_EDITOR_USER"]!,
      password: process.env["ALL_DB_EDITOR_PWD"]!,
    },
    reader: {
      username: process.env["ALL_DB_READER_USER"]!,
      password: process.env["ALL_DB_READER_PWD"]!,
    },
  },
} satisfies Config);

export default config;

type ParsedConfig = z.infer<typeof Config>;
export type DbUserKey = keyof ParsedConfig["dbUsers"];

export const dbName = `${config.appName}-db`;
