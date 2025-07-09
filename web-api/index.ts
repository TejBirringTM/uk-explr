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

app.get("/v1/query-result", responseCacher(), queryController);

app.get("/admin/my-ip", myIpController);

app.use(responseDispatcher());
app.use(errorHandler());

app.listen(config.server.port, () => {
  console.log(`Server listening on port ${config.server.port}...`);
});
