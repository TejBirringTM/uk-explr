import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import config from "@/libs/config";
import helmet from "helmet";
import queryController from "./controllers/query.controller";
import rateLimiter from "./middleware/rate-limiter.middleware";
import myIpController from "./controllers/admin/my-ip.controller";
import responseDispatcher from "./middleware/response-dispatcher.middleware";
import errorHandler from "./middleware/error-handler.middleware";
import responseCacher from "./middleware/response-cacher.middleware";

const app = express();
app.set("trust proxy", config.server.nOfTrustedProxies);
app.set("x-powered-by", false);
app.use(
  helmet(),
  morgan("common"),
  cors({
    methods: "GET",
    origin: ["*"],
  }),
  compression(),
);
app.use(rateLimiter());

/**
 * this endpoint serves the query API.
 *
 */
app.get("/v1/query-result", responseCacher(), queryController);

/**
 * this endpoint is used to help derive the correct `NUM_OF_TRUSTED_PROXIES` env var to
 * ensure that the web server deduces the correct IP address of the client in deployment
 * (i.e. behind any number of API gateways, load balancers, and other types of reverse proxies.)
 *
 * Once the correct number has been determined, you may comment out the below line.
 *
 * See:
 *  - https://expressjs.com/en/guide/behind-proxies.html
 *  - https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues
 *
 */
app.get("/admin/my-ip", myIpController);

app.use(responseDispatcher());
app.use(errorHandler());

app.listen(config.server.port, () => {
  console.log(`Server listening on port ${config.server.port}...`);
});
