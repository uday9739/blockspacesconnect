import "dotenv/config";
import { logger, Logger } from "./src/services/bscLogger.js";

import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import db from "./src/models/index.js";

import authenticateUser from "./src/middleware/authenticateUser.js";
import connectorsRouter from "./src/routes/connectors.js";
import platformRouter from "./src/routes/platform.js"
import clientCredentialsRouter from "./src/routes/clientcredentials.js";
import userRouter from "./src/routes/user.js";
import schedulerdefinitionRouter from "./src/routes/schedulerdefinition.js";
import scheduledjobsRouter from "./src/routes/scheduledjobs.js";
import blockflowRouter from "./src/routes/blockflow.js";
import transformationsRouter from "./src/routes/transformations.js";
import transactionsRouter from "./src/routes/transactions.js";
import catalogRouter from "./src/routes/catalog.js";
import orderRouter from './src/routes/order.js';

import cors from "cors";
const app = express();
app.use(cors());
app.options("*", cors());
app.use(Logger.connnectLogger(logger, process.env.LOG_LEVEL));

import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);
//logger.debug("starting", {module: thisModule});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

logger.debug("mongo connect string", { module: thisModule }, { response: process.env.MONGO_CONNECT_STRING });

db.mongoose
  .connect(process.env.MONGO_CONNECT_STRING)
  .then(() => {
    logger.info("Connected to the database!", { module: thisModule });
  })
  .catch((err) => {
    logger.error("Cannot connect to the database!", { module: thisModule }, { error: err.message ? err.message : "failed to connect to the database" });
    process.exit();
  });
app.use("/api/users", userRouter);
app.use("/api/connectors", authenticateUser, connectorsRouter);
app.use("/api/platform", authenticateUser, platformRouter);
app.use("/api/clientcredentials", authenticateUser, clientCredentialsRouter);
app.use("/api/schedulerdefinition", authenticateUser, schedulerdefinitionRouter);
app.use("/api/scheduledjobs", authenticateUser, scheduledjobsRouter);
app.use("/api/blockflow", authenticateUser, blockflowRouter);
app.use("/api/transformations", authenticateUser, transformationsRouter);
app.use("/api/transactions", authenticateUser, transactionsRouter);
app.use("/api/catalog",authenticateUser,catalogRouter);
app.use('/api/order', authenticateUser, orderRouter);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).send(err.message);
});

export default app;
