import { z } from "zod";
import pkg from "@/package.json";

const DbUser = z.object({
  username: z.string().nonempty(),
  password: z.string(),
});

const Db = z.object({
  host: z.string().nonempty(),
  port: z.coerce.number().int().nonnegative(),
  defaultDb: z.string().nonempty(),
});

const Config = z.object({
  appName: z
    .string()
    .nonempty()
    .regex(/^(?:[a-z])(?:[a-z0-9\-]+)(?:[a-z0-9])$/), // accept lowercase, must begin with letter, end with letter or number, may contain dashes
  verbose: z.boolean(),
  server: z.object({
    port: z.coerce.number().int().nonnegative(),
    nOfTrustedProxies: z.coerce.number().int().nonnegative(),
    rateLimit: z.object({
      windowSizeMs: z.coerce.number().int().nonnegative(),
      nOfRequestsPerWindow: z.coerce.number().int().nonnegative(),
    }),
    cache: z.object({
      defaultTimeToLiveMs: z.coerce.number().int().nonnegative(),
    }),
    memcachedUrl: z.string().or(z.null()),
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
  appName: pkg.name, //process.env["APP_NAME"]!,
  verbose:
    process.env["VERBOSE"] && process.env["VERBOSE"].toLowerCase() === "true"
      ? true
      : false,
  server: {
    port: process.env["PORT"] as unknown as number,
    nOfTrustedProxies: process.env[
      "NUM_OF_TRUSTED_PROXIES"
    ] as unknown as number,
    cache: {
      defaultTimeToLiveMs: process.env["CACHE_TTL_MS"] as unknown as number,
    },
    rateLimit: {
      windowSizeMs: process.env[
        "RATE_LIMIT_WINDOW_SIZE_MS"
      ] as unknown as number,
      nOfRequestsPerWindow: process.env[
        "RATE_LIMIT_NUM_OF_REQUEST_P_WINDOW"
      ] as unknown as number,
    },
    memcachedUrl: process.env["MEMCACHED_URL"] ?? null,
  },
  dbms: {
    pg: {
      host: process.env["PG_HOST"]!,
      port: process.env["PG_PORT"] as unknown as number,
      defaultDb: process.env["PG_DB"]!,
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
