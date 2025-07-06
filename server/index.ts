import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import config from "@/libs/config";
import helmet from "helmet";
import validateRequestBody from "./middleware/validate-request-body.middleware";
import QueryRequest from "./models/QueryRequest";
import queryController from "./controllers/query.controller";
import transmitValidatedResponse from "./middleware/transmit-validated-response.middleware";
import transmitErrors from "./middleware/transmit-errors.middleware";
import rateLimiter from "./middleware/rate-limiter";
import { declareController } from "./utils/declare-controller";
import myIpController from "./controllers/admin/my-ip.controller";

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

app.get(
  "/",
  rateLimiter(),
  express.urlencoded({
    extended: true, // request body is parsed using the qs library (https://www.npmjs.org/package/qs#readme)
    limit: "100kb",
    parameterLimit: 100,
  }),
  queryController,
);

app.get("/admin/my-ip", rateLimiter(), myIpController);

app.use(transmitValidatedResponse());
app.use(transmitErrors());

app.listen(config.server.port, () => {
  console.log(`Server listening on port ${config.server.port}...`);
});
