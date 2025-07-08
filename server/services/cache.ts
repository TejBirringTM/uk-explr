import { createCache } from "cache-manager";
import { CacheableMemory, Keyv } from "cacheable";
import KeyvMemcached from "@keyv/memcache";
import config from "@/libs/config";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ApiSuccessResponse } from "../types/api-response";
import type { Locals } from "../types/express";
import { type Request } from "express";
import { hash64 } from "farmhash";

const stores: Keyv<string>[] = [
  // Layer 1 Cache - In-Memory LRU
  new Keyv({
    store: new CacheableMemory(),
  }),
];

// Layer 2 Cache — Memcached
if (config.server.cache.memcachedUrl) {
  stores.push(
    new Keyv({
      store: new KeyvMemcached(config.server.cache.memcachedUrl),
    }),
  );
}

export const cache = createCache({
  stores,
  ttl: config.server.cache.defaultTimeToLiveMs,
});
// .on("set", ({key, value, error})=>{

// });
// .on("del", ({key, error})=>{

// });
// .on("get", ({key, value, error})=>{

// })
// .on("refresh", ({key, value, error})=>{

// })
// .on("clear", (error)=>{

// });

export function generateCacheKey<
  ReqBody extends object | undefined,
  ResBody extends object,
  ReqQuery extends object,
  P = ParamsDictionary,
>(
  req: Request<
    P,
    ApiSuccessResponse<ResBody>,
    ReqBody,
    ReqQuery,
    Locals<ResBody>
  >,
) {
  // produce query string; serialise query params in (consistent) alphabetical order of query param keys
  const normalisedQueryString = new URLSearchParams(
    Object.entries(req.query),
  ).toString();
  // produce unhashed key
  const rawKey = `cache:${req.method}:${req.path}?${normalisedQueryString}`;
  // hash key for consistent length and therefore consistent lookup performance
  const hashedKey = hash64(rawKey).toString();
  return {
    raw: rawKey,
    hashed: hashedKey,
  };
}
