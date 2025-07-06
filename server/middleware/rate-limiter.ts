import config from "@/libs/config";
import { rateLimit } from "express-rate-limit";

export default function rateLimiter() {
  return rateLimit({
    windowMs: config.server.rateLimit.windowSizeMs,
    limit: config.server.rateLimit.nOfRequestsPerWindow,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
}
