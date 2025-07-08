import config from "@/libs/config";
import { MemoryStore, rateLimit, type Store } from "express-rate-limit";
import { MemcachedStore } from "rate-limit-memcached";

export default function rateLimiter() {
  let store: Store = new MemoryStore();
  if (config.server.memcachedUrl) {
    console.log("Rate Limiter is using Memcached.");
    store = new MemcachedStore({
      prefix: "rate-limit:",
      locations: [config.server.memcachedUrl],
    });
  }

  return rateLimit({
    windowMs: config.server.rateLimit.windowSizeMs,
    limit: config.server.rateLimit.nOfRequestsPerWindow,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store,
  });
}
