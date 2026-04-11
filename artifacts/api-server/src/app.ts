import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { startScanner } from "./services/scanner";
import { verifyTelegramConnection } from "./services/telegram";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

async function init(): Promise<void> {
  await verifyTelegramConnection().catch(err =>
    logger.warn({ err }, "Telegram connection check failed on startup")
  );

  startScanner().catch(err =>
    logger.error({ err }, "Scanner startup error")
  );
}

init().catch(err => logger.error({ err }, "Init error"));

export default app;
